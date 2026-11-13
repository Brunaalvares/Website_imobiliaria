import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";
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

export async function GET(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    return NextResponse.json(
      await prisma.blogPost.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { excerpt: { contains: q, mode: "insensitive" } },
                  { focusKeyword: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
          category: true,
          tags: { include: { tag: true } },
          secondaryCategories: { include: { category: true } },
        },
      }),
    );
  } catch (err) {
    console.error("[admin/blog GET]", err);
    return NextResponse.json({ error: "Erro ao listar artigos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdminApi();
  if (error) return error;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    let slug = slugify(parsed.data.slug || parsed.data.title);
    if (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    if (await prisma.blogCategory.findUnique({ where: { slug } })) {
      slug = `${slug}-artigo`;
    }

    const tagIds = await resolveTagIds(parsed.data.tagIds, parsed.data.tagNames);
    const content = sanitizeBlogHtml(parsed.data.content);
    const scheduledAt =
      parsed.data.status === "agendado" && parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : null;

    const post = await prisma.blogPost.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt,
        content,
        coverUrl: parsed.data.coverUrl || null,
        categoryId: parsed.data.categoryId,
        authorId: session!.user.id,
        authorName: parsed.data.authorName || "Marcelo Alvares",
        readingMinutes: parsed.data.readingMinutes || readingTime(content),
        status: parsed.data.status,
        focusKeyword: parsed.data.focusKeyword || null,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        scheduledAt,
        publishedAt:
          parsed.data.status === "publicado"
            ? new Date()
            : parsed.data.status === "agendado"
              ? scheduledAt
              : null,
        tags: tagIds.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        secondaryCategories: parsed.data.secondaryCategoryIds?.length
          ? { create: parsed.data.secondaryCategoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error("[admin/blog POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao publicar artigo" },
      { status: 500 },
    );
  }
}
