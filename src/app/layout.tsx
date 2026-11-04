import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Marcelo Alvares | Imóveis em São Luís — MA",
    template: "%s | Marcelo Alvares",
  },
  description:
    "Imóveis residenciais de médio e alto padrão em São Luís. Orientação especializada de Marcelo Alvares, economista e conselheiro do CRECI-MA.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Marcelo Alvares",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
