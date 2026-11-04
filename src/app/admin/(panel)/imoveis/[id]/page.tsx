import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const [property, neighborhoods, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
        amenities: true,
      },
    }),
    prisma.neighborhood.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Editar imóvel</h1>
        <p className="text-gray-muted">Código {property.code}</p>
      </div>
      <PropertyForm
        neighborhoods={neighborhoods}
        amenities={amenities}
        initial={{
          ...property,
          amenityIds: property.amenities.map((a) => a.amenityId),
          photos: property.photos,
        }}
      />
    </div>
  );
}
