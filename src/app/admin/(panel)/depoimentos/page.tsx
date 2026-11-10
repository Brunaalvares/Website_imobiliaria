"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEAL_TYPES } from "@/lib/constants";

type Testimonial = {
  id: string;
  clientName: string;
  photoUrl: string | null;
  text: string;
  dealType: string;
  dealDate: string | null;
  authorized: boolean;
  published: boolean;
  showOnHome: boolean;
  order: number;
};

const empty = {
  clientName: "",
  photoUrl: "",
  text: "",
  dealType: "compra",
  dealDate: "",
  authorized: false,
  published: false,
  showOnHome: false,
  order: 0,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/testimonials");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      photoUrl: form.photoUrl || null,
      dealDate: form.dealDate || null,
    };
    const res = await fetch(editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials", {
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

  async function uploadPhoto(file: File) {
    const { prepareImageForUpload } = await import("@/lib/image-client");
    const prepared = await prepareImageForUpload(file);
    const fd = new FormData();
    fd.append("file", prepared);
    fd.append("folder", "testimonials");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, photoUrl: data.url }));
    else setError(data.error || "Falha no upload da foto");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Depoimentos</h1>
        <p className="text-gray-muted">Cadastre apenas depoimentos reais e autorizados.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Nome do cliente</label>
            <input
              className="admin-input"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="admin-label">Tipo de negócio</label>
            <select
              className="admin-input"
              value={form.dealType}
              onChange={(e) => setForm({ ...form, dealType: e.target.value })}
            >
              {DEAL_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Depoimento</label>
            <textarea
              className="admin-input"
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="admin-label">Data (opcional)</label>
            <input
              type="date"
              className="admin-input"
              value={form.dealDate}
              onChange={(e) => setForm({ ...form, dealDate: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Ordem</label>
            <input
              type="number"
              className="admin-input"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="admin-label">Foto (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
            {form.photoUrl ? <p className="mt-1 text-xs text-gray-muted">{form.photoUrl}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.authorized}
              onChange={(e) => setForm({ ...form, authorized: e.target.checked })}
            />
            Autorização de publicação
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicado
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.showOnHome}
              onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
            />
            Exibir na Home
          </label>
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Atualizar" : "Adicionar"}</Button>
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

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-light bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{item.clientName}</p>
                  <p className="mt-1 text-sm text-gray-muted">{item.text}</p>
                  <p className="mt-2 text-xs text-gray-muted">
                    {item.dealType} · {item.authorized ? "Autorizado" : "Sem autorização"} ·{" "}
                    {item.published ? "Publicado" : "Oculto"}
                    {item.showOnHome ? " · Home" : ""}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({
                        clientName: item.clientName,
                        photoUrl: item.photoUrl || "",
                        text: item.text,
                        dealType: item.dealType,
                        dealDate: item.dealDate ? item.dealDate.slice(0, 10) : "",
                        authorized: item.authorized,
                        published: item.published,
                        showOnHome: item.showOnHome,
                        order: item.order,
                      });
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-[var(--danger)] underline"
                    onClick={async () => {
                      if (!confirm("Excluir depoimento?")) return;
                      await fetch(`/api/admin/testimonials/${item.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-light bg-white p-8 text-center text-gray-muted">
            Nenhum depoimento cadastrado. O site público não exibirá textos fictícios.
          </div>
        )}
      </div>
    </div>
  );
}
