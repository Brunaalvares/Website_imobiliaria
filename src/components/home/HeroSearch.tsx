"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { PROPERTY_TYPES, PURPOSES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const QUICK_FILTERS = [
  { label: "Todos os imóveis", href: "/imoveis" },
  { label: "Apartamentos", href: "/imoveis?type=apartamento" },
  { label: "Casas", href: "/imoveis?type=casa" },
  { label: "Coberturas", href: "/imoveis?type=cobertura" },
  { label: "Lançamentos", href: "/imoveis?novo=1" },
  { label: "Imóveis para alugar", href: "/imoveis?purpose=locacao" },
];

export function HeroSearch({
  headline,
  subheadline,
  cities,
  neighborhoods,
}: {
  headline: string;
  subheadline: string;
  cities: string[];
  neighborhoods: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const [advanced, setAdvanced] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    router.push(`/imoveis?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F9FC_0%,#FFFFFF_55%,#FFFFFF_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,42,67,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,42,67,0.05),transparent_35%)]" />
      <div className="container-site relative section-pad pt-16 md:pt-24">
        <div className="mx-auto max-w-4xl text-center fade-up">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-muted">
            Marcelo Alvares · Imóveis em todo o Brasil
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-navy md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-muted md:text-lg">
            {subheadline}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 max-w-5xl rounded-2xl border border-gray-light bg-white p-4 shadow-[var(--shadow)] md:p-6 fade-up"
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <select name="city" className="form-input" defaultValue="">
              <option value="">Cidade</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <input
              name="q"
              className="form-input"
              placeholder="Bairro, empreendimento ou localização"
            />
            <select name="type" className="form-input" defaultValue="">
              <option value="">Tipo de imóvel</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select name="purpose" className="form-input" defaultValue="">
              <option value="">Compra ou locação</option>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {advanced ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <select name="neighborhood" className="form-input" defaultValue="">
                <option value="">Bairro</option>
                {neighborhoods.map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
              </select>
              <input name="minPrice" type="number" min={0} className="form-input" placeholder="Preço mínimo" />
              <input name="maxPrice" type="number" min={0} className="form-input" placeholder="Preço máximo" />
              <input name="bedrooms" type="number" min={0} className="form-input" placeholder="Quartos" />
              <input name="suites" type="number" min={0} className="form-input" placeholder="Suítes" />
              <input name="parking" type="number" min={0} className="form-input" placeholder="Vagas" />
              <input name="minArea" type="number" min={0} className="form-input" placeholder="Área mín. (m²)" />
              <input name="maxArea" type="number" min={0} className="form-input" placeholder="Área máx. (m²)" />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className="text-sm font-medium text-navy underline-offset-2 hover:underline"
            >
              {advanced ? "Ocultar filtros avançados" : "Filtros avançados"}
            </button>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search size={18} />
              Buscar imóveis
            </Button>
          </div>
        </form>

        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-2">
          {QUICK_FILTERS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="rounded-full border border-gray-light bg-white px-4 py-2 text-sm font-medium text-navy transition hover:border-navy hover:bg-ice"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
