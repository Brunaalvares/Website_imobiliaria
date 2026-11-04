import { getSiteSettings } from "@/lib/settings";

export async function Analytics() {
  const settings = await getSiteSettings();
  if (!settings.analyticsId) return null;
  const id = settings.analyticsId;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${id}');`,
        }}
      />
    </>
  );
}
