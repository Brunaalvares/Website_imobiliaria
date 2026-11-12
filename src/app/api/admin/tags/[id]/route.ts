import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.name);
  const taken = await prisma.blogTag.findFirst({ where: { slug, id: { not: id } } });
  if (taken) return NextResponse.json({ error: "Já existe uma tag com este nome." }, { status: 409 });

  const tag = await prisma.blogTag.update({
    where: { id },
    data: { name: parsed.data.name.trim(), slug },
  });
  return NextResponse.json(tag);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  await prisma.blogTag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
