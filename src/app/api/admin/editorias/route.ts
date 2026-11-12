import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  const items = await prisma.blogCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  let slug = slugify(parsed.data.slug || parsed.data.name);
  if (await prisma.blogCategory.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const item = await prisma.blogCategory.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description || "",
      imageUrl: parsed.data.imageUrl || null,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
    },
  });
  return NextResponse.json(item);
}
