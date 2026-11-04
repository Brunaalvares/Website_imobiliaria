import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { formatCurrency, statusLabel } from "@/lib/utils";
import { PropertyActions } from "@/components/admin/PropertyActions";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      neighborhood: true,
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Imóveis</h1>
          <p className="text-gray-muted">Gerencie o portfólio publicado no site.</p>
        </div>
        <Button href="/admin/imoveis/novo">Adicionar imóvel</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-light bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-light bg-ice text-gray-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Imóvel</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Curtidas</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-gray-light last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/imoveis/${p.id}`} className="font-medium text-navy hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-gray-muted">{p.neighborhood?.name || "—"}</p>
                </td>
                <td className="px-4 py-3">{p.code}</td>
                <td className="px-4 py-3">{formatCurrency(p.price, p.purpose)}</td>
                <td className="px-4 py-3">{statusLabel(p.status)}</td>
                <td className="px-4 py-3">{p.likeCount}</td>
                <td className="px-4 py-3">
                  <PropertyActions id={p.id} status={p.status} />
                </td>
              </tr>
            ))}
            {!properties.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-muted">
                  Nenhum imóvel cadastrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
