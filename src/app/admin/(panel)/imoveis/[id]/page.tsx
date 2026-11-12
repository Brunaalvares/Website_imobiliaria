import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";
import { propertyNeighborhoodLabel } from "@/lib/properties";

type Props = { params: Promise<{ id: string }> };

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const [property, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
        amenities: true,
        neighborhood: true,
      },
    }),
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
        amenities={amenities}
        initial={{
          ...property,
          neighborhoodName: propertyNeighborhoodLabel(property),
          amenityIds: property.amenities.map((a) => a.amenityId),
          photos: property.photos,
        }}
      />
    </div>
  );
}
