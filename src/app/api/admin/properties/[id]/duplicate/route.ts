import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { generatePropertyCode } from "@/lib/settings";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;
  const source = await prisma.property.findUnique({
    where: { id },
    include: { photos: true, amenities: true },
  });
  if (!source) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const code = await generatePropertyCode();
  const slug = `${slugify(source.title)}-copia-${Date.now().toString(36)}`;

  const copy = await prisma.property.create({
    data: {
      code,
      title: `${source.title} (cópia)`,
      slug,
      description: source.description,
      type: source.type,
      purpose: source.purpose,
      status: "rascunho",
      price: source.price,
      condoFee: source.condoFee,
      iptu: source.iptu,
      financing: source.financing,
      acceptsTrade: source.acceptsTrade,
      neighborhoodName: source.neighborhoodName,
      address: source.address,
      city: source.city,
      state: source.state,
      zipCode: source.zipCode,
      showExactLocation: false,
      privateArea: source.privateArea,
      totalArea: source.totalArea,
      bedrooms: source.bedrooms,
      suites: source.suites,
      bathrooms: source.bathrooms,
      parkingSpots: source.parkingSpots,
      floor: source.floor,
      furnished: source.furnished,
      balcony: source.balcony,
      seaView: source.seaView,
      maidRoom: source.maidRoom,
      powderRoom: source.powderRoom,
      office: source.office,
      featured: false,
      isNew: source.isNew,
      isOpportunity: source.isOpportunity,
      isExclusive: source.isExclusive,
      photos: {
        create: source.photos.map((p) => ({
          url: p.url,
          alt: p.alt,
          order: p.order,
          isCover: p.isCover,
        })),
      },
      amenities: {
        create: source.amenities.map((a) => ({ amenityId: a.amenityId })),
      },
    },
  });

  return NextResponse.json(copy);
}
