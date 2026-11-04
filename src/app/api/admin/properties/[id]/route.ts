import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { deleteImageByUrl } from "@/lib/storage";

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.string(),
  purpose: z.string(),
  status: z.string(),
  price: z.number().nonnegative(),
  condoFee: z.number().nullable().optional(),
  iptu: z.number().nullable().optional(),
  financing: z.boolean().optional(),
  acceptsTrade: z.boolean().optional(),
  neighborhoodId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  showExactLocation: z.boolean().optional(),
  privateArea: z.number().nullable().optional(),
  totalArea: z.number().nullable().optional(),
  bedrooms: z.number().int().optional(),
  suites: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  parkingSpots: z.number().int().optional(),
  floor: z.number().int().nullable().optional(),
  furnished: z.boolean().optional(),
  balcony: z.boolean().optional(),
  seaView: z.boolean().optional(),
  maidRoom: z.boolean().optional(),
  powderRoom: z.boolean().optional(),
  office: z.boolean().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOpportunity: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  amenityIds: z.array(z.string()).optional(),
  photos: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().nullable().optional(),
        order: z.number().optional(),
        isCover: z.boolean().optional(),
      }),
    )
    .optional(),
  slug: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      amenities: true,
      neighborhood: true,
    },
  });
  if (!property) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.property.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const data = parsed.data;
  let slug = slugify(data.slug || data.title);
  const slugTaken = await prisma.property.findFirst({ where: { slug, id: { not: id } } });
  if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;

  if (data.photos) {
    const keep = new Set(data.photos.map((p) => p.url));
    for (const photo of existing.photos) {
      if (!keep.has(photo.url)) await deleteImageByUrl(photo.url);
    }
    await prisma.propertyPhoto.deleteMany({ where: { propertyId: id } });
  }

  await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });

  const property = await prisma.property.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      description: data.description,
      type: data.type,
      purpose: data.purpose,
      status: data.status,
      price: data.price,
      condoFee: data.condoFee ?? null,
      iptu: data.iptu ?? null,
      financing: data.financing ?? false,
      acceptsTrade: data.acceptsTrade ?? false,
      neighborhoodId: data.neighborhoodId || null,
      address: data.address || null,
      city: data.city || "São Luís",
      state: data.state || "MA",
      zipCode: data.zipCode || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      showExactLocation: data.showExactLocation ?? false,
      privateArea: data.privateArea ?? null,
      totalArea: data.totalArea ?? null,
      bedrooms: data.bedrooms ?? 0,
      suites: data.suites ?? 0,
      bathrooms: data.bathrooms ?? 0,
      parkingSpots: data.parkingSpots ?? 0,
      floor: data.floor ?? null,
      furnished: data.furnished ?? false,
      balcony: data.balcony ?? false,
      seaView: data.seaView ?? false,
      maidRoom: data.maidRoom ?? false,
      powderRoom: data.powderRoom ?? false,
      office: data.office ?? false,
      featured: data.featured ?? false,
      isNew: data.isNew ?? false,
      isOpportunity: data.isOpportunity ?? false,
      isExclusive: data.isExclusive ?? false,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      publishedAt:
        data.status === "publicado"
          ? existing.publishedAt || new Date()
          : existing.publishedAt,
      photos: data.photos
        ? {
            create: data.photos.map((p, i) => ({
              url: p.url,
              alt: p.alt || null,
              order: p.order ?? i,
              isCover: p.isCover ?? i === 0,
            })),
          }
        : undefined,
      amenities: data.amenityIds?.length
        ? { create: data.amenityIds.map((amenityId) => ({ amenityId })) }
        : undefined,
    },
  });

  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.property.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  for (const photo of existing.photos) await deleteImageByUrl(photo.url);
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
