import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyNormalizedDatabaseEnv } from "@/lib/db-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = applyNormalizedDatabaseEnv();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasDirectUrl = Boolean(process.env.DIRECT_URL);
  const hasNextAuthSecret = Boolean(process.env.NEXTAUTH_SECRET);

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

  const ok = database === "ok" && hasDatabaseUrl && hasNextAuthSecret;
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
