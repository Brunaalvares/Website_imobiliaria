import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { isPublicBlogStatus, publicBlogWhere } from "@/lib/blog-publish";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
import { formatDate, whatsappUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (category?.published) {
    const count = await prisma.blogPost.count({
      where: {
        AND: [publicBlogWhere(), { OR: [{ categoryId: category.id }, { secondaryCategories: { some: { categoryId: category.id } } }] }],
      },
    });
    if (count > 0) {
      return {
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description || `Artigos sobre ${category.name}`,
        alternates: { canonical: `/blog/${category.slug}` },
      };
    }
  }

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !isPublicBlogStatus(post.status, post.scheduledAt)) return { title: "Artigo" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
    },
  };
}

async function CategoryPage({
  category,
  page,
}: {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string | null;
  };
  page: number;
}) {
  const pageSize = 9;
  const where = {
    AND: [
      publicBlogWhere(),
      {
        OR: [{ categoryId: category.id }, { secondaryCategories: { some: { categoryId: category.id } } }],
      },
    ],
  };

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="section-pad">
      <div className="container-site">
        <nav className="mb-6 text-sm text-gray-muted">
          <Link href="/" className="hover:text-navy">
            Início
          </Link>
          {" · "}
          <Link href="/blog" className="hover:text-navy">
            Blog
          </Link>
          {" · "}
          <span className="text-navy">{category.name}</span>
        </nav>

        <div className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">{category.name}</h1>
          {category.description ? <p className="mt-4 text-lg text-gray-muted">{category.description}</p> : null}
        </div>

        {category.imageUrl ? (
          <div className="relative mb-10 aspect-[21/8] overflow-hidden rounded-3xl">
            <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="100vw" />
          </div>
        ) : null}

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-[var(--shadow)]">
                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] bg-ice">
                  {post.coverUrl ? (
                    <Image src={post.coverUrl} alt={post.title} fill className="object-cover" sizes="33vw" />
                  ) : null}
                </Link>
                <div className="space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy">{category.name}</p>
                  <h2 className="text-xl font-bold text-navy">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-sm text-gray-muted">
                    {formatDate(post.publishedAt)} · {post.readingMinutes} minutos de leitura
                  </p>
                  <p className="line-clamp-3 text-sm text-gray-muted">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-light bg-ice p-12 text-center text-gray-muted">
            Nenhum artigo nesta editoria.
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={p === 1 ? `/blog/${category.slug}` : `/blog/${category.slug}?page=${p}`}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  p === page ? "bg-navy text-white" : "border border-gray-light bg-white text-navy"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function BlogSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (category?.published) {
    const count = await prisma.blogPost.count({
      where: {
        AND: [
          publicBlogWhere(),
          { OR: [{ categoryId: category.id }, { secondaryCategories: { some: { categoryId: category.id } } }] },
        ],
      },
    });
    if (count > 0) return <CategoryPage category={category} page={page} />;
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
  if (!post || !isPublicBlogStatus(post.status, post.scheduledAt)) notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    prisma.blogPost.findMany({
      where: {
        AND: [
          publicBlogWhere(),
          { id: { not: post.id } },
          post.categoryId
            ? {
                OR: [
                  { categoryId: post.categoryId },
                  { secondaryCategories: { some: { categoryId: post.categoryId } } },
                ],
              }
            : {},
        ],
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
  ]);

  const safeHtml = sanitizeBlogHtml(post.content);
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
        <nav className="mb-6 text-sm text-gray-muted">
          <Link href="/" className="hover:text-navy">
            Início
          </Link>
          {" · "}
          <Link href="/blog" className="hover:text-navy">
            Blog
          </Link>
          {post.category ? (
            <>
              {" · "}
              <Link href={`/blog/${post.category.slug}`} className="hover:text-navy">
                {post.category.name}
              </Link>
            </>
          ) : null}
          {" · "}
          <span className="text-navy">{post.title}</span>
        </nav>

        {post.category ? (
          <Link
            href={`/blog/${post.category.slug}`}
            className="text-sm font-semibold uppercase tracking-wide text-navy hover:underline"
          >
            {post.category.name}
          </Link>
        ) : null}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-gray-muted">{post.excerpt}</p>
        <p className="mt-2 text-sm text-gray-muted">
          Por {post.authorName} · {formatDate(post.publishedAt)} · {post.readingMinutes} min de leitura
        </p>

        {post.coverUrl ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={post.coverUrl} alt={post.title} fill className="object-cover" priority sizes="800px" />
          </div>
        ) : null}

        <div className="prose-blog mt-10" dangerouslySetInnerHTML={{ __html: safeHtml }} />

        {post.tags.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <span key={tag.id} className="rounded-full bg-ice px-3 py-1 text-xs font-medium text-navy">
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

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
                  {item.category ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy">{item.category.name}</p>
                  ) : null}
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
