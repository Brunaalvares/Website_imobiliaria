import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicBlogWhere } from "@/lib/blog-publish";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [properties, posts, categories] = await Promise.all([
    prisma.property.findMany({
      where: { status: "publicado" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: publicBlogWhere(),
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogCategory.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    }),
  ]);

  const categoriesWithPosts = [];
  for (const category of categories) {
    const count = await prisma.blogPost.count({
      where: {
        AND: [
          publicBlogWhere(),
          {
            OR: [
              { categoryId: category.id },
              { secondaryCategories: { some: { categoryId: category.id } } },
            ],
          },
        ],
      },
    });
    if (count > 0) categoriesWithPosts.push(category);
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/imoveis`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contato`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termos-de-uso`, changeFrequency: "yearly", priority: 0.3 },
    ...properties.map((p) => ({
      url: `${base}/imoveis/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categoriesWithPosts.map((c) => ({
      url: `${base}/blog/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
