import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-navy">Editar artigo</h1>
      <BlogForm categories={categories} initial={post} />
    </div>
  );
}
