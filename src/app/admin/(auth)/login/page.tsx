"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.needsSetup) router.replace("/admin/setup");
      })
      .catch(() => undefined);
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        redirect: false,
        callbackUrl: "/admin",
      });
      if (!res || res.error) {
        setError("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-gray-light bg-white p-8 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-bold text-navy">Área Administrativa</h1>
        <p className="mt-2 text-sm text-gray-muted">Acesso restrito a administradores.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="admin-label">E-mail</label>
            <input name="email" type="email" required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Senha</label>
            <input name="password" type="password" required className="admin-input" />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/admin/recuperar-senha" className="text-gray-muted hover:text-navy">
            Esqueci a senha
          </Link>
          <Link href="/" className="text-gray-muted hover:text-navy">
            Voltar ao site
          </Link>
        </div>
      </form>
    </div>
  );
}
