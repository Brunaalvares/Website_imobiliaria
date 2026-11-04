"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminSetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => {
        if (!d.needsSetup) router.replace("/admin/login");
        else setReady(true);
      })
      .catch(() => setError("Não foi possível verificar o setup."));
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Falha ao criar administrador.");
      return;
    }
    router.push("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice text-gray-muted">
        Verificando configuração...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-gray-light bg-white p-8 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-bold text-navy">Configuração inicial</h1>
        <p className="mt-2 text-sm text-gray-muted">
          Crie o primeiro administrador. Esta página fica indisponível após o cadastro.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="admin-label">Nome</label>
            <input name="name" required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">E-mail</label>
            <input name="email" type="email" required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Senha</label>
            <input name="password" type="password" required minLength={8} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Confirmar senha</label>
            <input name="confirm" type="password" required minLength={8} className="admin-input" />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar administrador"}
          </Button>
        </div>
      </form>
    </div>
  );
}
