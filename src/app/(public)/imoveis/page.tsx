import { Suspense } from "react";
import type { Metadata } from "next";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { searchProperties } from "@/lib/properties";


export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Imóveis em São Luís",
  description:
    "Encontre apartamentos, casas e coberturas de médio e alto padrão em São Luís — Península, Calhau, Ponta d'Areia, Renascença e mais.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function num(v?: string | string[]) {
  if (!v || Array.isArray(v)) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ImoveisPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = num(sp.page) || 1;
  const amenities = Array.isArray(sp.amenities)
    ? sp.amenities
    : sp.amenities
      ? [sp.amenities]
      : [];

  const [result, neighborhoods] = await Promise.all([
    searchProperties({
      q: typeof sp.q === "string" ? sp.q : undefined,
      purpose: typeof sp.purpose === "string" ? sp.purpose : undefined,
      type: typeof sp.type === "string" ? sp.type : undefined,
      neighborhood: typeof sp.neighborhood === "string" ? sp.neighborhood : undefined,
      minPrice: num(sp.minPrice),
      maxPrice: num(sp.maxPrice),
      minArea: num(sp.minArea),
      maxArea: num(sp.maxArea),
      bedrooms: num(sp.bedrooms),
      suites: num(sp.suites),
      bathrooms: num(sp.bathrooms),
      parking: num(sp.parking),
      furnished: sp.furnished === "1",
      seaView: sp.seaView === "1",
      isNew: sp.novo === "1",
      amenities,
      sort: typeof sp.sort === "string" ? sp.sort : "recentes",
      page,
      pageSize: 12,
    }),
    prisma.neighborhood.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const params = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (k === "page") return;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else if (typeof v === "string" && v) params.set(k, v);
  });

  return (
    <div className="section-pad">
      <div className="container-site">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">
            Encontre seu próximo imóvel
          </h1>
          <p className="mt-4 text-lg text-gray-muted">
            Explore oportunidades de compra, venda e locação com informações completas para fazer a
            escolha certa.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <Suspense fallback={<div className="rounded-2xl bg-ice p-6">Carregando filtros...</div>}>
            <PropertyFilters neighborhoods={neighborhoods} />
          </Suspense>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-muted">
                {result.total} {result.total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
            </div>

            {result.items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-light bg-ice p-12 text-center">
                <p className="text-gray-muted">Nenhum imóvel encontrado com esses filtros.</p>
                <Button href="/imoveis" variant="secondary" className="mt-4">
                  Limpar busca
                </Button>
              </div>
            )}

            {result.totalPages > 1 ? (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
                  const q = new URLSearchParams(params);
                  q.set("page", String(p));
                  return (
                    <Button
                      key={p}
                      href={`/imoveis?${q.toString()}`}
                      variant={p === result.page ? "primary" : "secondary"}
                      size="sm"
                    >
                      {p}
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
