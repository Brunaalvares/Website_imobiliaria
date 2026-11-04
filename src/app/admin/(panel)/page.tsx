import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [
    totalProperties,
    published,
    available,
    soldOrRented,
    likes,
    testimonials,
    posts,
    contacts,
    visits,
    topLiked,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "publicado" } }),
    prisma.property.count({ where: { status: "publicado" } }),
    prisma.property.count({ where: { status: { in: ["vendido", "alugado"] } } }),
    prisma.propertyLike.count(),
    prisma.testimonial.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { status: "publicado" } }),
    prisma.contact.count({ where: { status: "novo" } }),
    prisma.visitRequest.count({ where: { status: "novo" } }),
    prisma.property.findMany({
      where: { status: "publicado" },
      orderBy: { likeCount: "desc" },
      take: 5,
      select: { id: true, title: true, likeCount: true, price: true, purpose: true, slug: true },
    }),
  ]);

  const cards = [
    { label: "Total de imóveis", value: totalProperties },
    { label: "Publicados", value: published },
    { label: "Disponíveis", value: available },
    { label: "Vendidos / Alugados", value: soldOrRented },
    { label: "Total de curtidas", value: likes },
    { label: "Depoimentos", value: testimonials },
    { label: "Artigos publicados", value: posts },
    { label: "Novos contatos", value: contacts },
    { label: "Solicitações de visita", value: visits },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-gray-muted">Visão geral do portfólio e captação.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-light bg-white p-5">
        <h2 className="text-lg font-bold text-navy">Imóveis mais curtidos</h2>
        <div className="mt-4 divide-y divide-gray-light">
          {topLiked.length ? (
            topLiked.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <Link href={`/admin/imoveis/${p.id}`} className="font-medium text-navy hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-gray-muted">{formatCurrency(p.price, p.purpose)}</p>
                </div>
                <span className="font-semibold text-navy">{p.likeCount} curtidas</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-gray-muted">Nenhum imóvel publicado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
