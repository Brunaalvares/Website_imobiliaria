"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function PropertyActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function patchStatus(next: string) {
    const res = await fetch(`/api/admin/properties/${id}`);
    const current = await res.json();
    await fetch(`/api/admin/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...current,
        status: next,
        amenityIds: (current.amenities || []).map((a: { amenityId: string }) => a.amenityId),
        photos: (current.photos || []).map((p: { url: string; alt: string | null; order: number; isCover: boolean }) => ({
          url: p.url,
          alt: p.alt,
          order: p.order,
          isCover: p.isCover,
        })),
      }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Link href={`/admin/imoveis/${id}`} className="underline">
        Editar
      </Link>
      <button
        type="button"
        disabled={pending}
        className="underline"
        onClick={() =>
          startTransition(async () => {
            await fetch(`/api/admin/properties/${id}/duplicate`, { method: "POST" });
            router.refresh();
          })
        }
      >
        Duplicar
      </button>
      {status !== "publicado" ? (
        <button type="button" className="underline" disabled={pending} onClick={() => startTransition(() => patchStatus("publicado"))}>
          Publicar
        </button>
      ) : (
        <button type="button" className="underline" disabled={pending} onClick={() => startTransition(() => patchStatus("rascunho"))}>
          Despublicar
        </button>
      )}
      <button type="button" className="underline" disabled={pending} onClick={() => startTransition(() => patchStatus("vendido"))}>
        Vendido
      </button>
      <button type="button" className="underline" disabled={pending} onClick={() => startTransition(() => patchStatus("alugado"))}>
        Alugado
      </button>
      <button type="button" className="underline" disabled={pending} onClick={() => startTransition(() => patchStatus("arquivado"))}>
        Arquivar
      </button>
      <button
        type="button"
        className="text-[var(--danger)] underline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (!confirm("Excluir este imóvel permanentemente?")) return;
            await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
            router.refresh();
          })
        }
      >
        Excluir
      </button>
    </div>
  );
}
