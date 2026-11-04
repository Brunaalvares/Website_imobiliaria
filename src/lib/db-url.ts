/**
 * Ensures Postgres URLs work on Vercel when the password has special chars
 * like `#` (must be %23). Also adds serverless-friendly query params.
 */
export function normalizeDatabaseUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  let url = raw.trim();

  // Split protocol://user:password@host/path?query
  const match = url.match(/^(postgresql(?:\+[a-z0-9-]+)?:\/\/)([^:/?#]+):([^@]+)@(.+)$/i);
  if (match) {
    const [, protocol, user, password, rest] = match;
    const encodedPassword = encodeURIComponent(decodeURIComponentSafe(password));
    url = `${protocol}${encodeURIComponent(decodeURIComponentSafe(user))}:${encodedPassword}@${rest}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("sslmode")) parsed.searchParams.set("sslmode", "require");
    // PgBouncer / serverless: keep pool tiny per isolate
    if (!parsed.searchParams.has("connection_limit") && parsed.searchParams.get("pgbouncer") === "true") {
      parsed.searchParams.set("connection_limit", "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function decodeURIComponentSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Apply normalized URLs before PrismaClient reads process.env */
export function applyNormalizedDatabaseEnv() {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  const directUrl = normalizeDatabaseUrl(process.env.DIRECT_URL);

  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
  if (directUrl) process.env.DIRECT_URL = directUrl;

  return { databaseUrl, directUrl };
}
