import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  if (!email) return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { email } });
  // Always return success to avoid email enumeration
  if (!admin) return NextResponse.json({ ok: true });

  const raw = randomBytes(32).toString("hex");
  const token = createHash("sha256").update(raw).digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      adminId: admin.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${base}/admin/redefinir-senha?token=${raw}`;
  await sendAdminNotification(
    "Recuperação de senha — área administrativa",
    `<p>Olá, ${admin.name}.</p><p>Use o link abaixo para redefinir sua senha (válido por 1 hora):</p><p><a href="${link}">${link}</a></p>`,
  );

  // In development without SMTP, return token hint only in non-production
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, devResetUrl: link });
  }
  return NextResponse.json({ ok: true });
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const hashed = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashed } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.admin.update({ where: { id: record.adminId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
