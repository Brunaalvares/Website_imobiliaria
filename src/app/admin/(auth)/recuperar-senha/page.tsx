"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RecoverPasswordPage() {
  const [message, setMessage] = useState("");
  const [devUrl, setDevUrl] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") }),
    });
    const data = await res.json();
    setMessage("Se o e-mail existir, enviaremos instruções de recuperação.");
    if (data.devResetUrl) setDevUrl(data.devResetUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-gray-light bg-white p-8 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-bold text-navy">Recuperar senha</h1>
        <p className="mt-2 text-sm text-gray-muted">Informe o e-mail do administrador.</p>
        <div className="mt-6 space-y-4">
          <input name="email" type="email" required className="admin-input" placeholder="E-mail" />
          <Button type="submit" className="w-full">
            Enviar link
          </Button>
          {message ? <p className="text-sm text-gray-muted">{message}</p> : null}
          {devUrl ? (
            <p className="break-all rounded-xl bg-ice p-3 text-xs text-navy">
              Ambiente de desenvolvimento:{" "}
              <Link href={devUrl} className="underline">
                {devUrl}
              </Link>
            </p>
          ) : null}
          <Link href="/admin/login" className="block text-sm text-gray-muted hover:text-navy">
            Voltar ao login
          </Link>
        </div>
      </form>
    </div>
  );
}
