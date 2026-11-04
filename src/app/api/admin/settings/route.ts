import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  brandName: z.string().min(2),
  logoUrl: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  institutionalText: z.string().min(10),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(),
  creci: z.string().optional(),
  footerText: z.string().optional(),
  heroHeadline: z.string().optional(),
  heroSubheadline: z.string().optional(),
  heroImageUrl: z.string().nullable().optional(),
  analyticsId: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFrom: z.string().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  return NextResponse.json(settings);
}
