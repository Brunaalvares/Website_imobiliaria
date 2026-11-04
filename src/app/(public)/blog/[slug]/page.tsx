export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { formatDate, whatsappUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "publicado") return { title: "Artigo" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!post || post.status !== "publicado") notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    prisma.blogPost.findMany({
      where: {
        status: "publicado",
        id: { not: post.id },
        categoryId: post.categoryId ?? undefined,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.authorName },
    description: post.excerpt,
    image: post.coverUrl,
  };

  return (
    <article className="section-pad">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-site max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-muted">
          {post.category?.name} · {formatDate(post.publishedAt)} · {post.readingMinutes} min de leitura
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-gray-muted">{post.excerpt}</p>
        <p className="mt-2 text-sm text-gray-muted">Por {post.authorName}</p>

        {post.coverUrl ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={post.coverUrl} alt={post.title} fill className="object-cover" priority sizes="800px" />
          </div>
        ) : null}

        <div className="prose-blog mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            Compartilhar
          </Button>
          <Button
            href={
              settings.whatsapp
                ? whatsappUrl(settings.whatsapp, `Olá, Marcelo! Li o artigo "${post.title}" e gostaria de conversar.`)
                : "/contato"
            }
            target={settings.whatsapp ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            Falar com o corretor
          </Button>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-gray-light pt-10">
            <h2 className="text-2xl font-bold text-navy">Artigos relacionados</h2>
            <div className="mt-6 space-y-4">
              {related.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="block rounded-xl bg-ice p-4 hover:bg-gray-light">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-muted">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
