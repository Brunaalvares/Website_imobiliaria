import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { deleteImageByUrl } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const item = await prisma.neighborhood.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.slug || parsed.data.name),
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.neighborhood.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await deleteImageByUrl(existing.imageUrl);
  await prisma.neighborhood.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
