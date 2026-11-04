import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
};

export default function TermsPage() {
  return (
    <div className="section-pad">
      <div className="container-site prose-blog max-w-3xl">
        <h1 className="text-4xl font-bold text-navy">Termos de Uso</h1>
        <p className="mt-4 text-gray-muted">
          Ao utilizar este website, você concorda com as condições abaixo.
        </p>
        <h2>Conteúdo informativo</h2>
        <p>
          As informações dos imóveis são divulgadas com base nos dados cadastrados e podem ser
          atualizadas ou removidas a qualquer momento. Valores, disponibilidade e características
          devem ser confirmados com o corretor.
        </p>
        <h2>Uso adequado</h2>
        <p>
          É proibido utilizar o site para fins ilícitos, envio de spam ou tentativa de acesso não
          autorizado à área administrativa.
        </p>
        <h2>Propriedade intelectual</h2>
        <p>
          Textos, imagens e identidade visual do site pertencem a Marcelo Alvares ou a terceiros
          devidamente autorizados.
        </p>
      </div>
    </div>
  );
}
