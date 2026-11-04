import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientName: z.string().min(2),
  photoUrl: z.string().nullable().optional(),
  text: z.string().min(5),
  dealType: z.string(),
  dealDate: z.string().nullable().optional(),
  authorized: z.boolean(),
  published: z.boolean(),
  showOnHome: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  return NextResponse.json(
    await prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  );
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  if (parsed.data.published && !parsed.data.authorized) {
    return NextResponse.json({ error: "Publicação exige autorização do cliente." }, { status: 400 });
  }
  const item = await prisma.testimonial.create({
    data: {
      ...parsed.data,
      dealDate: parsed.data.dealDate ? new Date(parsed.data.dealDate) : null,
      showOnHome: parsed.data.showOnHome ?? false,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json(item);
}
