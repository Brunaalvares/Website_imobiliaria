"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40, textAlign: "center" }}>
        <h1>Erro no servidor</h1>
        <p>O site encontrou uma falha ao renderizar a página.</p>
        {error.digest ? <p style={{ color: "#687782", fontSize: 12 }}>Digest: {error.digest}</p> : null}
        <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 16px" }}>
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
