import { BlogForm } from "@/components/admin/BlogForm";
import { BlogAdminNav } from "@/components/admin/BlogAdminNav";
import { prisma } from "@/lib/prisma";

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BlogAdminNav />
      <div>
        <h1 className="text-3xl font-bold text-navy">Novo artigo</h1>
        <p className="text-gray-muted">Use o editor visual e cole conteúdos do ChatGPT, Word ou Google Docs.</p>
      </div>
      <BlogForm categories={categories} tags={tags} />
    </div>
  );
}
