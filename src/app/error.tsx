"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-navy">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-sm text-gray-muted">
        Ocorreu um erro no servidor. Se o problema continuar, verifique a conexão com o banco
        (variáveis <code>DATABASE_URL</code> / <code>DIRECT_URL</code> na Vercel) e o endpoint{" "}
        <code>/api/health</code>.
      </p>
      {error.digest ? (
        <p className="text-xs text-gray-muted">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
