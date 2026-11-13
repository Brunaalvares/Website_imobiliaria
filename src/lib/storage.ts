import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin, hasSupabaseStorageConfig } from "./supabase-admin";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "application/octet-stream", // alguns clientes enviam type vazio/errado
]);
const MAX_BYTES = 8 * 1024 * 1024; // após compressão no cliente; margem no servidor
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export function getUploadRoot() {
  return UPLOAD_ROOT;
}

export async function ensureUploadDirs() {
  const dirs = ["properties", "blog", "testimonials", "settings", "neighborhoods"];
  await Promise.all(dirs.map((d) => mkdir(path.join(UPLOAD_ROOT, d), { recursive: true })));
}

async function ensureBucket() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Não foi possível listar buckets: ${error.message}`);

  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "15MB",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"],
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Não foi possível criar o bucket "${BUCKET}": ${createError.message}`);
    }
  }
}

/** Property photos: standardized 4:3 cover crop at high resolution. */
const PROPERTY_TARGET = { width: 1600, height: 1200 };

async function toWebpBuffer(
  file: File,
  folder: "properties" | "blog" | "testimonials" | "settings" | "neighborhoods",
) {
  const mime = (file.type || "").toLowerCase();
  if (mime && !ALLOWED_MIME.has(mime) && !mime.startsWith("image/")) {
    throw new Error("Formato de imagem não suportado. Use JPEG, PNG, WebP ou HEIC.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo muito grande. Otimize a imagem e tente novamente.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let pipeline: ReturnType<typeof sharp>;
  try {
    // Valida se o sharp consegue ler (MIME mentiroso / HEIC / etc.)
    await sharp(buffer, { failOn: "none" }).metadata();
    pipeline = sharp(buffer, { failOn: "none" }).rotate();
  } catch {
    throw new Error("Não foi possível processar esta imagem. Converta para JPEG ou PNG e tente de novo.");
  }

  if (folder === "properties") {
    return pipeline
      .resize({
        width: PROPERTY_TARGET.width,
        height: PROPERTY_TARGET.height,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 84, effort: 4 })
      .toBuffer();
  }

  return pipeline
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function saveToSupabase(
  webp: Buffer,
  folder: "properties" | "blog" | "testimonials" | "settings" | "neighborhoods",
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      "Upload na nuvem não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel.",
    );
  }

  await ensureBucket();
  const filename = `${randomUUID()}.webp`;
  const objectPath = `${folder}/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, webp, {
    contentType: "image/webp",
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(`Falha ao enviar imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error("Upload concluído, mas a URL pública não foi gerada.");
  }
  return data.publicUrl;
}

async function saveToLocal(
  webp: Buffer,
  folder: "properties" | "blog" | "testimonials" | "settings" | "neighborhoods",
) {
  await ensureUploadDirs();
  const filename = `${randomUUID()}.webp`;
  const relative = path.join(folder, filename);
  const absolute = path.join(UPLOAD_ROOT, relative);
  await writeFile(absolute, webp);
  return `/api/uploads/${folder}/${filename}`;
}

export async function saveImage(
  file: File,
  folder: "properties" | "blog" | "testimonials" | "settings" | "neighborhoods",
) {
  const webp = await toWebpBuffer(file, folder);

  // Prefer Supabase on production/serverless; local disk only for development.
  if (hasSupabaseStorageConfig()) {
    return saveToSupabase(webp, folder);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Imagens não podem ser salvas no disco da Vercel. Configure SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  return saveToLocal(webp, folder);
}

export async function deleteImageByUrl(url?: string | null) {
  if (!url) return;

  if (url.startsWith("/api/uploads/")) {
    const relative = url.replace("/api/uploads/", "");
    const absolute = path.join(UPLOAD_ROOT, relative);
    try {
      await unlink(absolute);
    } catch {
      // ignore missing files
    }
    return;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !hasSupabaseStorageConfig()) return;

  try {
    const publicBase = supabase.storage.from(BUCKET).getPublicUrl("x").data.publicUrl.replace(/\/x$/, "/");
    if (!url.startsWith(publicBase)) return;
    const objectPath = decodeURIComponent(url.slice(publicBase.length));
    if (!objectPath || objectPath.includes("..")) return;
    await supabase.storage.from(BUCKET).remove([objectPath]);
  } catch {
    // ignore cleanup failures
  }
}
