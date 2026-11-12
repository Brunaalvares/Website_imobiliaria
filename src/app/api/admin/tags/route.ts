import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json(
    await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
  );
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const existing = await prisma.blogTag.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Já existe uma tag com este nome." }, { status: 409 });

  const tag = await prisma.blogTag.create({
    data: { name: parsed.data.name.trim(), slug },
  });
  return NextResponse.json(tag);
}
