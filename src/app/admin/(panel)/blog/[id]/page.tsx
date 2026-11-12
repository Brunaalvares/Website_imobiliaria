import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: {
        tags: true,
        secondaryCategories: true,
      },
    }),
    prisma.blogCategory.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Editar artigo</h1>
        <p className="text-gray-muted">/{post.slug}</p>
      </div>
      <BlogForm
        categories={categories}
        tags={tags}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl,
          categoryId: post.categoryId,
          secondaryCategoryIds: post.secondaryCategories.map((c) => c.categoryId),
          tagIds: post.tags.map((t) => t.tagId),
          authorName: post.authorName,
          status: post.status,
          focusKeyword: post.focusKeyword,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          scheduledAt: post.scheduledAt?.toISOString() || null,
        }}
      />
    </div>
  );
}
