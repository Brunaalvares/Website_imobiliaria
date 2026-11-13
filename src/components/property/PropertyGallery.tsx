"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { id: string; url: string; alt: string | null };

export function PropertyGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = photos.length
    ? photos
    : [{ id: "placeholder", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", alt: title }];

  const current = list[active] || list[0];

  function prev() {
    setActive((i) => (i - 1 + list.length) % list.length);
  }
  function next() {
    setActive((i) => (i + 1) % list.length);
  }

  return (
    <div>
      {/*
        Não usar <button> como pai de next/image fill — em vários browsers
        position:absolute dentro de button quebra o object-fit e a foto
        aparece “explodida”/recortada (só um canto).
      */}
      <div className="flex w-full justify-center">
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ice"
          style={{ maxHeight: "min(70vh, 560px)", width: "min(100%, calc(min(70vh, 560px) * 4 / 3))" }}
        >
          <Image
            src={current.url}
            alt={current.alt || title}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 70vw"
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
      </div>

      {list.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-[6.75rem] shrink-0 overflow-hidden rounded-xl border-2 bg-ice ${
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
