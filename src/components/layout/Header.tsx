"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { cn, whatsappUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Header({
  brandName,
  whatsapp,
  logoUrl,
}: {
  brandName: string;
  whatsapp: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const expertHref = whatsapp
    ? whatsappUrl(whatsapp, "Olá, Marcelo! Gostaria de falar com um especialista.")
    : "/contato";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-white/90 backdrop-blur-md transition-all",
        scrolled && "border-gray-light shadow-[0_4px_20px_rgba(16,42,67,0.06)]",
      )}
    >
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-navy md:text-2xl">
              {brandName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-gray-muted transition hover:text-navy",
                pathname === link.href && "text-navy",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href={expertHref} target={whatsapp ? "_blank" : undefined} rel="noopener noreferrer">
            Fale com um especialista
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-light text-navy lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-gray-light bg-white lg:hidden">
          <div className="container-site flex flex-col gap-2 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-medium text-gray-dark hover:bg-ice",
                  pathname === link.href && "bg-ice text-navy",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button
              href={expertHref}
              target={whatsapp ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="mt-2 w-full"
            >
              Fale com um especialista
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
