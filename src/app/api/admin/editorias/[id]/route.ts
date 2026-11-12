import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { deleteImageByUrl } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  transferToCategoryId: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.name);
  const taken = await prisma.blogCategory.findFirst({ where: { slug, id: { not: id } } });
  if (taken) slug = `${slug}-${Date.now().toString(36)}`;

  if (existing.imageUrl && existing.imageUrl !== parsed.data.imageUrl) {
    await deleteImageByUrl(existing.imageUrl);
  }

  const item = await prisma.blogCategory.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description || "",
      imageUrl: parsed.data.imageUrl || null,
      order: parsed.data.order ?? existing.order,
      published: parsed.data.published ?? existing.published,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, secondaryPosts: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const transferTo = typeof body.transferToCategoryId === "string" ? body.transferToCategoryId : null;

  if (existing._count.posts > 0 || existing._count.secondaryPosts > 0) {
    if (!transferTo) {
      return NextResponse.json(
        { error: "Transfira os artigos para outra editoria antes de excluir." },
        { status: 400 },
      );
    }
    await prisma.blogPost.updateMany({
      where: { categoryId: id },
      data: { categoryId: transferTo },
    });
    await prisma.blogPostSecondaryCategory.deleteMany({ where: { categoryId: id } });
  }

  await deleteImageByUrl(existing.imageUrl);
  await prisma.blogCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
