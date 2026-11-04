import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");

  const adminCount = await prisma.admin.count();
  if (adminCount === 0) redirect("/admin/setup");

  return <AdminShell userName={session.user.name || session.user.email || "Admin"}>{children}</AdminShell>;
}
