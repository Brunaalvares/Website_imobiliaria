"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { id: string; url: string; alt: string | null; isCover?: boolean; order?: number };

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

/**
 * Padrão visual da página de referência:
 * - foto principal contida na coluna
 * - quadro ~4:3 com altura máxima
 * - thumbnails em scroll horizontal + setinha quando há mais fotos
 */
export function PropertyGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const list = useMemo(() => {
    if (!photos.length) {
      return [{ id: "placeholder", url: PLACEHOLDER, alt: title }];
    }
    return [...photos].sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [photos, title]);

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const current = list[active] || list[0];

  function updateScrollHint() {
    const el = thumbsRef.current;
    if (!el) {
      setCanScrollRight(false);
      return;
    }
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollHint();
    const el = thumbsRef.current;
    if (!el) return;
    const onScroll = () => updateScrollHint();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollHint);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [list.length]);

  function prev() {
    setActive((i) => (i - 1 + list.length) % list.length);
  }
  function next() {
    setActive((i) => (i + 1) % list.length);
  }

  function scrollMoreThumbs() {
    const el = thumbsRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.7, behavior: "smooth" });
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <div
        className="relative w-full max-w-full overflow-hidden rounded-2xl bg-ice"
        style={{ aspectRatio: "4 / 3", maxHeight: "min(52vh, 480px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.url}
          src={current.url}
          alt={current.alt || title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-10 border-0 bg-transparent p-0 cursor-zoom-in"
          aria-label="Ampliar foto"
        />
      </div>

      {list.length > 1 ? (
        <div className="relative mt-3 w-full min-w-0 max-w-full">
          <div ref={thumbsRef} className="overflow-x-auto pb-1 [scrollbar-width:thin]">
            <div className="flex w-max gap-2">
              {list.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative h-[4.5rem] w-[6rem] shrink-0 overflow-hidden rounded-xl border-2 bg-ice p-0 ${
                    i === active ? "border-navy" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt || title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>

          {canScrollRight ? (
            <button
              type="button"
              onClick={scrollMoreThumbs}
              aria-label="Ver mais fotos"
              className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-light bg-white/95 text-navy shadow-sm transition hover:bg-white"
            >
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          ) : null}
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
          <div className="relative flex h-[80vh] w-full max-w-5xl items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt || title}
              className="max-h-full max-w-full object-contain"
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
