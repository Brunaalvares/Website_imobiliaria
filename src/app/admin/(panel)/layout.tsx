import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXTAUTH_SECRET) {
    redirect("/admin/login?error=config");
  }

  const session = await getSession();
  if (!session?.user) redirect("/admin/login");

  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) redirect("/admin/setup");
  } catch (error) {
    console.error("[admin] falha ao validar administradores:", error);
    redirect("/admin/login?error=config");
  }

  return <AdminShell userName={session.user.name || session.user.email || "Admin"}>{children}</AdminShell>;
}
