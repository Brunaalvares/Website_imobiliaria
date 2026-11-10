"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string };

export function BlogForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverUrl?: string | null;
    categoryId?: string | null;
    authorName?: string;
    status?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };
}) {
  const router = useRouter();
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function upload(file: File) {
    const { prepareImageForUpload } = await import("@/lib/image-client");
    const prepared = await prepareImageForUpload(file);
    const fd = new FormData();
    fd.append("file", prepared);
    fd.append("folder", "blog");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setCoverUrl(data.url);
    else setError(data.error || "Falha no upload da capa");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      excerpt: fd.get("excerpt"),
      content: fd.get("content"),
      coverUrl: coverUrl || null,
      categoryId: String(fd.get("categoryId") || "") || null,
      authorName: fd.get("authorName"),
      status: fd.get("status"),
      metaTitle: String(fd.get("metaTitle") || "") || null,
      metaDescription: String(fd.get("metaDescription") || "") || null,
    };
    const res = await fetch(initial?.id ? `/api/admin/blog/${initial.id}` : "/api/admin/blog", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar");
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
      <div>
        <label className="admin-label">Título</label>
        <input name="title" required defaultValue={initial?.title} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">URL amigável</label>
        <input name="slug" defaultValue={initial?.slug} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Resumo</label>
        <textarea name="excerpt" required rows={3} defaultValue={initial?.excerpt} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Conteúdo (HTML simples com H2/H3, links e imagens)</label>
        <textarea name="content" required rows={14} defaultValue={initial?.content} className="admin-input font-mono text-sm" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Categoria</label>
          <select name="categoryId" defaultValue={initial?.categoryId || ""} className="admin-input">
            <option value="">Selecione</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Autor</label>
          <input name="authorName" defaultValue={initial?.authorName || "Marcelo Alvares"} className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select name="status" defaultValue={initial?.status || "rascunho"} className="admin-input">
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Imagem de capa</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          {coverUrl ? <p className="mt-1 text-xs text-gray-muted">{coverUrl}</p> : null}
        </div>
      </div>
      <div>
        <label className="admin-label">Meta title</label>
        <input name="metaTitle" defaultValue={initial?.metaTitle || ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Meta description</label>
        <textarea name="metaDescription" rows={2} defaultValue={initial?.metaDescription || ""} className="admin-input" />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Salvando..." : "Salvar artigo"}
      </Button>
    </form>
  );
}
