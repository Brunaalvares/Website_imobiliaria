"use client";

import { useRouter } from "next/navigation";
import { CONTACT_STATUSES } from "@/lib/constants";
import { formatDate, statusLabel } from "@/lib/utils";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  notes: string | null;
  source: string;
  createdAt: string;
  propertyTitle: string | null;
};

type Visit = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDay: string | null;
  preferredTime: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  propertyTitle: string;
};

export function ContactManager({ contacts, visits }: { contacts: Contact[]; visits: Visit[] }) {
  const router = useRouter();

  async function updateContact(id: string, status: string, notes: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    router.refresh();
  }

  async function updateVisit(id: string, status: string, notes: string) {
    await fetch(`/api/admin/visits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-bold text-navy">Formulário de contato</h2>
        <div className="space-y-3">
          {contacts.map((c) => (
            <article key={c.id} className="rounded-2xl border border-gray-light bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{c.name}</p>
                  <p className="text-sm text-gray-muted">
                    {c.email} · {c.phone} · {formatDate(c.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-muted">Assunto: {c.subject}</p>
                  {c.propertyTitle ? <p className="text-sm text-gray-muted">Imóvel: {c.propertyTitle}</p> : null}
                  <p className="mt-2 text-sm text-gray-dark">{c.message}</p>
                </div>
                <span className="rounded-full bg-ice px-3 py-1 text-xs font-semibold text-navy">
                  {statusLabel(c.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr_auto]">
                <select
                  className="admin-input"
                  defaultValue={c.status}
                  id={`status-${c.id}`}
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input"
                  defaultValue={c.notes || ""}
                  placeholder="Observações internas"
                  id={`notes-${c.id}`}
                />
                <button
                  type="button"
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => {
                    const status = (document.getElementById(`status-${c.id}`) as HTMLSelectElement).value;
                    const notes = (document.getElementById(`notes-${c.id}`) as HTMLInputElement).value;
                    updateContact(c.id, status, notes);
                  }}
                >
                  Salvar
                </button>
              </div>
            </article>
          ))}
          {!contacts.length ? <p className="text-sm text-gray-muted">Nenhum contato recebido.</p> : null}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-navy">Solicitações de visita</h2>
        <div className="space-y-3">
          {visits.map((v) => (
            <article key={v.id} className="rounded-2xl border border-gray-light bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{v.name}</p>
                  <p className="text-sm text-gray-muted">
                    {v.email} · {v.phone} · {formatDate(v.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-muted">Imóvel: {v.propertyTitle}</p>
                  <p className="text-sm text-gray-muted">
                    Preferência: {v.preferredDay || "—"} {v.preferredTime || ""}
                  </p>
                  {v.message ? <p className="mt-2 text-sm text-gray-dark">{v.message}</p> : null}
                </div>
                <span className="rounded-full bg-ice px-3 py-1 text-xs font-semibold text-navy">
                  {statusLabel(v.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr_auto]">
                <select className="admin-input" defaultValue={v.status} id={`vstatus-${v.id}`}>
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input"
                  defaultValue={v.notes || ""}
                  placeholder="Observações internas"
                  id={`vnotes-${v.id}`}
                />
                <button
                  type="button"
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => {
                    const status = (document.getElementById(`vstatus-${v.id}`) as HTMLSelectElement).value;
                    const notes = (document.getElementById(`vnotes-${v.id}`) as HTMLInputElement).value;
                    updateVisit(v.id, status, notes);
                  }}
                >
                  Salvar
                </button>
              </div>
            </article>
          ))}
          {!visits.length ? <p className="text-sm text-gray-muted">Nenhuma solicitação de visita.</p> : null}
        </div>
      </section>
    </div>
  );
}
