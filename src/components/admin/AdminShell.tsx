"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/contatos", label: "Contatos", icon: MessageSquare },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-navy text-white" : "text-gray-dark hover:bg-ice",
            )}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ice">
      <div className="border-b border-gray-light bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="font-bold text-navy">Admin</span>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open ? <div className="border-t border-gray-light p-4">{nav}</div> : null}
      </div>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-screen border-r border-gray-light bg-white p-5 lg:block">
          <div className="mb-8">
            <p className="text-lg font-bold text-navy">Marcelo Alvares</p>
            <p className="text-xs text-gray-muted">Área administrativa</p>
          </div>
          {nav}
          <div className="mt-8 border-t border-gray-light pt-4">
            <p className="mb-3 text-sm text-gray-muted">{userName}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="inline-flex items-center gap-2 text-sm font-medium text-navy"
            >
              <LogOut size={16} /> Sair
            </button>
            <Link href="/" className="mt-3 block text-sm text-gray-muted hover:text-navy">
              Ver site
            </Link>
          </div>
        </aside>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
