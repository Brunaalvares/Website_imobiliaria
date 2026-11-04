"use client";

import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/utils";

export function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;
  return (
    <a
      href={whatsappUrl(whatsapp, "Olá, Marcelo! Vim pelo site e gostaria de conversar.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-[0_10px_30px_rgba(16,42,67,0.35)] transition hover:scale-105 hover:bg-navy-dark"
    >
      <MessageCircle size={24} />
    </a>
  );
}
