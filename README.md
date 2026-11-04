# Website Imobiliário — Marcelo Alvares

Plataforma full-stack para comercialização de imóveis residenciais de médio e alto padrão em São Luís — MA, com site público premium e painel administrativo completo.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4**
- **Prisma** + SQLite (local) — pronto para PostgreSQL/Supabase em produção
- **NextAuth** (credenciais) para área administrativa
- Armazenamento persistente de imagens em `uploads/` (servido via `/api/uploads`)

## Identidade visual

- Azul-marinho `#102A43` / `#071D34`
- Branco / branco gelo `#F7F9FC`
- Tipografia Manrope
- Layout claro, elegante e responsivo

## Começando

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Acesse:

- Site: [http://localhost:3000](http://localhost:3000)
- Setup do 1º admin: [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup)
- Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

> Não há credenciais fixas. O primeiro administrador é criado apenas em `/admin/setup`, enquanto nenhum admin existir.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | SQLite `file:./dev.db` ou PostgreSQL |
| `NEXTAUTH_URL` | URL pública do app |
| `NEXTAUTH_SECRET` | Segredo forte (`openssl rand -base64 32`) |
| `UPLOAD_DIR` | Pasta persistente de imagens (padrão `./uploads`) |
| `NEXT_PUBLIC_APP_URL` | URL canônica para SEO/sitemap |

SMTP e Analytics podem ser configurados também pelo painel em **Configurações**.

## Funcionalidades

### Público

- Home com busca, imóveis mais curtidos, bairros, sobre, depoimentos, blog e CTA
- Catálogo com filtros avançados e ordenação
- Página do imóvel com galeria, mapa, curtidas, WhatsApp e agendamento de visita
- Blog com categorias e SEO
- Contato com LGPD + honeypot anti-spam
- WhatsApp flutuante (quando configurado)

### Administrativo (`/admin`)

- Dashboard com indicadores reais
- CRUD de imóveis (fotos, amenidades, destaques, duplicar, status)
- Bairros, depoimentos, blog, contatos/visitas e configurações gerais
- Upload com compressão WebP (Sharp)
- Recuperação de senha

## Dados demonstrativos

O seed cria imóveis e artigos claramente marcados com `[DEMO]`.  
Não há depoimentos fictícios, telefones, CRECI ou endereços inventados como se fossem reais — configure-os no painel.

## Produção com PostgreSQL / Supabase

1. Altere `provider` em `prisma/schema.prisma` para `postgresql`
2. Defina `DATABASE_URL` do Supabase/Postgres
3. Execute `npx prisma db push && npm run db:seed`
4. Para imagens no Supabase Storage, adapte `src/lib/storage.ts` (a API pública já usa URLs estáveis)

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servidor de produção
npm run db:setup   # migrate/push + seed
npm run lint
```
