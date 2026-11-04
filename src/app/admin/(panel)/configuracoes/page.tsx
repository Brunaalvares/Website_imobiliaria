"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Settings = {
  brandName: string;
  logoUrl: string | null;
  photoUrl: string | null;
  institutionalText: string;
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  address: string;
  creci: string;
  footerText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string | null;
  analyticsId: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setError("Falha ao carregar configurações"));
  }, []);

  async function upload(field: "logoUrl" | "photoUrl" | "heroImageUrl", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "settings");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setSettings((s) => (s ? { ...s, [field]: data.url } : s));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      setError("Erro ao salvar");
      return;
    }
    setMessage("Configurações salvas.");
  }

  if (!settings) {
    return <p className="text-gray-muted">{error || "Carregando..."}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Configurações</h1>
        <p className="text-gray-muted">Dados da marca, contato e textos do site.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
          <h2 className="text-lg font-bold text-navy">Marca e textos</h2>
          <div>
            <label className="admin-label">Nome da marca</label>
            <input
              className="admin-input"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Texto institucional</label>
            <textarea
              className="admin-input"
              rows={5}
              value={settings.institutionalText}
              onChange={(e) => setSettings({ ...settings, institutionalText: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Texto do rodapé</label>
            <textarea
              className="admin-input"
              rows={3}
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Headline da Home</label>
            <input
              className="admin-input"
              value={settings.heroHeadline}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Subheadline da Home</label>
            <textarea
              className="admin-input"
              rows={3}
              value={settings.heroSubheadline}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="admin-label">Logotipo</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload("logoUrl", e.target.files[0])} />
              {settings.logoUrl ? <p className="mt-1 text-xs text-gray-muted">{settings.logoUrl}</p> : null}
            </div>
            <div>
              <label className="admin-label">Foto de Marcelo</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload("photoUrl", e.target.files[0])} />
              {settings.photoUrl ? <p className="mt-1 text-xs text-gray-muted">{settings.photoUrl}</p> : null}
            </div>
            <div>
              <label className="admin-label">Imagem principal (opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload("heroImageUrl", e.target.files[0])} />
              {settings.heroImageUrl ? <p className="mt-1 text-xs text-gray-muted">{settings.heroImageUrl}</p> : null}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
          <h2 className="text-lg font-bold text-navy">Contato</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["whatsapp", "WhatsApp (somente números, com DDD)"],
                ["phone", "Telefone"],
                ["email", "E-mail"],
                ["instagram", "Instagram"],
                ["address", "Endereço comercial"],
                ["creci", "CRECI-MA"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="admin-label">{label}</label>
                <input
                  className="admin-input"
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  placeholder="Deixe em branco até configurar o dado real"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
          <h2 className="text-lg font-bold text-navy">Analytics e e-mail</h2>
          <div>
            <label className="admin-label">Google Analytics ID</label>
            <input
              className="admin-input"
              value={settings.analyticsId}
              onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
              placeholder="G-XXXXXXXX"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">SMTP Host</label>
              <input className="admin-input" value={settings.smtpHost} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">SMTP Port</label>
              <input
                type="number"
                className="admin-input"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="admin-label">SMTP User</label>
              <input className="admin-input" value={settings.smtpUser} onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">SMTP Pass</label>
              <input type="password" className="admin-input" value={settings.smtpPass} onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">SMTP From</label>
              <input className="admin-input" value={settings.smtpFrom} onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })} />
            </div>
          </div>
        </section>

        {message ? <p className="text-sm text-[var(--success)]">{message}</p> : null}
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <Button type="submit">Salvar configurações</Button>
      </form>
    </div>
  );
}
