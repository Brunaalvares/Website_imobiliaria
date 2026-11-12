"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { prepareImageForUpload } from "@/lib/image-client";
import { slugify } from "@/lib/utils";

type Editorial = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  order: number;
  published: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  _count?: { posts: number };
};

const empty = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  order: 0,
  published: true,
  metaTitle: "",
  metaDescription: "",
};

export default function AdminEditoriasPage() {
  const [items, setItems] = useState<Editorial[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [transferTo, setTransferTo] = useState("");

  async function load() {
    const res = await fetch("/api/admin/editorias");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    const prepared = await prepareImageForUpload(file);
    const fd = new FormData();
    fd.append("file", prepared);
    fd.append("folder", "blog");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, imageUrl: data.url }));
    else setError(data.error || "Falha no upload");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      imageUrl: form.imageUrl || null,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      order: Number(form.order) || 0,
    };
    const res = await fetch(editingId ? `/api/admin/editorias/${editingId}` : "/api/admin/editorias", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar");
      return;
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if ((item._count?.posts || 0) > 0 && !transferTo) {
      setError("Selecione uma editoria de destino para transferir os artigos antes de excluir.");
      return;
    }
    if (!window.confirm(`Excluir a editoria "${item.name}"?`)) return;
    const res = await fetch(`/api/admin/editorias/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transferToCategoryId: transferTo || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao excluir");
      return;
    }
    setTransferTo("");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Editorias</h1>
        <p className="text-gray-muted">Organize o blog por assuntos e configure SEO de cada categoria.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Nome</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: editingId ? f.slug : slugify(e.target.value),
                }))
              }
              required
            />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input className="admin-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Descrição</label>
            <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="admin-label">Ordem</label>
            <input type="number" className="admin-input" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
              Ativa / publicada
            </label>
          </div>
          <div>
            <label className="admin-label">Título SEO</label>
            <input className="admin-input" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
          </div>
          <div>
            <label className="admin-label">Meta-description</label>
            <input className="admin-input" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Imagem de capa</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {form.imageUrl ? <p className="mt-1 text-xs text-gray-muted">{form.imageUrl}</p> : null}
          </div>
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Atualizar editoria" : "Criar editoria"}</Button>
          {editingId ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-gray-light bg-white p-4">
        <label className="admin-label">Ao excluir, transferir artigos para</label>
        <select className="admin-input" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
          <option value="">Selecione (obrigatório se houver artigos)</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light bg-white p-4">
            <div>
              <p className="font-semibold text-navy">
                {item.name}{" "}
                <span className="text-xs font-normal text-gray-muted">/{item.slug}</span>
              </p>
              <p className="text-sm text-gray-muted">
                {item._count?.posts || 0} artigos · ordem {item.order} · {item.published ? "ativa" : "inativa"}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    name: item.name,
                    slug: item.slug,
                    description: item.description || "",
                    imageUrl: item.imageUrl || "",
                    order: item.order,
                    published: item.published,
                    metaTitle: item.metaTitle || "",
                    metaDescription: item.metaDescription || "",
                  });
                }}
              >
                Editar
              </button>
              <button type="button" className="underline text-[var(--danger)]" onClick={() => remove(item.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
