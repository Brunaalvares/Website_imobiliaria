export const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "cobertura", label: "Cobertura" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
] as const;

export const PURPOSES = [
  { value: "venda", label: "Comprar" },
  { value: "locacao", label: "Alugar" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "rascunho", label: "Rascunho" },
  { value: "publicado", label: "Publicado" },
  { value: "vendido", label: "Vendido" },
  { value: "alugado", label: "Alugado" },
  { value: "arquivado", label: "Arquivado" },
] as const;

export const CONTACT_SUBJECTS = [
  { value: "quero_comprar", label: "Quero comprar" },
  { value: "quero_vender", label: "Quero vender" },
  { value: "quero_alugar", label: "Quero alugar" },
  { value: "quero_anunciar", label: "Quero anunciar meu imóvel" },
  { value: "investimentos", label: "Investimentos" },
  { value: "outros", label: "Outros" },
] as const;

export const CONTACT_STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "visita_agendada", label: "Visita agendada" },
  { value: "concluido", label: "Concluído" },
  { value: "arquivado", label: "Arquivado" },
] as const;

export const DEAL_TYPES = [
  { value: "compra", label: "Compra" },
  { value: "venda", label: "Venda" },
  { value: "locacao", label: "Locação" },
  { value: "investimento", label: "Investimento" },
] as const;

export const BLOG_CATEGORIES = [
  { name: "Mercado imobiliário", slug: "mercado-imobiliario" },
  { name: "São Luís e seus bairros", slug: "sao-luis-e-seus-bairros" },
  { name: "Compra e venda", slug: "compra-e-venda" },
  { name: "Investimentos", slug: "investimentos" },
  { name: "Arquitetura e decoração", slug: "arquitetura-e-decoracao" },
  { name: "Dicas para compradores", slug: "dicas-para-compradores" },
  { name: "Tendências imobiliárias", slug: "tendencias-imobiliarias" },
] as const;

export const DEFAULT_NEIGHBORHOODS = [
  { name: "Península", slug: "peninsula" },
  { name: "Ponta d'Areia", slug: "ponta-d-areia" },
  { name: "Ponta do Farol", slug: "ponta-do-farol" },
  { name: "Calhau", slug: "calhau" },
  { name: "Renascença", slug: "renascenca" },
  { name: "São Marcos", slug: "sao-marcos" },
] as const;

export const PROPERTY_AMENITIES = [
  { name: "Varanda", slug: "varanda", category: "property" },
  { name: "Vista para o mar", slug: "vista-mar", category: "property" },
  { name: "Dependência de serviço", slug: "dependencia-servico", category: "property" },
  { name: "Lavabo", slug: "lavabo", category: "property" },
  { name: "Escritório", slug: "escritorio", category: "property" },
  { name: "Mobiliado", slug: "mobiliado", category: "property" },
] as const;

export const CONDO_AMENITIES = [
  { name: "Academia", slug: "academia", category: "condo" },
  { name: "Piscina", slug: "piscina", category: "condo" },
  { name: "Salão de festas", slug: "salao-festas", category: "condo" },
  { name: "Salão de jogos", slug: "salao-jogos", category: "condo" },
  { name: "Espaço gourmet", slug: "espaco-gourmet", category: "condo" },
  { name: "Churrasqueira", slug: "churrasqueira", category: "condo" },
  { name: "Playground", slug: "playground", category: "condo" },
  { name: "Brinquedoteca", slug: "brinquedoteca", category: "condo" },
  { name: "Quadra esportiva", slug: "quadra-esportiva", category: "condo" },
  { name: "Portaria 24 horas", slug: "portaria-24h", category: "condo" },
  { name: "Portaria remota", slug: "portaria-remota", category: "condo" },
  { name: "Segurança 24 horas", slug: "seguranca-24h", category: "condo" },
  { name: "Circuito de câmeras", slug: "cameras", category: "condo" },
  { name: "Coworking", slug: "coworking", category: "condo" },
  { name: "Sauna", slug: "sauna", category: "condo" },
  { name: "Spa", slug: "spa", category: "condo" },
  { name: "Elevador", slug: "elevador", category: "condo" },
  { name: "Gerador", slug: "gerador", category: "condo" },
  { name: "Pet place", slug: "pet-place", category: "condo" },
  { name: "Bicicletário", slug: "bicicletario", category: "condo" },
  { name: "Acessibilidade", slug: "acessibilidade", category: "condo" },
  { name: "Vagas para visitantes", slug: "vagas-visitantes", category: "condo" },
] as const;

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor_preco", label: "Menor preço" },
  { value: "maior_preco", label: "Maior preço" },
  { value: "maior_area", label: "Maior área" },
  { value: "mais_curtidos", label: "Mais curtidos" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
] as const;
