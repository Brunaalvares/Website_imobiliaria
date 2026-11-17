-- Segurança Supabase: fecha acesso público via PostgREST (anon/authenticated).
-- A app usa Prisma com o role postgres (dono das tabelas), que ignora RLS
-- enquanto FORCE ROW LEVEL SECURITY não estiver ativo — o que é o desejado.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'Admin',
    'Amenity',
    'BlogCategory',
    'BlogPost',
    'BlogPostSecondaryCategory',
    'BlogPostTag',
    'BlogTag',
    'Contact',
    'Neighborhood',
    'PasswordResetToken',
    'Property',
    'PropertyAmenity',
    'PropertyLike',
    'PropertyPhoto',
    'SiteSettings',
    'Testimonial',
    'VisitRequest'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      -- Sem policies: anon/authenticated não leem nem escrevem via API.
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated, PUBLIC', t);
    END IF;
  END LOOP;
END $$;

-- Evita que tabelas novas criadas pelo role atual herdem grants abertos
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated, PUBLIC;
