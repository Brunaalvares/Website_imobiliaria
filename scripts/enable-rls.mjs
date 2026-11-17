/**
 * Aplica prisma/sql/enable_rls.sql no banco e confere o resultado.
 * Uso: node scripts/enable-rls.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

function normalize(raw) {
  if (!raw) return undefined;
  let url = raw.trim();
  const match = url.match(/^(postgresql(?:\+[a-z0-9-]+)?:\/\/)([^:/?#]+):([^@]+)@(.+)$/i);
  if (match) {
    const [, protocol, user, password, rest] = match;
    const decodeSafe = (v) => {
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    };
    url = `${protocol}${encodeURIComponent(decodeSafe(user))}:${encodeURIComponent(decodeSafe(password))}@${rest}`;
  }
  const parsed = new URL(url);
  if (!parsed.searchParams.has("sslmode")) parsed.searchParams.set("sslmode", "require");
  return parsed.toString();
}

process.env.DATABASE_URL = normalize(process.env.DATABASE_URL);
process.env.DIRECT_URL = normalize(process.env.DIRECT_URL);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sqlFile = readFileSync(join(root, "prisma/sql/enable_rls.sql"), "utf8");
// Remove comments and split on semicolons outside dollar-quoted blocks
function splitSql(sql) {
  const statements = [];
  let current = "";
  let inDollar = false;
  for (let i = 0; i < sql.length; i++) {
    if (sql.startsWith("$$", i)) {
      inDollar = !inDollar;
      current += "$$";
      i++;
      continue;
    }
    const ch = sql[i];
    if (ch === ";" && !inDollar) {
      const trimmed = current.replace(/--[^\n]*/g, "").trim();
      if (trimmed) statements.push(trimmed);
      current = "";
      continue;
    }
    current += ch;
  }
  const trimmed = current.replace(/--[^\n]*/g, "").trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

const prisma = new PrismaClient();

try {
  for (const statement of splitSql(sqlFile)) {
    await prisma.$executeRawUnsafe(statement);
  }
  const tables = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS table_name,
           c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `);
  const openGrants = await prisma.$queryRawUnsafe(`
    SELECT table_name, grantee, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
    ORDER BY table_name, grantee, privilege_type
  `);

  const missingRls = tables.filter((t) => !t.rls_enabled);
  console.log(JSON.stringify({ tables, missingRls, openGrants }, null, 2));

  if (missingRls.length > 0) {
    console.error("Falha: ainda há tabelas sem RLS.");
    process.exit(1);
  }
  if (openGrants.length > 0) {
    console.error("Falha: ainda há grants para anon/authenticated/PUBLIC.");
    process.exit(1);
  }
  console.log("OK: RLS habilitado e acesso público via API revogado.");
} finally {
  await prisma.$disconnect();
}
