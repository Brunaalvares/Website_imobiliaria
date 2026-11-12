import { plainTextFromHtml } from "./sanitize-html";

export type SeoCheck = {
  id: string;
  label: string;
  ok: boolean;
  tip: string;
};

export function buildSeoChecklist(input: {
  title: string;
  contentHtml: string;
  focusKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}): SeoCheck[] {
  const keyword = (input.focusKeyword || "").trim().toLowerCase();
  const title = input.title.toLowerCase();
  const metaTitle = (input.metaTitle || input.title).toLowerCase();
  const plain = plainTextFromHtml(input.contentHtml).toLowerCase();
  const firstParagraph = plain.slice(0, 280);
  const hasH2 = /<h2[\s>]/i.test(input.contentHtml);
  const hasH3 = /<h3[\s>]/i.test(input.contentHtml);
  const hasInternalLink = /href=["']\/[^"']+["']/i.test(input.contentHtml);
  const hasExternalLink = /href=["']https?:\/\/[^"']+["']/i.test(input.contentHtml);
  const images = [...input.contentHtml.matchAll(/<img\b[^>]*>/gi)];
  const imagesWithAlt = images.filter((m) => /\balt=["'][^"']+["']/i.test(m[0]));
  const words = plain.split(/\s+/).filter(Boolean).length;
  const sentences = Math.max(1, (plain.match(/[.!?]+/g) || []).length);
  const avgWordsPerSentence = words / sentences;

  return [
    {
      id: "kw-title",
      label: "Palavra-chave no título",
      ok: !keyword || title.includes(keyword) || metaTitle.includes(keyword),
      tip: "Inclua a palavra-chave principal no título do artigo.",
    },
    {
      id: "kw-intro",
      label: "Palavra-chave no primeiro parágrafo",
      ok: !keyword || firstParagraph.includes(keyword),
      tip: "Mencione a palavra-chave logo no início do texto.",
    },
    {
      id: "headings",
      label: "Estrutura com H2/H3",
      ok: hasH2 || hasH3,
      tip: "Organize o conteúdo com subtítulos H2 e H3.",
    },
    {
      id: "internal-links",
      label: "Links internos",
      ok: hasInternalLink,
      tip: "Adicione links para outras páginas do site.",
    },
    {
      id: "external-links",
      label: "Links externos",
      ok: hasExternalLink,
      tip: "Referencie fontes externas confiáveis quando fizer sentido.",
    },
    {
      id: "alt-text",
      label: "Alt text nas imagens",
      ok: images.length === 0 || imagesWithAlt.length === images.length,
      tip: "Todas as imagens devem ter texto alternativo.",
    },
    {
      id: "meta-description",
      label: "Meta-description na faixa ideal",
      ok: !input.metaDescription || (input.metaDescription.length >= 120 && input.metaDescription.length <= 170),
      tip: "Prefira meta-description entre 140 e 160 caracteres.",
    },
    {
      id: "readability",
      label: "Legibilidade (frases objetivas)",
      ok: words < 80 || avgWordsPerSentence <= 28,
      tip: "Prefira frases mais curtas para facilitar a leitura.",
    },
  ];
}
