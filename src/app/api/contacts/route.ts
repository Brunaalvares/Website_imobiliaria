import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(8).max(30),
  subject: z.string().min(2).max(80),
  message: z.string().min(5).max(5000),
  lgpdConsent: z.literal(true),
  website: z.string().optional(), // honeypot
  propertyId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 });
    }
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const contact = await prisma.contact.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
        lgpdConsent: true,
        propertyId: parsed.data.propertyId || null,
        source: "contato",
        status: "novo",
      },
    });

    await sendAdminNotification(
      `Novo contato: ${contact.name}`,
      `<p><strong>Nome:</strong> ${contact.name}</p>
       <p><strong>E-mail:</strong> ${contact.email}</p>
       <p><strong>Telefone:</strong> ${contact.phone}</p>
       <p><strong>Assunto:</strong> ${contact.subject}</p>
       <p>${contact.message}</p>`,
    );

    return NextResponse.json({ ok: true, id: contact.id });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar contato." }, { status: 500 });
  }
}
