import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";
import { deleteImageByUrl } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(10),
  content: z.string().min(10),
  coverUrl: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  authorName: z.string().optional(),
  status: z.string(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.title);
  const taken = await prisma.blogPost.findFirst({ where: { slug, id: { not: id } } });
  if (taken) slug = `${slug}-${Date.now().toString(36)}`;

  if (existing.coverUrl && existing.coverUrl !== parsed.data.coverUrl) {
    await deleteImageByUrl(existing.coverUrl);
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverUrl: parsed.data.coverUrl || null,
      categoryId: parsed.data.categoryId || null,
      authorName: parsed.data.authorName || existing.authorName,
      readingMinutes: readingTime(parsed.data.content),
      status: parsed.data.status,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      publishedAt:
        parsed.data.status === "publicado"
          ? parsed.data.publishedAt
            ? new Date(parsed.data.publishedAt)
            : existing.publishedAt || new Date()
          : existing.publishedAt,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await deleteImageByUrl(existing.coverUrl);
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
