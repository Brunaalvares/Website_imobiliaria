import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Analytics } from "@/components/analytics/Analytics";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Analytics />
      <Header brandName={settings.brandName} whatsapp={settings.whatsapp} logoUrl={settings.logoUrl} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer
        brandName={settings.brandName}
        footerText={settings.footerText}
        whatsapp={settings.whatsapp}
        email={settings.email}
        instagram={settings.instagram}
        address={settings.address}
        creci={settings.creci}
      />
      <WhatsAppFloat whatsapp={settings.whatsapp} />
    </>
  );
}
