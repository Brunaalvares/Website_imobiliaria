import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicBlogWhere } from "@/lib/blog-publish";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog Imobiliário",
  description:
    "Artigos sobre compra, aluguel, financiamento, investimentos e mercado imobiliário.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const pageSize = 9;

  const categories = await prisma.blogCategory.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const where = publicBlogWhere();
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
        <div className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-gray-muted">
            Informação para decisões inteligentes no mercado imobiliário.
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Link href="/blog" className="whitespace-nowrap rounded-full bg-navy px-4 py-2 text-sm font-medium text-white">
            Todos os artigos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog/${c.slug}`}
              className="whitespace-nowrap rounded-full border border-gray-light bg-white px-4 py-2 text-sm font-medium text-navy"
            >
              {c.name}
            </Link>
          ))}
        </div>

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
                  {post.category ? (
                    <Link
                      href={`/blog/${post.category.slug}`}
                      className="text-xs font-semibold uppercase tracking-wide text-navy hover:underline"
                    >
                      {post.category.name}
                    </Link>
                  ) : null}
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
            Nenhum artigo publicado ainda.
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={p === 1 ? "/blog" : `/blog?page=${p}`}
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
