# Deploy (Vercel + Supabase)

## Variáveis no Vercel

Em **Project → Settings → Environment Variables** (Production e Preview):

- `DATABASE_URL` — pooler Supabase porta **6543** com `?pgbouncer=true`
- `DIRECT_URL` — pooler sessão porta **5432**
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — URL pública (ex.: `https://websiteimobiliaria.vercel.app`)
- `NEXT_PUBLIC_APP_URL` — mesma URL pública
- `NEXT_PUBLIC_SUPABASE_URL` — `https://dklufvahagbfiqbilobb.supabase.co`

## Rede Supabase

**Database → Network Restrictions**: permitir `0.0.0.0/0` (ou IPs da Vercel).

## Redeploy

Salve as variáveis e rode **Redeploy** no último deployment, ou faça push na branch.
