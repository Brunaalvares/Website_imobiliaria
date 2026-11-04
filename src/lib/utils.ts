import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: "pt" });
}

export function formatCurrency(value: number, purpose?: string) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
  if (purpose === "locacao") return `${formatted}/mês`;
  return formatted;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function propertyTypeLabel(type: string) {
  const map: Record<string, string> = {
    apartamento: "Apartamento",
    casa: "Casa",
    cobertura: "Cobertura",
    terreno: "Terreno",
    comercial: "Comercial",
  };
  return map[type] ?? type;
}

export function purposeLabel(purpose: string) {
  return purpose === "locacao" ? "Aluguel" : "Venda";
}

export function dealTypeLabel(type: string) {
  const map: Record<string, string> = {
    compra: "Compra",
    venda: "Venda",
    locacao: "Locação",
    investimento: "Investimento",
  };
  return map[type] ?? type;
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    rascunho: "Rascunho",
    publicado: "Publicado",
    vendido: "Vendido",
    alugado: "Alugado",
    arquivado: "Arquivado",
    novo: "Novo",
    em_atendimento: "Em atendimento",
    visita_agendada: "Visita agendada",
    concluido: "Concluído",
  };
  return map[status] ?? status;
}

export function whatsappUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
