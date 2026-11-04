"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, Heart, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, purposeLabel } from "@/lib/utils";
import { useState, useTransition } from "react";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  purpose: string;
  city?: string | null;
  privateArea: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  likeCount: number;
  featured?: boolean;
  isNew?: boolean;
  isOpportunity?: boolean;
  isExclusive?: boolean;
  neighborhood?: { name: string } | null;
  photos: { url: string; alt: string | null; isCover: boolean }[];
};

export function PropertyCard({
  property,
  initialLiked = false,
}: {
  property: PropertyCardData;
  initialLiked?: boolean;
}) {
  const cover =
    property.photos.find((p) => p.isCover)?.url ||
    property.photos[0]?.url ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(property.likeCount);
  const [pending, startTransition] = useTransition();

  function toggleLike() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/properties/${property.id}/like`, { method: "POST" });
        if (!res.ok) return;
        const data = await res.json();
        setLiked(data.liked);
        setLikes(data.likeCount);
      } catch {
        // silent
      }
    });
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-light bg-white shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,42,67,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ice">
        <Image
          src={cover}
          alt={property.photos[0]?.alt || property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge>{purposeLabel(property.purpose)}</Badge>
          {property.featured ? <Badge tone="ice">Destaque</Badge> : null}
          {property.isNew ? <Badge tone="ice">Novo</Badge> : null}
          {property.isOpportunity ? <Badge tone="ice">Oportunidade</Badge> : null}
          {property.isExclusive ? <Badge tone="ice">Exclusivo</Badge> : null}
        </div>
        <button
          type="button"
          onClick={toggleLike}
          disabled={pending}
          aria-label={liked ? "Remover curtida" : "Curtir imóvel"}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-navy shadow-sm transition hover:scale-105"
        >
          <Heart className={liked ? "fill-navy text-navy" : ""} size={18} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xl font-bold text-navy">{formatCurrency(property.price, property.purpose)}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-navy">
            <Link href={`/imoveis/${property.slug}`} className="hover:underline">
              {property.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-muted">
            {[property.neighborhood?.name, property.city].filter(Boolean).join(" · ") || "Brasil"}
            {" · "}
            {likes} curtidas
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-dark sm:grid-cols-4">
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 size={15} /> {property.privateArea ? `${property.privateArea} m²` : "—"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={15} /> {property.bedrooms} qt
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath size={15} /> {property.bathrooms} ban
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Car size={15} /> {property.parkingSpots} vg
          </span>
        </div>
        {property.suites > 0 ? (
          <p className="text-xs text-gray-muted">{property.suites} suíte(s)</p>
        ) : null}

        <Button href={`/imoveis/${property.slug}`} variant="secondary" className="w-full">
          Ver detalhes
        </Button>
      </div>
    </article>
  );
}
