import type { Prisma } from "@prisma/client";
import { FEATURED_CITIES } from "./constants";
import { prisma } from "./prisma";

export type PropertyFilters = {
  q?: string;
  purpose?: string;
  type?: string;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parking?: number;
  furnished?: boolean;
  seaView?: boolean;
  isNew?: boolean;
  amenities?: string[];
  sort?: string;
  page?: number;
  pageSize?: number;
  status?: string;
};

function keywordClauses(term: string): Prisma.PropertyWhereInput[] {
  return [
    { title: { contains: term, mode: "insensitive" } },
    { description: { contains: term, mode: "insensitive" } },
    { code: { contains: term, mode: "insensitive" } },
    { city: { contains: term, mode: "insensitive" } },
    { state: { contains: term, mode: "insensitive" } },
    { neighborhoodName: { contains: term, mode: "insensitive" } },
    { address: { contains: term, mode: "insensitive" } },
    { type: { contains: term, mode: "insensitive" } },
    { neighborhood: { name: { contains: term, mode: "insensitive" } } },
  ];
}

export function buildPropertyWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: filters.status ?? "publicado",
  };

  const and: Prisma.PropertyWhereInput[] = [];

  if (filters.q) {
    const tokens = filters.q
      .trim()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    if (tokens.length) {
      for (const token of tokens) {
        and.push({ OR: keywordClauses(token) });
      }
    } else {
      const q = filters.q.trim();
      if (q) and.push({ OR: keywordClauses(q) });
    }
  }

  if (filters.purpose) where.purpose = filters.purpose;
  if (filters.type) where.type = filters.type;
  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }
  if (filters.neighborhood) {
    and.push({
      OR: [
        { neighborhoodName: { contains: filters.neighborhood, mode: "insensitive" } },
        { neighborhood: { name: { contains: filters.neighborhood, mode: "insensitive" } } },
        { neighborhood: { slug: filters.neighborhood } },
      ],
    });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }
  if (filters.minArea != null || filters.maxArea != null) {
    where.privateArea = {};
    if (filters.minArea != null) where.privateArea.gte = filters.minArea;
    if (filters.maxArea != null) where.privateArea.lte = filters.maxArea;
  }
  if (filters.bedrooms != null) where.bedrooms = { gte: filters.bedrooms };
  if (filters.suites != null) where.suites = { gte: filters.suites };
  if (filters.bathrooms != null) where.bathrooms = { gte: filters.bathrooms };
  if (filters.parking != null) where.parkingSpots = { gte: filters.parking };
  if (filters.furnished) where.furnished = true;
  if (filters.seaView) where.seaView = true;
  if (filters.isNew) where.isNew = true;
  if (filters.amenities?.length) {
    and.push(
      ...filters.amenities.map((slug) => ({
        amenities: { some: { amenity: { slug } } },
      })),
    );
  }

  if (and.length) where.AND = and;

  return where;
}

export function buildPropertyOrderBy(
  sort?: string,
): Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "menor_preco":
      return { price: "asc" };
    case "maior_preco":
      return { price: "desc" };
    case "maior_area":
      return { privateArea: "desc" };
    case "mais_curtidos":
      return { likeCount: "desc" };
    case "recentes":
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

export function propertyNeighborhoodLabel(property: {
  neighborhoodName?: string | null;
  neighborhood?: { name: string } | null;
}) {
  return property.neighborhoodName?.trim() || property.neighborhood?.name || "";
}

export async function searchProperties(filters: PropertyFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 12;
  const where = buildPropertyWhere(filters);
  const orderBy = buildPropertyOrderBy(filters.sort);

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
        neighborhood: true,
        amenities: { include: { amenity: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMostLikedProperties(limit = 6) {
  return prisma.property.findMany({
    where: { status: "publicado" },
    orderBy: [{ likeCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: {
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      neighborhood: true,
    },
  });
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      neighborhood: true,
      amenities: { include: { amenity: true } },
    },
  });
}

export async function getSimilarProperties(property: {
  id: string;
  neighborhoodId: string | null;
  neighborhoodName?: string | null;
  type: string;
  price: number;
  city?: string;
}) {
  return prisma.property.findMany({
    where: {
      status: "publicado",
      id: { not: property.id },
      OR: [
        property.neighborhoodName
          ? { neighborhoodName: { equals: property.neighborhoodName, mode: "insensitive" } }
          : undefined,
        { neighborhoodId: property.neighborhoodId ?? undefined },
        property.city ? { city: { equals: property.city, mode: "insensitive" } } : undefined,
        { type: property.type },
        {
          price: {
            gte: property.price * 0.7,
            lte: property.price * 1.3,
          },
        },
      ].filter(Boolean) as Prisma.PropertyWhereInput[],
    },
    take: 3,
    orderBy: { likeCount: "desc" },
    include: {
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      neighborhood: true,
    },
  });
}

export async function getPublishedCities() {
  const rows = await prisma.property.findMany({
    where: {
      status: "publicado",
      NOT: { city: "" },
    },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const fromDb = rows.map((r) => r.city).filter(Boolean);
  return Array.from(new Set([...FEATURED_CITIES, ...fromDb])).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}
