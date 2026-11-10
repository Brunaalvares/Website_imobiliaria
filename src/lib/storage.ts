import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin, hasSupabaseStorageConfig } from "./supabase-admin";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4.5 * 1024 * 1024; // below Vercel serverless body limit
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
      fileSizeLimit: "10MB",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Não foi possível criar o bucket "${BUCKET}": ${createError.message}`);
    }
  }
}

async function toWebpBuffer(file: File) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo muito grande. Máximo de 4,5 MB (a imagem é otimizada automaticamente).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
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
  const webp = await toWebpBuffer(file);

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
