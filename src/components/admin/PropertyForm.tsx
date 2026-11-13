"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_STATUSES, PROPERTY_TYPES, PURPOSES } from "@/lib/constants";
import { prepareImageForUpload, PROPERTY_IMAGE_PRESET } from "@/lib/image-client";
import { Button } from "@/components/ui/Button";
import { Upload, X, Star } from "lucide-react";

type Photo = { url: string; alt?: string | null; order?: number; isCover?: boolean };
type Amenity = { id: string; name: string; category: string };

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: string;
  purpose?: string;
  status?: string;
  price?: number;
  condoFee?: number | null;
  iptu?: number | null;
  financing?: boolean;
  acceptsTrade?: boolean;
  neighborhoodName?: string | null;
  address?: string | null;
  city?: string;
  state?: string;
  zipCode?: string | null;
  privateArea?: number | null;
  totalArea?: number | null;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpots?: number;
  floor?: number | null;
  furnished?: boolean;
  balcony?: boolean;
  seaView?: boolean;
  maidRoom?: boolean;
  powderRoom?: boolean;
  office?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isOpportunity?: boolean;
  isExclusive?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  photos?: Photo[];
  amenityIds?: string[];
};

function numOrNull(v: FormDataEntryValue | null) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function PropertyForm({
  initial,
  amenities,
}: {
  initial?: Initial;
  amenities: Amenity[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initial?.photos || []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initial?.amenityIds || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const condoAmenities = useMemo(() => amenities.filter((a) => a.category === "condo"), [amenities]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(true);
    setError("");
    setUploadProgress(`0/${list.length}`);

    const uploaded: Photo[] = [];
    const failures: string[] = [];

    for (let i = 0; i < list.length; i++) {
      const original = list[i];
      setUploadProgress(`${i + 1}/${list.length}`);
      try {
        const file = await prepareImageForUpload(original, PROPERTY_IMAGE_PRESET);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "properties");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Falha no upload (${res.status})`);
        if (!data.url) throw new Error("Upload sem URL de retorno.");
        uploaded.push({ url: data.url, alt: "", isCover: false });
        // Atualiza preview conforme cada foto sobe (sem limite de quantidade).
        setPhotos((prev) => {
          const next = [...prev, { url: data.url as string, alt: "", isCover: false }];
          if (!next.some((p) => p.isCover) && next[0]) next[0] = { ...next[0], isCover: true };
          return next;
        });
      } catch (e) {
        failures.push(
          `${original.name}: ${e instanceof Error ? e.message : "erro desconhecido"}`,
        );
      }
    }

    if (failures.length) {
      setError(
        uploaded.length
          ? `${uploaded.length} foto(s) enviada(s). Falhas: ${failures.join(" · ")}`
          : `Nenhuma foto enviada. ${failures.join(" · ")}`,
      );
    }
    setUploadProgress("");
    setUploading(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const description = String(fd.get("description") || "").trim();
    if (description.length < 10) {
      setError("A descrição precisa ter pelo menos 10 caracteres.");
      setSaving(false);
      return;
    }
    const payload = {
      title: String(fd.get("title")),
      slug: String(fd.get("slug") || ""),
      description,
      type: String(fd.get("type")),
      purpose: String(fd.get("purpose")),
      status: String(fd.get("status")),
      price: Number(fd.get("price")),
      condoFee: numOrNull(fd.get("condoFee")),
      iptu: numOrNull(fd.get("iptu")),
      financing: fd.get("financing") === "on",
      acceptsTrade: fd.get("acceptsTrade") === "on",
      neighborhoodName: String(fd.get("neighborhoodName") || "").trim(),
      address: String(fd.get("address") || "") || null,
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      zipCode: String(fd.get("zipCode") || "") || null,
      privateArea: numOrNull(fd.get("privateArea")),
      totalArea: numOrNull(fd.get("totalArea")),
      bedrooms: Number(fd.get("bedrooms") || 0),
      suites: Number(fd.get("suites") || 0),
      bathrooms: Number(fd.get("bathrooms") || 0),
      parkingSpots: Number(fd.get("parkingSpots") || 0),
      floor: numOrNull(fd.get("floor")),
      furnished: fd.get("furnished") === "on",
      balcony: fd.get("balcony") === "on",
      seaView: fd.get("seaView") === "on",
      maidRoom: fd.get("maidRoom") === "on",
      powderRoom: fd.get("powderRoom") === "on",
      office: fd.get("office") === "on",
      featured: fd.get("featured") === "on",
      isNew: fd.get("isNew") === "on",
      isOpportunity: fd.get("isOpportunity") === "on",
      isExclusive: fd.get("isExclusive") === "on",
      metaTitle: String(fd.get("metaTitle") || "") || null,
      metaDescription: String(fd.get("metaDescription") || "") || null,
      amenityIds: selectedAmenities,
      photos: photos.map((p, i) => ({ ...p, order: i })),
    };

    const url = initial?.id ? `/api/admin/properties/${initial.id}` : "/api/admin/properties";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const detail =
        data?.details?.fieldErrors &&
        Object.entries(data.details.fieldErrors as Record<string, string[]>)
          .map(([field, msgs]) => `${field}: ${(msgs || []).join(", ")}`)
          .join(" · ");
      setError(detail || data.error || `Erro ao salvar (${res.status})`);
      return;
    }
    router.push("/admin/imoveis");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Informações básicas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="admin-label">Título</label>
            <input name="title" required defaultValue={initial?.title} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Slug (URL)</label>
            <input name="slug" defaultValue={initial?.slug} className="admin-input" placeholder="gerado automaticamente se vazio" />
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select name="status" defaultValue={initial?.status || "rascunho"} className="admin-input">
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Tipo</label>
            <select name="type" defaultValue={initial?.type || "apartamento"} className="admin-input">
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Finalidade</label>
            <select name="purpose" defaultValue={initial?.purpose || "venda"} className="admin-input">
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Descrição</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={6}
              defaultValue={initial?.description}
              className="admin-input"
              placeholder="Descreva o imóvel com pelo menos 10 caracteres."
            />
          </div>
          <div>
            <label className="admin-label">Bairro</label>
            <input
              name="neighborhoodName"
              defaultValue={initial?.neighborhoodName || ""}
              className="admin-input"
              placeholder="Ex.: Batel, Centro, Água Verde"
            />
          </div>
          <div>
            <label className="admin-label">Endereço</label>
            <input name="address" defaultValue={initial?.address || ""} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Cidade</label>
            <input name="city" required defaultValue={initial?.city || ""} className="admin-input" placeholder="Ex.: Curitiba" />
          </div>
          <div>
            <label className="admin-label">Estado</label>
            <input name="state" required defaultValue={initial?.state || ""} className="admin-input" placeholder="Ex.: PR" />
          </div>
          <div>
            <label className="admin-label">CEP</label>
            <input name="zipCode" defaultValue={initial?.zipCode || ""} className="admin-input" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Informações financeiras</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="admin-label">Preço</label>
            <input name="price" type="number" required defaultValue={initial?.price ?? ""} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Condomínio</label>
            <input name="condoFee" type="number" defaultValue={initial?.condoFee ?? ""} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">IPTU</label>
            <input name="iptu" type="number" defaultValue={initial?.iptu ?? ""} className="admin-input" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="financing" defaultChecked={initial?.financing} /> Aceita financiamento
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="acceptsTrade" defaultChecked={initial?.acceptsTrade} /> Aceita permuta
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Características do imóvel</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="admin-label">Área privativa</label>
            <input name="privateArea" type="number" defaultValue={initial?.privateArea ?? ""} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Área total</label>
            <input name="totalArea" type="number" defaultValue={initial?.totalArea ?? ""} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Quartos</label>
            <input name="bedrooms" type="number" defaultValue={initial?.bedrooms ?? 0} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Suítes</label>
            <input name="suites" type="number" defaultValue={initial?.suites ?? 0} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Banheiros</label>
            <input name="bathrooms" type="number" defaultValue={initial?.bathrooms ?? 0} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Vagas</label>
            <input name="parkingSpots" type="number" defaultValue={initial?.parkingSpots ?? 0} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Andar</label>
            <input name="floor" type="number" defaultValue={initial?.floor ?? ""} className="admin-input" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["furnished", "Mobiliado", initial?.furnished],
            ["balcony", "Varanda", initial?.balcony],
            ["seaView", "Vista para o mar", initial?.seaView],
            ["maidRoom", "Dependência de serviço", initial?.maidRoom],
            ["powderRoom", "Lavabo", initial?.powderRoom],
            ["office", "Escritório", initial?.office],
          ].map(([name, label, checked]) => (
            <label key={String(name)} className="inline-flex items-center gap-2">
              <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Características do condomínio</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {condoAmenities.map((a) => (
            <label key={a.id} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a.id)}
                onChange={(e) => {
                  setSelectedAmenities((prev) =>
                    e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id),
                  );
                }}
              />
              {a.name}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Fotos</h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-ice px-4 py-10 text-center">
          <Upload className="text-navy" />
          <span className="mt-2 text-sm text-gray-muted">
            {uploading
              ? `Padronizando e enviando imagens... ${uploadProgress}`
              : "Selecione quantas imagens quiser (JPEG, PNG, WebP ou HEIC). Elas são padronizadas em 4:3 e otimizadas automaticamente."}
          </span>
          <input
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {photos.length ? (
          <p className="text-sm text-gray-muted">{photos.length} foto(s) no anúncio</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.url} className="overflow-hidden rounded-xl border border-gray-light bg-white">
              <div className="relative aspect-[4/3] bg-ice">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt || ""}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-navy"
                  onClick={() =>
                    setPhotos((prev) => prev.map((p, i) => ({ ...p, isCover: i === index })))
                  }
                >
                  <Star size={14} className={photo.isCover ? "fill-navy" : ""} /> Capa
                </button>
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Remover"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                className="admin-input m-2 mt-0 w-[calc(100%-1rem)] text-xs"
                placeholder="Texto alternativo"
                value={photo.alt || ""}
                onChange={(e) =>
                  setPhotos((prev) =>
                    prev.map((p, i) => (i === index ? { ...p, alt: e.target.value } : p)),
                  )
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-light bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Destaques e SEO</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["featured", "Destacar na home", initial?.featured],
            ["isNew", "Marcar como novo/lançamento", initial?.isNew],
            ["isOpportunity", "Oportunidade", initial?.isOpportunity],
            ["isExclusive", "Exclusivo", initial?.isExclusive],
          ].map(([name, label, checked]) => (
            <label key={String(name)} className="inline-flex items-center gap-2">
              <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />
              {label}
            </label>
          ))}
        </div>
        <div>
          <label className="admin-label">Meta title</label>
          <input name="metaTitle" defaultValue={initial?.metaTitle || ""} className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Meta description</label>
          <textarea name="metaDescription" rows={3} defaultValue={initial?.metaDescription || ""} className="admin-input" />
        </div>
      </section>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Salvando..." : "Salvar imóvel"}
        </Button>
        <Button href="/admin/imoveis" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
