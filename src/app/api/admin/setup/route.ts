import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function GET() {
  const count = await prisma.admin.count();
  return NextResponse.json({ needsSetup: count === 0 });
}

export async function POST(req: NextRequest) {
  const count = await prisma.admin.count();
  if (count > 0) {
    return NextResponse.json({ error: "Setup já realizado." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos. Senha com no mínimo 8 caracteres." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const admin = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return NextResponse.json({ ok: true, id: admin.id });
}
