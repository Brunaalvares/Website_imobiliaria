import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyNormalizedDatabaseEnv } from "@/lib/db-url";
import { hasSupabaseStorageConfig } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = applyNormalizedDatabaseEnv();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasDirectUrl = Boolean(process.env.DIRECT_URL);
  const hasNextAuthSecret = Boolean(process.env.NEXTAUTH_SECRET);
  const hasStorage = hasSupabaseStorageConfig();

  let database: "ok" | "error" = "error";
  let detail: string | null = null;
  let counts: Record<string, number> | null = null;

  try {
    const [properties, posts, settings] = await Promise.all([
      prisma.property.count(),
      prisma.blogPost.count(),
      prisma.siteSettings.count(),
    ]);
    database = "ok";
    counts = { properties, posts, settings };
  } catch (error) {
    detail = error instanceof Error ? error.message : "unknown database error";
  }

  const ok = database === "ok" && hasDatabaseUrl && hasNextAuthSecret && hasStorage;
  return NextResponse.json(
    {
      ok,
      database,
      detail,
      counts,
      env: {
        hasDatabaseUrl,
        hasDirectUrl,
        hasNextAuthSecret,
        hasAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
        hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasSupabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasStorage,
        databaseHost: safeHost(env.databaseUrl),
      },
    },
    { status: ok ? 200 : 503 },
  );
}

function safeHost(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}
