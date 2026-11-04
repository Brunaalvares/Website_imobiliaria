# Deploy (Vercel + Supabase)

## Variáveis no Vercel

Em **Project → Settings → Environment Variables** (Production e Preview):

- `DATABASE_URL` — pooler Supabase porta **6543** com `?pgbouncer=true`
- `DIRECT_URL` — pooler sessão porta **5432**
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — URL pública (ex.: `https://websiteimobiliaria.vercel.app`)
- `NEXT_PUBLIC_APP_URL` — mesma URL pública
- `NEXT_PUBLIC_SUPABASE_URL` — `https://dklufvahagbfiqbilobb.supabase.co`

### Atenção: senha com `#`

Se a senha do banco tiver `#` (ex.: `Woman-Led#2179h3`), use **URL-encoded** `%23`:

```text
...:Woman-Led%232179h3@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Sem o encode, a Vercel corta a connection string e a home quebra com *Application error*.

Diagnóstico rápido após o deploy: abra `/api/health`.

## Rede Supabase

**Database → Network Restrictions**: permitir `0.0.0.0/0` (ou IPs da Vercel).

## Redeploy

Salve as variáveis e rode **Redeploy** no último deployment, ou faça push na branch.
