"use client";

import { FormEvent, useState } from "react";
import { CONTACT_SUBJECTS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          lgpdConsent: fd.get("lgpdConsent") === "on",
          website: fd.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fail");
      setStatus("ok");
      setMessage("Mensagem enviada com sucesso. Em breve entraremos em contato.");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Não foi possível enviar.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-light bg-white p-6 shadow-[var(--shadow)]">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <div>
        <label className="admin-label">Nome completo</label>
        <input name="name" required className="form-input" />
      </div>
      <div>
        <label className="admin-label">E-mail</label>
        <input name="email" type="email" required className="form-input" />
      </div>
      <div>
        <label className="admin-label">Telefone com WhatsApp</label>
        <input name="phone" required className="form-input" />
      </div>
      <div>
        <label className="admin-label">Assunto</label>
        <select name="subject" required className="form-input" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="admin-label">Mensagem</label>
        <textarea name="message" required rows={5} className="form-input" />
      </div>
      <label className="flex items-start gap-2 text-sm text-gray-muted">
        <input type="checkbox" name="lgpdConsent" required className="mt-1" />
        <span>
          Concordo com o tratamento dos meus dados conforme a{" "}
          <Link href="/politica-de-privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      {message ? (
        <p className={`text-sm ${status === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={status === "loading"} className="w-full" size="lg">
        {status === "loading" ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}
