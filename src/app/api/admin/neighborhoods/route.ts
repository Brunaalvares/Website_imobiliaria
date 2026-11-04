import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json(await prisma.neighborhood.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const slug = slugify(parsed.data.slug || parsed.data.name);
  const item = await prisma.neighborhood.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
    },
  });
  return NextResponse.json(item);
}
