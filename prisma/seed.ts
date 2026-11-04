import { PrismaClient } from "@prisma/client";
import {
  BLOG_CATEGORIES,
  CONDO_AMENITIES,
  DEFAULT_NEIGHBORHOODS,
  PROPERTY_AMENITIES,
} from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "Marcelo Alvares",
      institutionalText:
        "Marcelo Alvares é economista e especialista no mercado imobiliário, com mais de 30 anos de experiência na realização de negócios que conectam pessoas às melhores oportunidades de compra, venda, locação e investimento. Conselheiro do CRECI-MA, une conhecimento de mercado, visão estratégica e atendimento personalizado para proporcionar negociações seguras e decisões patrimoniais inteligentes.",
      footerText:
        "Experiência, confiança e conhecimento de mercado para orientar cada decisão imobiliária.",
      heroHeadline: "Seu próximo imóvel começa com uma boa escolha.",
      heroSubheadline:
        "Encontre imóveis selecionados em São Luís com a orientação de quem conhece o mercado imobiliário há mais de 30 anos.",
      whatsapp: "",
      phone: "",
      email: "",
      creci: "",
      address: "",
      instagram: "",
    },
  });

  for (const [index, n] of DEFAULT_NEIGHBORHOODS.entries()) {
    await prisma.neighborhood.upsert({
      where: { slug: n.slug },
      update: { name: n.name, order: index, published: true },
      create: {
        name: n.name,
        slug: n.slug,
        order: index,
        published: true,
        description: `Imóveis selecionados em ${n.name}, São Luís — MA.`,
      },
    });
  }

  for (const a of [...PROPERTY_AMENITIES, ...CONDO_AMENITIES]) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: { name: a.name, category: a.category },
      create: { name: a.name, slug: a.slug, category: a.category },
    });
  }

  for (const c of BLOG_CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
  }

  const existingDemo = await prisma.property.findFirst({
    where: { code: "MA-DEMO-0001" },
  });

  if (!existingDemo) {
    const neighborhoods = await prisma.neighborhood.findMany();
    const condoAmenities = await prisma.amenity.findMany({ where: { category: "condo" } });
    const demoProperties = [
      {
        code: "MA-DEMO-0001",
        title: "[DEMO] Apartamento com vista privilegiada na Península",
        slug: "demo-apartamento-vista-peninsula",
        description:
          "Conteúdo demonstrativo para desenvolvimento. Apartamento amplo com salas integradas, cozinha americana e varanda com vista. Substitua este cadastro por imóveis reais no painel administrativo.",
        type: "apartamento",
        purpose: "venda",
        price: 1250000,
        privateArea: 128,
        totalArea: 145,
        bedrooms: 3,
        suites: 1,
        bathrooms: 3,
        parkingSpots: 2,
        seaView: true,
        balcony: true,
        neighborhoodSlug: "peninsula",
        featured: true,
        isNew: true,
        likeCount: 12,
      },
      {
        code: "MA-DEMO-0002",
        title: "[DEMO] Cobertura duplex no Calhau",
        slug: "demo-cobertura-duplex-calhau",
        description:
          "Conteúdo demonstrativo. Cobertura duplex com terraço gourmet e área social generosa. Utilize o painel para publicar imóveis reais.",
        type: "cobertura",
        purpose: "venda",
        price: 2890000,
        privateArea: 260,
        totalArea: 320,
        bedrooms: 4,
        suites: 3,
        bathrooms: 5,
        parkingSpots: 3,
        seaView: true,
        balcony: true,
        neighborhoodSlug: "calhau",
        featured: true,
        isExclusive: true,
        likeCount: 18,
      },
      {
        code: "MA-DEMO-0003",
        title: "[DEMO] Casa contemporânea na Ponta d'Areia",
        slug: "demo-casa-contemporanea-ponta-d-areia",
        description:
          "Conteúdo demonstrativo. Casa de alto padrão com jardim e espaço gourmet. Cadastre imóveis reais pelo painel administrativo.",
        type: "casa",
        purpose: "venda",
        price: 2100000,
        privateArea: 310,
        totalArea: 380,
        bedrooms: 4,
        suites: 2,
        bathrooms: 4,
        parkingSpots: 4,
        balcony: true,
        neighborhoodSlug: "ponta-d-areia",
        isOpportunity: true,
        likeCount: 9,
      },
      {
        code: "MA-DEMO-0004",
        title: "[DEMO] Apartamento mobiliado para locação no Renascença",
        slug: "demo-apartamento-mobiliado-renascenca",
        description:
          "Conteúdo demonstrativo. Unidade mobiliada pronta para morar. Substitua por anúncios reais no painel.",
        type: "apartamento",
        purpose: "locacao",
        price: 6500,
        privateArea: 95,
        totalArea: 110,
        bedrooms: 2,
        suites: 1,
        bathrooms: 2,
        parkingSpots: 1,
        furnished: true,
        neighborhoodSlug: "renascenca",
        likeCount: 7,
      },
      {
        code: "MA-DEMO-0005",
        title: "[DEMO] Apartamento alto padrão na Ponta do Farol",
        slug: "demo-apartamento-ponta-do-farol",
        description:
          "Conteúdo demonstrativo. Apartamento com planta bem distribuída e acabamento superior.",
        type: "apartamento",
        purpose: "venda",
        price: 1680000,
        privateArea: 156,
        totalArea: 180,
        bedrooms: 3,
        suites: 2,
        bathrooms: 3,
        parkingSpots: 2,
        seaView: true,
        neighborhoodSlug: "ponta-do-farol",
        featured: true,
        likeCount: 15,
      },
      {
        code: "MA-DEMO-0006",
        title: "[DEMO] Lançamento residencial em São Marcos",
        slug: "demo-lancamento-sao-marcos",
        description:
          "Conteúdo demonstrativo. Unidade em lançamento com plantas flexíveis e lazer completo.",
        type: "apartamento",
        purpose: "venda",
        price: 890000,
        privateArea: 78,
        totalArea: 92,
        bedrooms: 2,
        suites: 1,
        bathrooms: 2,
        parkingSpots: 1,
        neighborhoodSlug: "sao-marcos",
        isNew: true,
        likeCount: 11,
      },
    ];

    for (const demo of demoProperties) {
      const neighborhood = neighborhoods.find((n) => n.slug === demo.neighborhoodSlug);
      const { neighborhoodSlug: _ns, ...data } = demo;
      const property = await prisma.property.create({
        data: {
          ...data,
          status: "publicado",
          city: "São Luís",
          state: "MA",
          publishedAt: new Date(),
          neighborhoodId: neighborhood?.id,
          latitude: -2.5,
          longitude: -44.3,
          showExactLocation: false,
          condoFee: data.purpose === "venda" ? 1200 : 800,
          photos: {
            create: [
              {
                url: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80`,
                alt: `${data.title} — imagem demonstrativa`,
                order: 0,
                isCover: true,
              },
              {
                url: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80`,
                alt: "Ambiente interno — imagem demonstrativa",
                order: 1,
                isCover: false,
              },
            ],
          },
        },
      });

      const selected = condoAmenities.slice(0, 6);
      if (selected.length) {
        await prisma.propertyAmenity.createMany({
          data: selected.map((a) => ({ propertyId: property.id, amenityId: a.id })),
        });
      }
    }
  }

  const category = await prisma.blogCategory.findFirst({
    where: { slug: "mercado-imobiliario" },
  });

  const existingPost = await prisma.blogPost.findFirst({
    where: { slug: "demo-como-escolher-imovel-sao-luis" },
  });

  if (!existingPost && category) {
    await prisma.blogPost.create({
      data: {
        title: "[DEMO] Como escolher o imóvel certo em São Luís",
        slug: "demo-como-escolher-imovel-sao-luis",
        excerpt:
          "Artigo demonstrativo com orientações gerais para quem busca imóveis residenciais de médio e alto padrão na capital maranhense.",
        content: `<p>Este é um artigo <strong>demonstrativo</strong> criado para ilustrar o blog do site. Substitua-o por conteúdos reais no painel administrativo.</p>
<h2>Conheça o bairro</h2>
<p>Avaliar localização, infraestrutura e perfil do entorno é essencial antes de decidir por um imóvel em São Luís.</p>
<h2>Analise o custo total</h2>
<p>Além do preço de aquisição, considere condomínio, IPTU e potencial de valorização.</p>
<h2>Conte com orientação especializada</h2>
<p>Um corretor experiente ajuda a interpretar o mercado e a negociar com segurança.</p>`,
        categoryId: category.id,
        authorName: "Marcelo Alvares",
        readingMinutes: 4,
        status: "publicado",
        publishedAt: new Date(),
        coverUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
        metaTitle: "[DEMO] Como escolher o imóvel certo em São Luís",
        metaDescription:
          "Orientações demonstrativas para compra de imóveis em São Luís — MA.",
      },
    });

    const cat2 = await prisma.blogCategory.findFirst({ where: { slug: "sao-luis-e-seus-bairros" } });
    if (cat2) {
      await prisma.blogPost.create({
        data: {
          title: "[DEMO] Península e Calhau: o que observar antes de comprar",
          slug: "demo-peninsula-calhau-o-que-observar",
          excerpt:
            "Comparativo demonstrativo entre duas regiões valorizadas de São Luís para quem busca apartamentos de alto padrão.",
          content: `<p>Conteúdo demonstrativo sobre bairros de São Luís. Atualize com análises reais no painel.</p>
<h2>Península</h2>
<p>Região com empreendimentos contemporâneos e forte apelo residencial.</p>
<h2>Calhau</h2>
<p>Área consolidada, com vista privilegiada e demanda constante.</p>`,
          categoryId: cat2.id,
          authorName: "Marcelo Alvares",
          readingMinutes: 3,
          status: "publicado",
          publishedAt: new Date(Date.now() - 86400000),
          coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
        },
      });
    }

    const cat3 = await prisma.blogCategory.findFirst({ where: { slug: "investimentos" } });
    if (cat3) {
      await prisma.blogPost.create({
        data: {
          title: "[DEMO] Investir em imóveis em São Luís: pontos de atenção",
          slug: "demo-investir-imoveis-sao-luis",
          excerpt:
            "Texto demonstrativo sobre critérios econômicos para avaliar oportunidades de investimento imobiliário.",
          content: `<p>Artigo demonstrativo. Utilize o editor do painel para publicar análises reais do mercado.</p>
<h2>Liquidez e localização</h2>
<p>Imóveis bem localizados tendem a oferecer melhor liquidez na revenda ou locação.</p>`,
          categoryId: cat3.id,
          authorName: "Marcelo Alvares",
          readingMinutes: 5,
          status: "publicado",
          publishedAt: new Date(Date.now() - 172800000),
          coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
        },
      });
    }
  }

  console.log("Seed concluído. Crie o primeiro administrador em /admin/setup");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
