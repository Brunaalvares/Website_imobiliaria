export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSiteSettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com Marcelo Alvares para comprar, vender, alugar ou investir em imóveis em São Luís.",
};

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="section-pad">
      <div className="container-site grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy md:text-5xl">
            Vamos conversar sobre seu próximo imóvel?
          </h1>
          <p className="mt-5 text-lg text-gray-muted">
            Seja para comprar, vender, alugar ou investir, conte com um atendimento personalizado para
            encontrar a melhor oportunidade.
          </p>

          <div className="mt-10 space-y-4 rounded-2xl border border-gray-light bg-ice p-6 text-sm">
            <Info
              label="WhatsApp"
              value={
                settings.whatsapp ? (
                  <a href={whatsappUrl(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {settings.whatsapp}
                  </a>
                ) : (
                  "Configure no painel administrativo"
                )
              }
            />
            <Info label="Telefone" value={settings.phone || "Configure no painel administrativo"} />
            <Info
              label="E-mail"
              value={
                settings.email ? (
                  <a href={`mailto:${settings.email}`} className="hover:underline">
                    {settings.email}
                  </a>
                ) : (
                  "Configure no painel administrativo"
                )
              }
            />
            <Info label="Instagram" value={settings.instagram || "Configure no painel administrativo"} />
            <Info label="Endereço" value={settings.address || "Configure no painel administrativo"} />
            {settings.creci ? <Info label="CRECI-MA" value={settings.creci} /> : null}
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-muted">{label}</p>
      <div className="mt-1 font-medium text-navy">{value}</div>
    </div>
  );
}
