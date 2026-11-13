export type PrepareImageOptions = {
  /** Longest edge after processing (default 1600). */
  maxEdge?: number;
  /** JPEG quality 0–1 (default 0.82). */
  quality?: number;
  /**
   * Target aspect ratio (width/height). When set, the canvas uses this ratio
   * so listing photos stay consistent (e.g. 4/3).
   */
  aspectRatio?: number;
  /**
   * How to fit into the aspect ratio:
   * - contain (default): shrink whole image into the frame (no zoom/crop)
   * - cover: fill the frame and crop overflow
   */
  fit?: "contain" | "cover";
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

function drawFitted(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
  mode: "cover" | "contain",
  fillStyle = "#F7F9FC",
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem neste navegador.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const srcRatio = srcW / srcH;
  const dstRatio = canvasW / canvasH;
  let dw = canvasW;
  let dh = canvasH;
  let dx = 0;
  let dy = 0;

  if (mode === "contain") {
    if (srcRatio > dstRatio) {
      dh = Math.round(canvasW / srcRatio);
      dy = Math.round((canvasH - dh) / 2);
    } else {
      dw = Math.round(canvasH * srcRatio);
      dx = Math.round((canvasW - dw) / 2);
    }
    ctx.drawImage(source, 0, 0, srcW, srcH, dx, dy, dw, dh);
  } else {
    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;
    if (srcRatio > dstRatio) {
      sw = Math.round(srcH * dstRatio);
      sx = Math.round((srcW - sw) / 2);
    } else {
      sh = Math.round(srcW / dstRatio);
      sy = Math.round((srcH - sh) / 2);
    }
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
  }

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
  const fit = options.fit ?? (aspectRatio ? "contain" : "cover");

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

  const srcW = bitmap.width;
  const srcH = bitmap.height;
  let canvasW: number;
  let canvasH: number;

  if (aspectRatio && aspectRatio > 0) {
    if (aspectRatio >= 1) {
      canvasW = Math.min(maxEdge, Math.max(srcW, srcH));
      canvasH = Math.max(1, Math.round(canvasW / aspectRatio));
    } else {
      canvasH = Math.min(maxEdge, Math.max(srcW, srcH));
      canvasW = Math.max(1, Math.round(canvasH * aspectRatio));
    }
    // Cap longest edge to maxEdge
    const long = Math.max(canvasW, canvasH);
    if (long > maxEdge) {
      const s = maxEdge / long;
      canvasW = Math.max(1, Math.round(canvasW * s));
      canvasH = Math.max(1, Math.round(canvasH * s));
    }
  } else {
    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
    canvasW = Math.max(1, Math.round(srcW * scale));
    canvasH = Math.max(1, Math.round(srcH * scale));
  }

  let canvas = drawFitted(bitmap, srcW, srcH, canvasW, canvasH, fit);
  let blob = await canvasToJpeg(canvas, quality);

  while (blob.size > maxBytes && (quality > 0.45 || maxEdge > 900)) {
    if (quality > 0.45) {
      quality = Math.max(0.45, quality - 0.12);
    } else {
      maxEdge = Math.round(maxEdge * 0.8);
      const s = maxEdge / Math.max(canvasW, canvasH);
      canvasW = Math.max(1, Math.round(canvasW * s));
      canvasH = Math.max(1, Math.round(canvasH * s));
      canvas = drawFitted(bitmap, srcW, srcH, canvasW, canvasH, fit);
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

/** Preset for property listing photos: 4:3 contain (sem zoom), sob limite da Vercel. */
export const PROPERTY_IMAGE_PRESET: PrepareImageOptions = {
  maxEdge: 1600,
  quality: 0.82,
  aspectRatio: 4 / 3,
  fit: "contain",
  maxBytes: 3.5 * 1024 * 1024,
};
