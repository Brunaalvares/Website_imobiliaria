import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

export default function PrivacyPage() {
  return (
    <div className="section-pad">
      <div className="container-site prose-blog max-w-3xl">
        <h1 className="text-4xl font-bold text-navy">Política de Privacidade</h1>
        <p className="mt-4 text-gray-muted">
          Esta política descreve como os dados pessoais enviados por formulários do site de Marcelo
          Alvares são tratados, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <h2>Dados coletados</h2>
        <p>
          Podemos coletar nome, e-mail, telefone, mensagem, preferências de visita e imóvel de
          interesse quando você utiliza formulários de contato ou agendamento.
        </p>
        <h2>Finalidade</h2>
        <p>
          Os dados são utilizados exclusivamente para atendimento comercial, retorno de contatos,
          agendamento de visitas e melhoria dos serviços prestados.
        </p>
        <h2>Compartilhamento</h2>
        <p>
          Não vendemos dados pessoais. O compartilhamento ocorre apenas quando necessário para
          prestação do serviço ou cumprimento de obrigação legal.
        </p>
        <h2>Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato pelos
          canais disponibilizados na página de Contato.
        </p>
      </div>
    </div>
  );
}
