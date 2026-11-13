import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";
import { deleteImageByUrl } from "@/lib/storage";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(10),
  content: z.string().min(10),
  coverUrl: z.string().nullable().optional(),
  categoryId: z.string().min(1),
  secondaryCategoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
  authorName: z.string().optional(),
  status: z.enum(["rascunho", "agendado", "publicado"]),
  focusKeyword: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  readingMinutes: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

async function resolveTagIds(tagIds: string[] = [], tagNames: string[] = []) {
  const ids = [...tagIds];
  for (const name of tagNames) {
    const cleaned = name.trim();
    if (!cleaned) continue;
    const slug = slugify(cleaned);
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: { name: cleaned },
      create: { name: cleaned, slug },
    });
    ids.push(tag.id);
  }
  return Array.from(new Set(ids));
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    let slug = slugify(parsed.data.slug || parsed.data.title);
    const taken = await prisma.blogPost.findFirst({ where: { slug, id: { not: id } } });
    if (taken) slug = `${slug}-${Date.now().toString(36)}`;
    const categoryClash = await prisma.blogCategory.findUnique({ where: { slug } });
    if (categoryClash) slug = `${slug}-artigo`;

    if (existing.coverUrl && existing.coverUrl !== parsed.data.coverUrl) {
      await deleteImageByUrl(existing.coverUrl);
    }

    const tagIds = await resolveTagIds(parsed.data.tagIds, parsed.data.tagNames);
    const content = sanitizeBlogHtml(parsed.data.content);
    const scheduledAt =
      parsed.data.status === "agendado" && parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : null;

    await prisma.blogPostTag.deleteMany({ where: { postId: id } });
    await prisma.blogPostSecondaryCategory.deleteMany({ where: { postId: id } });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt,
        content,
        coverUrl: parsed.data.coverUrl || null,
        categoryId: parsed.data.categoryId,
        authorName: parsed.data.authorName || existing.authorName,
        readingMinutes: parsed.data.readingMinutes || readingTime(content),
        status: parsed.data.status,
        focusKeyword: parsed.data.focusKeyword || null,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        scheduledAt,
        publishedAt:
          parsed.data.status === "publicado"
            ? existing.publishedAt || new Date()
            : parsed.data.status === "agendado"
              ? scheduledAt
              : existing.publishedAt,
        tags: tagIds.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        secondaryCategories: parsed.data.secondaryCategoryIds?.length
          ? { create: parsed.data.secondaryCategoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
    });
    return NextResponse.json(post);
  } catch (err) {
    console.error("[admin/blog PUT]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar artigo" },
      { status: 500 },
    );
  }
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
