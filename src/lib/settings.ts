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
  const prefix = `MA-${year}-`;

  // Usa o maior sufixo já existente no ano — count() quebra quando há buracos
  // (exclusões ou códigos fora de ordem) e gera conflito de unique em `code`.
  const latest = await prisma.property.findMany({
    where: { code: { startsWith: prefix } },
    select: { code: true },
    orderBy: { code: "desc" },
    take: 50,
  });

  let next = 1;
  for (const row of latest) {
    const match = row.code.match(/MA-\d{4}-(\d+)$/);
    if (!match) continue;
    const n = Number(match[1]);
    if (Number.isFinite(n) && n >= next) next = n + 1;
  }

  // Garante unicidade mesmo sob concorrência.
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = `${prefix}${String(next + attempt).padStart(4, "0")}`;
    const exists = await prisma.property.findUnique({ where: { code }, select: { id: true } });
    if (!exists) return code;
  }

  return `${prefix}${Date.now().toString().slice(-6)}`;
}
