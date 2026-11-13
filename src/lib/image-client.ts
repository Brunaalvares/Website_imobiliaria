export type PrepareImageOptions = {
  /** Longest edge after processing (default 1600). */
  maxEdge?: number;
  /** JPEG quality 0–1 (default 0.82). */
  quality?: number;
  /**
   * Target aspect ratio (width/height). When set, the image is center-cropped
   * to this ratio so listing photos stay consistent (e.g. 4/3).
   */
  aspectRatio?: number;
  /** Keep final JPEG under this many bytes (default ~3.5MB for Vercel). */
  maxBytes?: number;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i;

function looksLikeImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  // Alguns navegadores/SO enviam type vazio (ex.: fotos do iPhone).
  return !file.type && IMAGE_EXT.test(file.name);
}

async function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error("Falha ao comprimir a imagem."));
        else resolve(result);
      },
      "image/jpeg",
      quality,
    );
  });
}

function drawCropped(
  source: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem neste navegador.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
  return canvas;
}

/**
 * Compress/resize images in the browser before uploading (fits Vercel body limits).
 * Optionally center-crops to a fixed aspect ratio for standardized listing photos.
 */
export async function prepareImageForUpload(
  file: File,
  maxEdgeOrOptions: number | PrepareImageOptions = 1600,
  qualityArg = 0.82,
): Promise<File> {
  const options: PrepareImageOptions =
    typeof maxEdgeOrOptions === "number"
      ? { maxEdge: maxEdgeOrOptions, quality: qualityArg }
      : maxEdgeOrOptions;

  let maxEdge = options.maxEdge ?? 1600;
  const maxBytes = options.maxBytes ?? 3.5 * 1024 * 1024;
  let quality = options.quality ?? 0.82;
  const aspectRatio = options.aspectRatio;

  if (!looksLikeImage(file)) {
    throw new Error(`Arquivo inválido (${file.name}). Use JPEG, PNG, WebP ou HEIC.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `Não foi possível ler "${file.name}". Se for HEIC do iPhone, exporte como JPEG ou use o Safari.`,
    );
  }

  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;

  if (aspectRatio && aspectRatio > 0) {
    const current = bitmap.width / bitmap.height;
    if (current > aspectRatio) {
      sw = Math.round(bitmap.height * aspectRatio);
      sx = Math.round((bitmap.width - sw) / 2);
    } else if (current < aspectRatio) {
      sh = Math.round(bitmap.width / aspectRatio);
      sy = Math.round((bitmap.height - sh) / 2);
    }
  }

  let scale = Math.min(1, maxEdge / Math.max(sw, sh));
  let width = Math.max(1, Math.round(sw * scale));
  let height = Math.max(1, Math.round(sh * scale));
  let canvas = drawCropped(bitmap, sx, sy, sw, sh, width, height);
  let blob = await canvasToJpeg(canvas, quality);

  while (blob.size > maxBytes && (quality > 0.45 || maxEdge > 900)) {
    if (quality > 0.45) {
      quality = Math.max(0.45, quality - 0.12);
    } else {
      maxEdge = Math.round(maxEdge * 0.8);
      scale = Math.min(1, maxEdge / Math.max(sw, sh));
      width = Math.max(1, Math.round(sw * scale));
      height = Math.max(1, Math.round(sh * scale));
      canvas = drawCropped(bitmap, sx, sy, sw, sh, width, height);
    }
    blob = await canvasToJpeg(canvas, quality);
  }

  bitmap.close();

  if (blob.size > maxBytes) {
    throw new Error(
      `"${file.name}" ficou grande demais após otimizar. Tente outra foto ou reduza a resolução.`,
    );
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

/** Preset for property listing photos: 4:3, sharp and under Vercel limits. */
export const PROPERTY_IMAGE_PRESET: PrepareImageOptions = {
  maxEdge: 1600,
  quality: 0.82,
  aspectRatio: 4 / 3,
  maxBytes: 3.5 * 1024 * 1024,
};
