"use client";

import { useRouter } from "next/navigation";

export function BlogDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-[var(--danger)] underline"
      onClick={async () => {
        if (!confirm("Excluir artigo?")) return;
        await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Excluir
    </button>
  );
}
