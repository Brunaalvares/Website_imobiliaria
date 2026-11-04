import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";

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

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json(
    await prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
  );
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.title);
  if (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverUrl: parsed.data.coverUrl || null,
      categoryId: parsed.data.categoryId || null,
      authorId: session!.user.id,
      authorName: parsed.data.authorName || "Marcelo Alvares",
      readingMinutes: readingTime(parsed.data.content),
      status: parsed.data.status,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      publishedAt:
        parsed.data.status === "publicado"
          ? parsed.data.publishedAt
            ? new Date(parsed.data.publishedAt)
            : new Date()
          : null,
    },
  });
  return NextResponse.json(post);
}
