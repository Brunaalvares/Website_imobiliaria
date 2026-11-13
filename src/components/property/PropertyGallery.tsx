"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { id: string; url: string; alt: string | null; isCover?: boolean; order?: number };

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

export function PropertyGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const list = useMemo(() => {
    if (!photos.length) {
      return [{ id: "placeholder", url: PLACEHOLDER, alt: title }];
    }
    // Capa primeiro, depois ordem — mesmo padrão em todos os imóveis.
    return [...photos].sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [photos, title]);

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = list[active] || list[0];

  function prev() {
    setActive((i) => (i - 1 + list.length) % list.length);
  }
  function next() {
    setActive((i) => (i + 1) % list.length);
  }

  return (
    <div className="w-full">
      {/*
        Padrão único para todos os imóveis:
        - quadro 4:3 em largura total da coluna
        - object-cover (sem esticar)
        - Image fill NÃO dentro de <button>
      */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ice">
        <Image
          src={current.url}
          alt={current.alt || title}
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 65vw"
          quality={90}
          priority
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label="Ampliar foto"
        />
      </div>

      {list.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-[4/3] w-[6.75rem] shrink-0 overflow-hidden rounded-xl border-2 bg-ice ${
                i === active ? "border-navy" : "border-transparent"
              }`}
            >
              <span className="pointer-events-none absolute inset-0">
                <Image
                  src={photo.url}
                  alt={photo.alt || title}
                  fill
                  className="object-cover"
                  sizes="108px"
                  quality={70}
                />
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/95 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 text-white"
            onClick={() => setLightbox(false)}
            aria-label="Fechar"
          >
            <X size={28} />
          </button>
          <button type="button" className="absolute left-4 text-white" onClick={prev} aria-label="Anterior">
            <ChevronLeft size={36} />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={current.url}
              alt={current.alt || title}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
            />
          </div>
          <button type="button" className="absolute right-4 text-white" onClick={next} aria-label="Próximo">
            <ChevronRight size={36} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
