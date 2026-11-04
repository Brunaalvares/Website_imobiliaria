"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { dealTypeLabel, formatDate } from "@/lib/utils";

type Testimonial = {
  id: string;
  clientName: string;
  photoUrl: string | null;
  text: string;
  dealType: string;
  dealDate: Date | string | null;
};

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const current = testimonials[index];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-light bg-white p-8 shadow-[var(--shadow)] md:p-12">
      <Quote className="absolute right-8 top-8 text-gray-light" size={48} />
      <div className="relative min-h-[180px]">
        <p className="max-w-3xl text-lg leading-relaxed text-gray-dark md:text-xl">
          “{current.text}”
        </p>
        <div className="mt-8 flex items-center gap-4">
          {current.photoUrl ? (
            <Image
              src={current.photoUrl}
              alt={current.clientName}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ice text-lg font-bold text-navy">
              {current.clientName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-navy">{current.clientName}</p>
            <p className="text-sm text-gray-muted">
              {dealTypeLabel(current.dealType)}
              {current.dealDate ? ` · ${formatDate(current.dealDate)}` : ""}
            </p>
          </div>
        </div>
      </div>

      {testimonials.length > 1 ? (
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-light text-navy hover:bg-ice"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-light text-navy hover:bg-ice"
          >
            <ChevronRight size={18} />
          </button>
          <div className="ml-2 flex gap-1.5">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Ir para depoimento ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-navy" : "bg-gray-light"}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
