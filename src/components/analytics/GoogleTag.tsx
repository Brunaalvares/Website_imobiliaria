/**
 * Google Tag (GTM) — uma única instância no <head> de todas as páginas.
 * ID: GTM-PFZTTWX4
 */
export function GoogleTag() {
  return (
    <>
      <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-PFZTTWX4" />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`,
        }}
      />
    </>
  );
}
