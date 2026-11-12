"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
};

export default function AdminTagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/tags");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(editingId ? `/api/admin/tags/${editingId}` : "/api/admin/tags", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar");
      return;
    }
    setName("");
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir esta tag?")) return;
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Tags</h1>
        <p className="text-gray-muted">Assuntos específicos associados aos artigos.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-light bg-white p-5">
        <div className="min-w-[240px] flex-1">
          <label className="admin-label">Nome da tag</label>
          <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <Button type="submit">{editingId ? "Atualizar" : "Criar tag"}</Button>
        {editingId ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Cancelar
          </Button>
        ) : null}
      </form>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="space-y-3">
        {items.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-gray-light bg-white p-4">
            <div>
              <p className="font-semibold text-navy">{tag.name}</p>
              <p className="text-sm text-gray-muted">
                /{tag.slug} · {tag._count?.posts || 0} artigos
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setEditingId(tag.id);
                  setName(tag.name);
                }}
              >
                Editar
              </button>
              <button type="button" className="underline text-[var(--danger)]" onClick={() => remove(tag.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
