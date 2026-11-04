import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";


export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [properties, posts] = await Promise.all([
    prisma.property.findMany({
      where: { status: "publicado" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "publicado" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

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
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
