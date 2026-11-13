"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/blog", label: "Artigos", match: (path: string) => path === "/admin/blog" || path === "/admin/blog/novo" || /^\/admin\/blog\/[^/]+$/.test(path) },
  { href: "/admin/blog/editorias", label: "Editorias", match: (path: string) => path.startsWith("/admin/blog/editorias") },
  { href: "/admin/blog/tags", label: "Tags", match: (path: string) => path.startsWith("/admin/blog/tags") },
];

export function BlogAdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-light bg-white p-2">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              active ? "bg-navy text-white" : "text-navy hover:bg-ice",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
