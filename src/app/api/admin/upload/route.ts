import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { saveImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Permite processar várias fotos grandes no mesmo request lifecycle. */
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "Arquivo muito grande para o servidor. As fotos são otimizadas no navegador — tente novamente uma a uma se necessário.",
      },
      { status: 413 },
    );
  }

  const file = form.get("file");
  const folder = String(form.get("folder") || "settings") as
    | "properties"
    | "blog"
    | "testimonials"
    | "settings"
    | "neighborhoods";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
  }

  try {
    const url = await saveImage(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[admin/upload]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha no upload." },
      { status: 400 },
    );
  }
}
