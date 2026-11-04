export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sobre Marcelo Alvares",
  description:
    "Economista e especialista no mercado imobiliário, conselheiro do CRECI-MA, com mais de 30 anos de experiência em São Luís.",
};

export default async function SobrePage() {
  const [settings, testimonials] = await Promise.all([
    getSiteSettings(),
    prisma.testimonial.findMany({
      where: { published: true, authorized: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const differentials = [
    {
      title: "Experiência de mercado",
      text: "Mais de três décadas de atuação no setor imobiliário.",
    },
    {
      title: "Visão estratégica",
      text: "Conhecimento econômico aliado à análise das oportunidades de mercado.",
    },
    {
      title: "Atendimento personalizado",
      text: "Acompanhamento próximo em cada etapa da jornada imobiliária.",
    },
  ];

  return (
    <>
      <section className="section-pad bg-ice">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-muted">
              Trajetória
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy md:text-5xl">
              Mais de 30 anos conectando pessoas a grandes oportunidades.
            </h1>
            <p className="mt-5 text-lg text-gray-muted">
              Experiência, confiança e conhecimento de mercado para orientar cada decisão imobiliária.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-[var(--shadow)]">
            {settings.photoUrl ? (
              <Image
                src={settings.photoUrl}
                alt="Marcelo Alvares"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,#102A43,#071D34)] p-8 text-center text-white">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Fotografia profissional</p>
                  <p className="mt-3 text-3xl font-bold">Marcelo Alvares</p>
                  <p className="mt-2 text-sm text-white/70">Configure a foto no painel administrativo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-dark">{settings.institutionalText}</p>
        </div>
      </section>

      <section className="section-pad bg-ice">
        <div className="container-site">
          <SectionHeading title="Diferenciais" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {differentials.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-light bg-white p-7 shadow-[var(--shadow)]"
              >
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-gray-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            title="Histórias construídas com confiança"
            subtitle="Depoimentos autorizados de clientes."
          />
          {testimonials.length ? (
            <TestimonialsCarousel testimonials={testimonials} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-light bg-ice p-12 text-center text-gray-muted">
              Em breve, depoimentos de clientes serão publicados aqui.
            </div>
          )}
        </div>
      </section>

      <section className="section-pad bg-[linear-gradient(135deg,#102A43,#071D34)] text-white">
        <div className="container-site max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Vamos encontrar seu próximo imóvel?</h2>
          <Button href="/contato" className="mt-8 bg-white text-navy hover:bg-ice" size="lg">
            Entre em contato
          </Button>
        </div>
      </section>
    </>
  );
}
