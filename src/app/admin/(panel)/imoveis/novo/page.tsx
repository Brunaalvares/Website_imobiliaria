import { PropertyForm } from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";

export default async function NewPropertyPage() {
  const amenities = await prisma.amenity.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Novo imóvel</h1>
        <p className="text-gray-muted">Preencha os dados para publicar no site.</p>
      </div>
      <PropertyForm amenities={amenities} />
    </div>
  );
}
