import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { BlogAdminNav } from "@/components/admin/BlogAdminNav";
import { formatDate, statusLabel } from "@/lib/utils";
import { BlogDeleteButton } from "@/components/admin/BlogDeleteButton";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string }>;
}) {
  const sp = await searchParams;
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        ...(sp.status ? { status: sp.status } : {}),
        ...(sp.categoryId ? { categoryId: sp.categoryId } : {}),
        ...(sp.q
          ? {
              OR: [
                { title: { contains: sp.q, mode: "insensitive" } },
                { excerpt: { contains: sp.q, mode: "insensitive" } },
                { focusKeyword: { contains: sp.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
    prisma.blogCategory.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="space-y-6">
      <BlogAdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Artigos</h1>
          <p className="text-gray-muted">Crie, edite, agende e publique conteúdos do blog.</p>
        </div>
        <Button href="/admin/blog/novo">Novo artigo</Button>
      </div>

      <form className="grid gap-3 rounded-2xl border border-gray-light bg-white p-4 md:grid-cols-4">
        <input name="q" defaultValue={sp.q || ""} className="admin-input" placeholder="Buscar por título ou palavra-chave" />
        <select name="status" defaultValue={sp.status || ""} className="admin-input">
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="agendado">Agendado</option>
          <option value="publicado">Publicado</option>
        </select>
        <select name="categoryId" defaultValue={sp.categoryId || ""} className="admin-input">
          <option value="">Todas as editorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light bg-white p-4">
            <div>
              <Link href={`/admin/blog/${post.id}`} className="font-semibold text-navy hover:underline">
                {post.title}
              </Link>
              <p className="text-sm text-gray-muted">
                {post.category?.name || "Sem editoria"} · {statusLabel(post.status)} ·{" "}
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/blog/${post.id}`} className="underline">
                Editar
              </Link>
              {post.status === "publicado" || post.status === "agendado" ? (
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
            Nenhum artigo encontrado.
          </div>
        ) : null}
      </div>
    </div>
  );
}
