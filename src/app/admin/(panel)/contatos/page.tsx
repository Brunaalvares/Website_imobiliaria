import { prisma } from "@/lib/prisma";
import { ContactManager } from "@/components/admin/ContactManager";

export default async function AdminContactsPage() {
  const [contacts, visits] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      include: { property: { select: { title: true, code: true } } },
    }),
    prisma.visitRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { property: { select: { title: true, code: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Contatos e visitas</h1>
        <p className="text-gray-muted">Acompanhe leads e solicitações recebidas pelo site.</p>
      </div>
      <ContactManager
        contacts={contacts.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          propertyTitle: c.property ? `${c.property.title} (${c.property.code})` : null,
        }))}
        visits={visits.map((v) => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          propertyTitle: `${v.property.title} (${v.property.code})`,
        }))}
      />
    </div>
  );
}
