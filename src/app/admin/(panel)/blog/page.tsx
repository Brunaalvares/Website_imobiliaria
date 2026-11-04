import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { formatDate, statusLabel } from "@/lib/utils";
import { BlogDeleteButton } from "@/components/admin/BlogDeleteButton";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Blog</h1>
          <p className="text-gray-muted">Gerencie artigos e categorias.</p>
        </div>
        <Button href="/admin/blog/novo">Novo artigo</Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light bg-white p-4">
            <div>
              <Link href={`/admin/blog/${post.id}`} className="font-semibold text-navy hover:underline">
                {post.title}
              </Link>
              <p className="text-sm text-gray-muted">
                {post.category?.name || "Sem categoria"} · {statusLabel(post.status)} ·{" "}
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/blog/${post.id}`} className="underline">
                Editar
              </Link>
              {post.status === "publicado" ? (
                <Link href={`/blog/${post.slug}`} target="_blank" className="underline">
                  Ver
                </Link>
              ) : null}
              <BlogDeleteButton id={post.id} />
            </div>
          </div>
        ))}
        {!posts.length ? (
          <div className="rounded-2xl border border-dashed border-gray-light bg-white p-8 text-center text-gray-muted">
            Nenhum artigo cadastrado.
          </div>
        ) : null}
      </div>
    </div>
  );
}
