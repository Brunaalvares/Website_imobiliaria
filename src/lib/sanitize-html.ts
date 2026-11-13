import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
  "mark",
  "sup",
  "sub",
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ["href", "name", "target", "rel", "title", "class"],
  img: ["src", "alt", "title", "width", "height", "class"],
  "*": [
    "class",
    "style",
    "colspan",
    "rowspan",
    "data-checked",
    "data-type",
  ],
};

export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html || "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function plainTextFromHtml(html: string) {
  return sanitizeBlogHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
