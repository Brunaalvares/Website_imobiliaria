"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { CONDO_AMENITIES, PROPERTY_TYPES, PURPOSES, SORT_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Filter, X } from "lucide-react";

export function PropertyFilters({
  cities,
  neighborhoods,
}: {
  cities: string[];
  neighborhoods: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      if (key === "amenities") {
        if (typeof value === "string" && value) params.append("amenities", value);
        continue;
      }
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    router.push(`/imoveis?${params.toString()}`);
    setOpen(false);
  }

  const selectedAmenities = searchParams.getAll("amenities");

  const form = (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="admin-label">Ordenar por</label>
        <select name="sort" className="form-input" defaultValue={searchParams.get("sort") || "recentes"}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="admin-label">Busca</label>
        <input name="q" className="form-input" defaultValue={searchParams.get("q") || ""} placeholder="Localização ou empreendimento" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="admin-label">Finalidade</label>
          <select name="purpose" className="form-input" defaultValue={searchParams.get("purpose") || ""}>
            <option value="">Todas</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Tipo</label>
          <select name="type" className="form-input" defaultValue={searchParams.get("type") || ""}>
            <option value="">Todos</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="admin-label">Cidade</label>
        <select name="city" className="form-input" defaultValue={searchParams.get("city") || ""}>
          <option value="">Todas</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="admin-label">Bairro</label>
        <select name="neighborhood" className="form-input" defaultValue={searchParams.get("neighborhood") || ""}>
          <option value="">Todos</option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="admin-label">Preço mín.</label>
          <input name="minPrice" type="number" className="form-input" defaultValue={searchParams.get("minPrice") || ""} />
        </div>
        <div>
          <label className="admin-label">Preço máx.</label>
          <input name="maxPrice" type="number" className="form-input" defaultValue={searchParams.get("maxPrice") || ""} />
        </div>
        <div>
          <label className="admin-label">Área mín.</label>
          <input name="minArea" type="number" className="form-input" defaultValue={searchParams.get("minArea") || ""} />
        </div>
        <div>
          <label className="admin-label">Área máx.</label>
          <input name="maxArea" type="number" className="form-input" defaultValue={searchParams.get("maxArea") || ""} />
        </div>
        <div>
          <label className="admin-label">Quartos</label>
          <input name="bedrooms" type="number" className="form-input" defaultValue={searchParams.get("bedrooms") || ""} />
        </div>
        <div>
          <label className="admin-label">Suítes</label>
          <input name="suites" type="number" className="form-input" defaultValue={searchParams.get("suites") || ""} />
        </div>
        <div>
          <label className="admin-label">Banheiros</label>
          <input name="bathrooms" type="number" className="form-input" defaultValue={searchParams.get("bathrooms") || ""} />
        </div>
        <div>
          <label className="admin-label">Vagas</label>
          <input name="parking" type="number" className="form-input" defaultValue={searchParams.get("parking") || ""} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="furnished" value="1" defaultChecked={searchParams.get("furnished") === "1"} />
          Mobiliados
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="seaView" value="1" defaultChecked={searchParams.get("seaView") === "1"} />
          Vista para o mar
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="novo" value="1" defaultChecked={searchParams.get("novo") === "1"} />
          Lançamentos
        </label>
      </div>

      <div>
        <label className="admin-label">Características do condomínio</label>
        <div className="mt-2 grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-light p-3 text-sm">
          {CONDO_AMENITIES.map((a) => (
            <label key={a.slug} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="amenities"
                value={a.slug}
                defaultChecked={selectedAmenities.includes(a.slug)}
              />
              {a.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Aplicar filtros
        </Button>
        <Button href="/imoveis" variant="secondary">
          Limpar
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <Button type="button" variant="secondary" className="w-full" onClick={() => setOpen(true)}>
          <Filter size={16} /> Filtros avançados
        </Button>
      </div>

      <aside className="hidden rounded-2xl border border-gray-light bg-white p-5 shadow-[var(--shadow)] lg:block">
        <h2 className="mb-4 text-lg font-bold text-navy">Filtros</h2>
        {form}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 bg-navy/40 p-4 lg:hidden">
          <div className="ml-auto flex h-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Filtros</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                <X />
              </button>
            </div>
            {form}
          </div>
        </div>
      ) : null}
    </>
  );
}
