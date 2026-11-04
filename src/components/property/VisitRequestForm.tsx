"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

export function VisitRequestForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          preferredDay: fd.get("preferredDay"),
          preferredTime: fd.get("preferredTime"),
          message: fd.get("message"),
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      setMessage("Solicitação enviada. O corretor entrará em contato para confirmar a visita.");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Não foi possível enviar. Tente novamente.");
    }
  }

  return (
    <div>
      <Button type="button" className="w-full" onClick={() => setOpen(true)}>
        Agendar visita
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-navy">Agendar visita</h3>
            <p className="mt-1 text-sm text-gray-muted">{propertyTitle}</p>
            <p className="mt-2 text-xs text-gray-muted">
              A visita não é confirmada automaticamente. O corretor validará a disponibilidade.
            </p>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <input name="name" required className="form-input" placeholder="Nome completo" />
              <input name="email" type="email" required className="form-input" placeholder="E-mail" />
              <input name="phone" required className="form-input" placeholder="Telefone / WhatsApp" />
              <div className="grid grid-cols-2 gap-3">
                <input name="preferredDay" type="date" className="form-input" />
                <input name="preferredTime" type="time" className="form-input" />
              </div>
              <textarea name="message" rows={3} className="form-input" placeholder="Mensagem (opcional)" />
              {message ? (
                <p className={`text-sm ${status === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {message}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button type="submit" disabled={status === "loading"} className="flex-1">
                  {status === "loading" ? "Enviando..." : "Enviar solicitação"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
