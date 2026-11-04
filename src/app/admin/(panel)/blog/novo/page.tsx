import { BlogForm } from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-navy">Novo artigo</h1>
      <BlogForm categories={categories} />
    </div>
  );
}
