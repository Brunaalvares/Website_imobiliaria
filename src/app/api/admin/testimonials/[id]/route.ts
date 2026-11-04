import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

const schema = z.object({
  clientName: z.string().min(2),
  photoUrl: z.string().nullable().optional(),
  text: z.string().min(5),
  dealType: z.string(),
  dealDate: z.string().nullable().optional(),
  authorized: z.boolean(),
  published: z.boolean(),
  showOnHome: z.boolean().optional(),
  order: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  if (parsed.data.published && !parsed.data.authorized) {
    return NextResponse.json({ error: "Publicação exige autorização do cliente." }, { status: 400 });
  }
  const item = await prisma.testimonial.update({
    where: { id },
    data: {
      ...parsed.data,
      dealDate: parsed.data.dealDate ? new Date(parsed.data.dealDate) : null,
      showOnHome: parsed.data.showOnHome ?? false,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await deleteImageByUrl(existing.photoUrl);
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
