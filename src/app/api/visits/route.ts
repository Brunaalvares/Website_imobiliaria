import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";

const schema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(8).max(30),
  preferredDay: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
    if (!property || property.status !== "publicado") {
      return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
    }

    const visit = await prisma.visitRequest.create({
      data: {
        propertyId: parsed.data.propertyId,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        preferredDay: parsed.data.preferredDay || null,
        preferredTime: parsed.data.preferredTime || null,
        message: parsed.data.message || null,
        status: "novo",
      },
    });

    await sendAdminNotification(
      `Solicitação de visita: ${property.title}`,
      `<p><strong>Imóvel:</strong> ${property.title} (${property.code})</p>
       <p><strong>Nome:</strong> ${visit.name}</p>
       <p><strong>E-mail:</strong> ${visit.email}</p>
       <p><strong>Telefone:</strong> ${visit.phone}</p>
       <p><strong>Preferência:</strong> ${visit.preferredDay || "—"} ${visit.preferredTime || ""}</p>
       <p>${visit.message || ""}</p>
       <p><em>Visita pendente de validação do corretor.</em></p>`,
    );

    return NextResponse.json({ ok: true, id: visit.id });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar solicitação." }, { status: 500 });
  }
}
