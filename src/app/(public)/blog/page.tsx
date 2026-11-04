import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog Imobiliário",
  description:
    "Artigos sobre mercado imobiliário, bairros de São Luís, investimentos, compra e venda e dicas para compradores.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "publicado",
      ...(categoria ? { category: { slug: categoria } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="section-pad">
      <div className="container-site">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-gray-muted">
            Informação para decisões inteligentes no mercado imobiliário de São Luís.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !categoria ? "bg-navy text-white" : "border border-gray-light bg-white text-navy"
            }`}
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?categoria=${c.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                categoria === c.slug
                  ? "bg-navy text-white"
                  : "border border-gray-light bg-white text-navy"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-[var(--shadow)]"
              >
                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] bg-ice">
                  {post.coverUrl ? (
                    <Image src={post.coverUrl} alt={post.title} fill className="object-cover" sizes="33vw" />
                  ) : null}
                </Link>
                <div className="space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-muted">
                    {post.category?.name} · {formatDate(post.publishedAt)} · {post.readingMinutes} min
                  </p>
                  <h2 className="text-xl font-bold text-navy">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="line-clamp-3 text-sm text-gray-muted">{post.excerpt}</p>
                  <p className="text-sm text-gray-muted">Por {post.authorName}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-light bg-ice p-12 text-center text-gray-muted">
            Nenhum artigo publicado nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}
