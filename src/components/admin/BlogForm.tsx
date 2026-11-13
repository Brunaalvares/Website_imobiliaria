"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { BLOG_STATUSES } from "@/lib/constants";
import { buildSeoChecklist } from "@/lib/blog-seo";
import { prepareImageForUpload } from "@/lib/image-client";
import { readingTime, slugify } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string | null;
  categoryId?: string | null;
  secondaryCategoryIds?: string[];
  tagIds?: string[];
  authorName?: string;
  status?: string;
  focusKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  scheduledAt?: string | null;
};

export function BlogForm({
  categories,
  tags: initialTags,
  initial,
}: {
  categories: Category[];
  tags: Tag[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [content, setContent] = useState(initial?.content || "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [secondaryIds, setSecondaryIds] = useState<string[]>(initial?.secondaryCategoryIds || []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initial?.tagIds || []);
  const [tagInput, setTagInput] = useState("");
  const [authorName, setAuthorName] = useState(initial?.authorName || "Marcelo Alvares");
  const [status, setStatus] = useState(initial?.status || "rascunho");
  const [focusKeyword, setFocusKeyword] = useState(initial?.focusKeyword || "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || "");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : "",
  );
  const [previewMode, setPreviewMode] = useState<"edit" | "desktop" | "mobile">("edit");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const seoChecks = useMemo(
    () =>
      buildSeoChecklist({
        title,
        contentHtml: content,
        focusKeyword,
        metaTitle,
        metaDescription,
      }),
    [title, content, focusKeyword, metaTitle, metaDescription],
  );

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://websiteimobiliaria.vercel.app";
  const previewTitle = metaTitle || title || "Título do artigo";
  const previewUrl = `${appUrl}/blog/${slug || "url-do-artigo"}`;
  const previewDesc = metaDescription || excerpt || "Meta-description do artigo...";

  async function uploadCover(file: File) {
    try {
      const prepared = await prepareImageForUpload(file);
      const fd = new FormData();
      fd.append("file", prepared);
      fd.append("folder", "blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da capa");
      setCoverUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload");
    }
  }

  function toggleSecondary(id: string) {
    setSecondaryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addTagFromInput() {
    const name = tagInput.trim();
    if (!name) return;
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) setSelectedTagIds((p) => [...p, existing.id]);
    } else {
      const temp = `new:${slugify(name)}`;
      setTags((prev) => [...prev, { id: temp, name, slug: slugify(name) }]);
      if (!selectedTagIds.includes(temp)) setSelectedTagIds((p) => [...p, temp]);
    }
    setTagInput("");
  }

  async function save(nextStatus?: string) {
    setSaving(true);
    setError("");
    setMessage("");
    const finalStatus = nextStatus || status;
    if (!title.trim() || title.trim().length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      setSaving(false);
      return;
    }
    if (!categoryId) {
      setError("Selecione a editoria principal do artigo.");
      setSaving(false);
      return;
    }
    if (!excerpt.trim() || excerpt.trim().length < 10) {
      setError("O resumo precisa ter pelo menos 10 caracteres.");
      setSaving(false);
      return;
    }
    if (!content || content.replace(/<[^>]+>/g, "").trim().length < 10) {
      setError("Escreva o conteúdo do artigo no editor.");
      setSaving(false);
      return;
    }
    if (finalStatus === "agendado" && !scheduledAt) {
      setError("Defina a data/hora de agendamento.");
      setSaving(false);
      return;
    }

    const existingTagIds = selectedTagIds.filter((id) => !id.startsWith("new:"));
    const newTagNames = selectedTagIds
      .filter((id) => id.startsWith("new:"))
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[];

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      coverUrl: coverUrl || null,
      categoryId,
      secondaryCategoryIds: secondaryIds.filter((id) => id !== categoryId),
      tagIds: existingTagIds,
      tagNames: newTagNames,
      authorName: authorName.trim() || "Marcelo Alvares",
      status: finalStatus,
      focusKeyword: focusKeyword.trim() || null,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      scheduledAt: finalStatus === "agendado" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      readingMinutes: readingTime(content),
    };

    const res = await fetch(initial?.id ? `/api/admin/blog/${initial.id}` : "/api/admin/blog", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const details = data?.details?.fieldErrors
        ? Object.entries(data.details.fieldErrors as Record<string, string[]>)
            .map(([field, msgs]) => `${field}: ${(msgs || []).join(", ")}`)
            .join(" · ")
        : "";
      setError([data.error || "Erro ao salvar artigo", details].filter(Boolean).join(" — "));
      return;
    }

    setStatus(finalStatus);
    setLastSavedAt(new Date().toLocaleTimeString("pt-BR"));
    setMessage(
      finalStatus === "publicado"
        ? "Artigo publicado."
        : finalStatus === "agendado"
          ? "Artigo agendado."
          : "Rascunho salvo.",
    );

    if (!initial?.id && data.id) {
      router.replace(`/admin/blog/${data.id}`);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  useEffect(() => {
    if (!initial?.id) return;
    const id = window.setInterval(() => {
      // Só faz autosave de rascunhos — nunca rebaixa um artigo publicado/agendado.
      if (document.visibilityState === "visible" && status === "rascunho") {
        void save("rascunho");
      }
    }, 45000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id, title, slug, excerpt, content, categoryId, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={previewMode === "edit" ? "primary" : "secondary"} size="sm" onClick={() => setPreviewMode("edit")}>
            Editar
          </Button>
          <Button type="button" variant={previewMode === "desktop" ? "primary" : "secondary"} size="sm" onClick={() => setPreviewMode("desktop")}>
            Prévia desktop
          </Button>
          <Button type="button" variant={previewMode === "mobile" ? "primary" : "secondary"} size="sm" onClick={() => setPreviewMode("mobile")}>
            Prévia mobile
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={saving} onClick={() => save("rascunho")}>
            Salvar rascunho
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => save("agendado")}>
            Agendar
          </Button>
          <Button type="button" disabled={saving} onClick={() => save("publicado")}>
            Publicar
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-[var(--success)]">{message}{lastSavedAt ? ` · ${lastSavedAt}` : ""}</p> : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {previewMode !== "edit" ? (
        <div className={`mx-auto rounded-2xl border border-gray-light bg-white p-6 shadow-[var(--shadow)] ${previewMode === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-muted">
            {categories.find((c) => c.id === categoryId)?.name || "Editoria"} · {readingTime(content)} min
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy">{title || "Título do artigo"}</h1>
          <p className="mt-3 text-gray-muted">{excerpt}</p>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={title} className="mt-6 max-h-80 w-full rounded-xl object-cover" />
          ) : null}
          <div className="prose-blog mt-8" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
              <div>
                <label className="admin-label">Título</label>
                <input className="admin-input text-xl font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="admin-label">Resumo</label>
                <textarea className="admin-input" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Conteúdo</label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
              <h2 className="text-lg font-bold text-navy">Configurações de SEO</h2>
              <div>
                <label className="admin-label">Palavra-chave principal</label>
                <input className="admin-input" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Ex.: financiamento imobiliário" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="admin-label mb-0">Título SEO (Meta Title)</label>
                  <span className={`text-xs ${(metaTitle || title).length > 60 ? "text-[var(--danger)]" : "text-gray-muted"}`}>
                    {(metaTitle || title).length}/60
                  </span>
                </div>
                <input className="admin-input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || "Título para buscadores"} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="admin-label mb-0">Meta-description</label>
                  <span className={`text-xs ${metaDescription.length > 0 && (metaDescription.length < 120 || metaDescription.length > 170) ? "text-[var(--danger)]" : "text-gray-muted"}`}>
                    {metaDescription.length} · ideal 140–160
                  </span>
                </div>
                <textarea className="admin-input" rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">URL Slug</label>
                <input
                  className="admin-input"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="rounded-xl border border-gray-light bg-ice p-4">
                <p className="text-xs text-gray-muted">Prévia do Google</p>
                <p className="mt-2 text-xl text-[#1a0dab]">{previewTitle}</p>
                <p className="text-sm text-[#006621]">{previewUrl}</p>
                <p className="mt-1 text-sm text-[#4d5156]">{previewDesc}</p>
              </div>
              <div>
                <p className="admin-label">Checklist de SEO</p>
                <ul className="mt-2 space-y-2">
                  {seoChecks.map((check) => (
                    <li key={check.id} className="rounded-xl border border-gray-light px-3 py-2 text-sm">
                      <span className={check.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                        {check.ok ? "✓" : "•"} {check.label}
                      </span>
                      {!check.ok ? <p className="mt-1 text-xs text-gray-muted">{check.tip}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-4">
              <h3 className="font-bold text-navy">Publicação</h3>
              <div>
                <label className="admin-label">Status</label>
                <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {BLOG_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {status === "agendado" ? (
                <div>
                  <label className="admin-label">Agendar para</label>
                  <input type="datetime-local" className="admin-input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                </div>
              ) : null}
              <div>
                <label className="admin-label">Autor</label>
                <input className="admin-input" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-4">
              <h3 className="font-bold text-navy">Editoria</h3>
              <div>
                <label className="admin-label">Editoria principal *</label>
                <select className="admin-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="">Selecione</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Editorias secundárias</label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-gray-light p-2 text-sm">
                  {categories
                    .filter((c) => c.id !== categoryId)
                    .map((c) => (
                      <label key={c.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={secondaryIds.includes(c.id)} onChange={() => toggleSecondary(c.id)} />
                        {c.name}
                      </label>
                    ))}
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-4">
              <h3 className="font-bold text-navy">Tags</h3>
              <div className="flex gap-2">
                <input className="admin-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Nova tag" />
                <Button type="button" variant="secondary" onClick={addTagFromInput}>
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      selectedTagIds.includes(tag.id) ? "bg-navy text-white" : "bg-ice text-navy"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-4">
              <h3 className="font-bold text-navy">Imagem de capa</h3>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Capa" className="mt-2 max-h-40 w-full rounded-xl object-cover" />
              ) : null}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
