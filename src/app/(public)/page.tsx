import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getMostLikedProperties, getPublishedCities } from "@/lib/properties";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";


export const dynamic = "force-dynamic";
export default async function HomePage() {
  const settings = await getSiteSettings();

  let liked: Awaited<ReturnType<typeof getMostLikedProperties>> = [];
  let cities: string[] = [];
  let neighborhoods: { id: string; name: string; slug: string; imageUrl: string | null }[] = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let posts: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverUrl: string | null;
    publishedAt: Date | null;
    category: { name: string } | null;
  }[] = [];

  try {
    [liked, cities, neighborhoods, testimonials, posts] = await Promise.all([
      getMostLikedProperties(6),
      getPublishedCities(),
      prisma.neighborhood.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.testimonial.findMany({
        where: { published: true, authorized: true, showOnHome: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.blogPost.findMany({
        where: { status: "publicado" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { category: true },
      }),
    ]);
  } catch (error) {
    console.error("[HomePage] database error:", error);
  }

  const homeTestimonials =
    testimonials.length > 0
      ? testimonials
      : await prisma.testimonial
          .findMany({
            where: { published: true, authorized: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
            take: 6,
          })
          .catch(() => []);

  return (
    <>
      <HeroSearch
        headline={settings.heroHeadline}
        subheadline={settings.heroSubheadline}
        cities={cities}
        neighborhoods={neighborhoods.map((n) => ({ name: n.name, slug: n.slug }))}
      />

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            title="Os imóveis que mais despertam interesse"
            subtitle="Explore os imóveis mais curtidos pelos visitantes e descubra oportunidades selecionadas em todo o Brasil."
          />
          {liked.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liked.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-light bg-ice p-10 text-center text-gray-muted">
              Nenhum imóvel publicado ainda. Cadastre imóveis no painel administrativo.
            </p>
          )}
          <div className="mt-10 text-center">
            <Button href="/imoveis" size="lg">
              Ver todos os imóveis
            </Button>
          </div>
        </div>
      </section>

      <section className="section-pad bg-ice">
        <div className="container-site">
          <SectionHeading
            title="Encontre o endereço que combina com você"
            subtitle="Explore regiões valorizadas e descubra oportunidades alinhadas ao seu estilo de vida."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((n) => (
              <Link
                key={n.id}
                href={`/imoveis?neighborhood=${n.slug}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl"
              >
                <Image
                  src={
                    n.imageUrl ||
                    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&q=80"
                  }
                  alt={`Imóveis em ${n.name}`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-bold text-white">{n.name}</h3>
                  <p className="text-sm text-white/80">Ver imóveis</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ice shadow-[var(--shadow)]">
            {settings.photoUrl ? (
              <Image
                src={settings.photoUrl}
                alt="Marcelo Alvares"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,#102A43,#071D34)] p-8 text-center text-white">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Fotografia profissional</p>
                  <p className="mt-3 text-3xl font-bold">Marcelo Alvares</p>
                  <p className="mt-2 text-sm text-white/70">Adicione a foto no painel administrativo</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-muted">Sobre</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Experiência que transforma decisões em bons negócios.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-muted md:text-lg">
              Com mais de 30 anos de atuação no mercado imobiliário, Marcelo Alvares combina conhecimento
              econômico, visão estratégica e atendimento personalizado para orientar decisões de compra,
              venda, locação e investimento.
            </p>
            <Button href="/sobre" className="mt-8" size="lg">
              Conheça Marcelo Alvares
            </Button>
          </div>
        </div>
      </section>

      {homeTestimonials.length > 0 ? (
        <section className="section-pad bg-ice">
          <div className="container-site">
            <SectionHeading
              title="A confiança de quem já fez um bom negócio"
              subtitle="Depoimentos reais de clientes que confiaram na orientação de Marcelo Alvares."
            />
            <TestimonialsCarousel testimonials={homeTestimonials} />
            <div className="mt-8 text-center">
              <Button href="/sobre" variant="secondary">
                Conheça nossa trajetória
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            title="Informação para decisões inteligentes"
            subtitle="Artigos sobre o mercado imobiliário, bairros, investimentos e dicas para compradores."
          />
          {posts.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-[var(--shadow)] transition hover:-translate-y-1"
                >
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] bg-ice">
                    {post.coverUrl ? (
                      <Image
                        src={post.coverUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : null}
                  </Link>
                  <div className="space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-muted">
                      {post.category?.name || "Blog"} · {formatDate(post.publishedAt)}
                    </p>
                    <h3 className="text-lg font-bold text-navy">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="line-clamp-3 text-sm text-gray-muted">{post.excerpt}</p>
                    <Button href={`/blog/${post.slug}`} variant="secondary" size="sm">
                      Ler artigo
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-light bg-ice p-8 text-center text-gray-muted">
              Nenhum artigo publicado ainda.
            </p>
          )}
          <div className="mt-10 text-center">
            <Button href="/blog" size="lg">
              Acessar o blog
            </Button>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[linear-gradient(135deg,#102A43,#071D34)] text-white">
        <div className="container-site max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">O imóvel ideal merece uma busca personalizada.</h2>
          <p className="mt-4 text-white/80">
            Conte com a experiência de Marcelo Alvares para encontrar oportunidades alinhadas ao seu estilo
            de vida e aos seus objetivos.
          </p>
          <div className="mt-8">
            <Button
              href={settings.whatsapp ? `https://wa.me/55${settings.whatsapp.replace(/\D/g, "")}` : "/contato"}
              className="bg-white text-navy hover:bg-ice"
              size="lg"
            >
              Converse com Marcelo
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
