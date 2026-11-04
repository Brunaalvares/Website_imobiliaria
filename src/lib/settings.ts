import { prisma } from "./prisma";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "default" } });
  }
  return settings;
}

export async function generatePropertyCode() {
  const year = new Date().getFullYear();
  const count = await prisma.property.count();
  return `MA-${year}-${String(count + 1).padStart(4, "0")}`;
}
