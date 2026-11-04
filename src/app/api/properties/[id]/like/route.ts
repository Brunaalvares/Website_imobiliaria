import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE = "ma_visitor_id";
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const recent = new Map<string, number[]>();

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(key: string) {
  const now = Date.now();
  const list = (recent.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) return false;
  list.push(now);
  recent.set(key, list);
  return true;
}

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ip = getIp(req);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || property.status !== "publicado") {
    return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  }

  const jar = await cookies();
  let visitorId = jar.get(COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
  }

  const ipHash = createHash("sha256").update(ip + (process.env.NEXTAUTH_SECRET || "salt")).digest("hex");

  const existing = await prisma.propertyLike.findUnique({
    where: { propertyId_visitorId: { propertyId: id, visitorId } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.propertyLike.delete({ where: { id: existing.id } });
    await prisma.property.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
    });
    liked = false;
  } else {
    await prisma.propertyLike.create({
      data: { propertyId: id, visitorId, ipHash },
    });
    await prisma.property.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });
    liked = true;
  }

  const updated = await prisma.property.findUnique({ where: { id }, select: { likeCount: true } });
  const response = NextResponse.json({ liked, likeCount: Math.max(0, updated?.likeCount ?? 0) });
  response.cookies.set(COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
