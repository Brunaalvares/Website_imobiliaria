import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";

export function Footer({
  brandName,
  footerText,
  whatsapp,
  email,
  instagram,
  address,
  creci,
}: {
  brandName: string;
  footerText: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  creci: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-light bg-ice">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-bold text-navy">{brandName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-muted">{footerText}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy">Navegação</h4>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-gray-muted hover:text-navy">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy">Contato</h4>
          <ul className="mt-4 space-y-2 text-sm text-gray-muted">
            {whatsapp ? (
              <li>
                <a href={whatsappUrl(whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-navy">
                  WhatsApp
                </a>
              </li>
            ) : (
              <li>WhatsApp — configure no painel</li>
            )}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="hover:text-navy">
                  {email}
                </a>
              </li>
            ) : (
              <li>E-mail — configure no painel</li>
            )}
            {instagram ? (
              <li>
                <a
                  href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy"
                >
                  Instagram
                </a>
              </li>
            ) : null}
            {address ? <li>{address}</li> : null}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy">Informações legais</h4>
          <ul className="mt-4 space-y-2 text-sm text-gray-muted">
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-navy">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/termos-de-uso" className="hover:text-navy">
                Termos de Uso
              </Link>
            </li>
            <li>CRECI-MA{creci ? `: ${creci}` : " — configure no painel"}</li>
            <li>© {year} {brandName}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-light">
        <div className="container-site flex items-center justify-between py-4 text-xs text-gray-muted">
          <span>Imóveis selecionados em todo o Brasil</span>
          <Link href="/admin/login" className="hover:text-navy">
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
