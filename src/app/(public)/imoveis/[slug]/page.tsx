import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Maximize2,
  Share2,
} from "lucide-react";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyMap } from "@/components/property/PropertyMap";
import { VisitRequestForm } from "@/components/property/VisitRequestForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPropertyBySlug, getSimilarProperties } from "@/lib/properties";
import { getSiteSettings } from "@/lib/settings";
import {
  formatCurrency,
  propertyTypeLabel,
  purposeLabel,
  whatsappUrl,
} from "@/lib/utils";
import { LikeButton } from "@/components/property/LikeButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || property.status !== "publicado") return { title: "Imóvel" };
  return {
    title: property.metaTitle || property.title,
    description:
      property.metaDescription ||
      `${propertyTypeLabel(property.type)} em ${property.neighborhood?.name || property.city || "Brasil"} — ${formatCurrency(property.price, property.purpose)}`,
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.photos[0]?.url ? [property.photos[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || property.status !== "publicado") notFound();

  const [settings, similar] = await Promise.all([
    getSiteSettings(),
    getSimilarProperties(property),
  ]);

  const condoAmenities = property.amenities
    .filter((a) => a.amenity.category === "condo")
    .map((a) => a.amenity);
  const propertyAmenities = [
    property.furnished ? "Mobiliado" : null,
    property.balcony ? "Varanda" : null,
    property.seaView ? "Vista para o mar" : null,
    property.maidRoom ? "Dependência de serviço" : null,
    property.powderRoom ? "Lavabo" : null,
    property.office ? "Escritório" : null,
    ...property.amenities
      .filter((a) => a.amenity.category === "property")
      .map((a) => a.amenity.name),
  ].filter(Boolean) as string[];

  const waMessage = `Olá, Marcelo! Gostaria de saber mais sobre o imóvel ${property.title}, código ${property.code}.`;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/imoveis/${property.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: shareUrl,
    image: property.photos.map((p) => p.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: "BR",
    },
  };

  return (
    <div className="section-pad">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-8">
            <PropertyGallery photos={property.photos} title={property.title} />

            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{purposeLabel(property.purpose)}</Badge>
                <Badge tone="ice">{propertyTypeLabel(property.type)}</Badge>
                {property.featured ? <Badge tone="ice">Destaque</Badge> : null}
                {property.isExclusive ? <Badge tone="ice">Exclusivo</Badge> : null}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy md:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 text-gray-muted">
                Código {property.code}
                {property.neighborhood ? ` · ${property.neighborhood.name}` : ""}
                {`, ${property.city} — ${property.state}`}
              </p>
              <p className="mt-4 text-3xl font-bold text-navy">
                {formatCurrency(property.price, property.purpose)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-light bg-ice p-5 sm:grid-cols-3 lg:grid-cols-6">
              <Stat icon={<Maximize2 size={18} />} label="Área privativa" value={property.privateArea ? `${property.privateArea} m²` : "—"} />
              <Stat icon={<Building2 size={18} />} label="Área total" value={property.totalArea ? `${property.totalArea} m²` : "—"} />
              <Stat icon={<BedDouble size={18} />} label="Quartos" value={String(property.bedrooms)} />
              <Stat icon={<Bath size={18} />} label="Suítes" value={String(property.suites)} />
              <Stat icon={<Bath size={18} />} label="Banheiros" value={String(property.bathrooms)} />
              <Stat icon={<Car size={18} />} label="Vagas" value={String(property.parkingSpots)} />
            </div>

            <section>
              <h2 className="text-2xl font-bold text-navy">Descrição</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-dark">
                {property.description}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-gray-muted sm:grid-cols-2">
                {property.condoFee != null ? <p>Condomínio: {formatCurrency(property.condoFee)}</p> : null}
                {property.iptu != null ? <p>IPTU: {formatCurrency(property.iptu)}</p> : null}
                {property.floor != null ? <p>Andar: {property.floor}</p> : null}
                {property.financing ? <p>Aceita financiamento</p> : null}
                {property.acceptsTrade ? <p>Aceita permuta</p> : null}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy">Tudo o que este imóvel oferece</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-semibold text-navy">Do imóvel</h3>
                  <ul className="space-y-2 text-sm text-gray-dark">
                    {propertyAmenities.length ? (
                      propertyAmenities.map((item) => (
                        <li key={item} className="rounded-xl bg-ice px-3 py-2">
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-muted">Sem características adicionais cadastradas.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold text-navy">Do condomínio</h3>
                  <ul className="space-y-2 text-sm text-gray-dark">
                    {condoAmenities.length ? (
                      condoAmenities.map((item) => (
                        <li key={item.id} className="rounded-xl bg-ice px-3 py-2">
                          {item.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-muted">Sem comodidades cadastradas.</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {property.latitude != null && property.longitude != null ? (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-navy">Localização</h2>
                <PropertyMap
                  lat={property.latitude}
                  lng={property.longitude}
                  title={property.title}
                  approximate={!property.showExactLocation}
                />
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-[var(--shadow)]">
              <p className="text-sm text-gray-muted">Interessado neste imóvel?</p>
              <p className="mt-1 text-2xl font-bold text-navy">
                {formatCurrency(property.price, property.purpose)}
              </p>
              <div className="mt-5 space-y-3">
                <VisitRequestForm propertyId={property.id} propertyTitle={property.title} />
                {settings.whatsapp ? (
                  <Button
                    href={whatsappUrl(settings.whatsapp, waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    className="w-full"
                  >
                    Conversar pelo WhatsApp
                  </Button>
                ) : (
                  <Button href="/contato" variant="secondary" className="w-full">
                    Entrar em contato
                  </Button>
                )}
                <LikeButton propertyId={property.id} likeCount={property.likeCount} />
                <Button
                  href={`https://wa.me/?text=${encodeURIComponent(`${property.title} — ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  className="w-full"
                >
                  <Share2 size={16} /> Compartilhar
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {similar.length ? (
          <section className="mt-16">
            <SectionHeading title="Imóveis semelhantes" subtitle="Outras oportunidades que podem interessar você." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="text-navy">{icon}</div>
      <p className="mt-2 text-xs text-gray-muted">{label}</p>
      <p className="font-semibold text-navy">{value}</p>
    </div>
  );
}
