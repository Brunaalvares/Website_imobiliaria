"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    const res = await fetch("/api/admin/password-reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Falha ao redefinir senha.");
      return;
    }
    router.push("/admin/login");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-gray-light bg-white p-8 shadow-[var(--shadow)]">
      <h1 className="text-2xl font-bold text-navy">Redefinir senha</h1>
      <div className="mt-6 space-y-4">
        <input name="password" type="password" required minLength={8} className="admin-input" placeholder="Nova senha" />
        <input name="confirm" type="password" required minLength={8} className="admin-input" placeholder="Confirmar senha" />
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <Button type="submit" className="w-full">
          Salvar nova senha
        </Button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
