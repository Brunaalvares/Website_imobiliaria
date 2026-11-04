import { mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export function getUploadRoot() {
  return UPLOAD_ROOT;
}

export async function ensureUploadDirs() {
  const dirs = ["properties", "blog", "testimonials", "settings", "neighborhoods"];
  await Promise.all(dirs.map((d) => mkdir(path.join(UPLOAD_ROOT, d), { recursive: true })));
}

export async function saveImage(
  file: File,
  folder: "properties" | "blog" | "testimonials" | "settings" | "neighborhoods",
) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo muito grande. Máximo de 8 MB.");
  }

  await ensureUploadDirs();
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const filename = `${id}.webp`;
  const relative = path.join(folder, filename);
  const absolute = path.join(UPLOAD_ROOT, relative);

  await sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(absolute);

  return `/api/uploads/${folder}/${filename}`;
}

export async function deleteImageByUrl(url?: string | null) {
  if (!url || !url.startsWith("/api/uploads/")) return;
  const relative = url.replace("/api/uploads/", "");
  const absolute = path.join(UPLOAD_ROOT, relative);
  try {
    await unlink(absolute);
  } catch {
    // ignore missing files
  }
}
