import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function getSession() {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("[auth] NEXTAUTH_SECRET não configurado — sessão indisponível.");
    return null;
  }

  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("[auth] falha ao obter sessão:", error);
    return null;
  }
}

export async function requireAdmin() {
  if (!process.env.NEXTAUTH_SECRET) {
    redirect("/admin/login?error=config");
  }

  const session = await getSession();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}
