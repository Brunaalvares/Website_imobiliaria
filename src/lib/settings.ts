import { prisma } from "./prisma";

const FALLBACK = {
  id: "default",
  brandName: "Marcelo Alvares",
  logoUrl: null as string | null,
  photoUrl: null as string | null,
  institutionalText:
    "Marcelo Alvares é economista e especialista no mercado imobiliário, com mais de 30 anos de experiência na realização de negócios que conectam pessoas às melhores oportunidades de compra, venda, locação e investimento. Conselheiro do CRECI-MA, une conhecimento de mercado, visão estratégica e atendimento personalizado para proporcionar negociações seguras e decisões patrimoniais inteligentes.",
  whatsapp: "",
  phone: "",
  email: "",
  instagram: "",
  address: "",
  creci: "",
  footerText:
    "Experiência, confiança e conhecimento de mercado para orientar cada decisão imobiliária.",
  heroHeadline: "Seu próximo imóvel começa com uma boa escolha.",
  heroSubheadline:
    "Encontre imóveis selecionados em todo o Brasil com a orientação de quem conhece o mercado imobiliário há mais de 30 anos.",
  heroImageUrl: null as string | null,
  analyticsId: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  updatedAt: new Date(),
};

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "default" } });
    }
    return settings;
  } catch (error) {
    console.error("[getSiteSettings] database error:", error);
    // Keep the public shell available while surfacing DB issues in logs / healthcheck
    return FALLBACK;
  }
}

export async function generatePropertyCode() {
  const year = new Date().getFullYear();
  const count = await prisma.property.count();
  return `MA-${year}-${String(count + 1).padStart(4, "0")}`;
}
