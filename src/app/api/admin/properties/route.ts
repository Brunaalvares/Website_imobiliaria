import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { generatePropertyCode } from "@/lib/settings";
import { slugify } from "@/lib/utils";

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.string(),
  purpose: z.string(),
  status: z.string().default("rascunho"),
  price: z.number().nonnegative(),
  condoFee: z.number().nullable().optional(),
  iptu: z.number().nullable().optional(),
  financing: z.boolean().optional(),
  acceptsTrade: z.boolean().optional(),
  neighborhoodName: z.string().optional(),
  address: z.string().nullable().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().nullable().optional(),
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

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  const items = await prisma.property.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      neighborhood: true,
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      flat.fieldErrors.description?.[0] ||
      flat.fieldErrors.title?.[0] ||
      flat.fieldErrors.price?.[0] ||
      "Verifique os campos obrigatórios.";
    return NextResponse.json({ error: first, details: flat }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.slug || data.title);
  const existing = await prisma.property.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  try {
    const code = await generatePropertyCode();
    const property = await prisma.property.create({
      data: {
        code,
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
        neighborhoodId: null,
        neighborhoodName: data.neighborhoodName?.trim() || "",
        address: data.address || null,
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || null,
        latitude: null,
        longitude: null,
        showExactLocation: false,
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
        publishedAt: data.status === "publicado" ? new Date() : null,
        photos: data.photos?.length
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
  } catch (err) {
    console.error("[admin/properties POST]", err);
    const message = err instanceof Error ? err.message : "Erro ao criar anúncio";
    if (/Unique constraint|unique/i.test(message)) {
      return NextResponse.json(
        { error: "Já existe um anúncio com este código ou URL. Tente salvar novamente." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
