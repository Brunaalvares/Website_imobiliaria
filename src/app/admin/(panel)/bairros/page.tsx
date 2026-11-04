"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Neighborhood = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  published: boolean;
};

const empty = { name: "", slug: "", description: "", imageUrl: "", order: 0, published: true };

export default function AdminNeighborhoodsPage() {
  const [items, setItems] = useState<Neighborhood[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/neighborhoods");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "neighborhoods");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, imageUrl: data.url }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    };
    await fetch(editingId ? `/api/admin/neighborhoods/${editingId}` : "/api/admin/neighborhoods", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm(empty);
    setEditingId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Bairros</h1>
        <p className="text-gray-muted">Gerencie as regiões exibidas na Home e nos filtros.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Nome</label>
            <input className="admin-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="gerado automaticamente" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Descrição</label>
            <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Ordem</label>
            <input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
          <div>
            <label className="admin-label">Imagem</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Publicado
        </label>
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Atualizar" : "Adicionar"}</Button>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(empty); }}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light bg-white p-4">
            <div>
              <p className="font-semibold text-navy">{item.name}</p>
              <p className="text-sm text-gray-muted">
                /{item.slug} · ordem {item.order} · {item.published ? "publicado" : "oculto"}
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
                  });
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-[var(--danger)] underline"
                onClick={async () => {
                  if (!confirm("Excluir bairro?")) return;
                  await fetch(`/api/admin/neighborhoods/${item.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
