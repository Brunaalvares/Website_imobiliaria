export type PrepareImageOptions = {
  /** Longest edge after processing (default 2000). */
  maxEdge?: number;
  /** JPEG quality 0–1 (default 0.85). */
  quality?: number;
  /**
   * Target aspect ratio (width/height). When set, the image is center-cropped
   * to this ratio so listing photos stay consistent (e.g. 4/3).
   */
  aspectRatio?: number;
};

/**
 * Compress/resize images in the browser before uploading (fits Vercel body limits).
 * Optionally center-crops to a fixed aspect ratio for standardized listing photos.
 */
export async function prepareImageForUpload(
  file: File,
  maxEdgeOrOptions: number | PrepareImageOptions = 2000,
  qualityArg = 0.85,
): Promise<File> {
  const options: PrepareImageOptions =
    typeof maxEdgeOrOptions === "number"
      ? { maxEdge: maxEdgeOrOptions, quality: qualityArg }
      : maxEdgeOrOptions;

  const maxEdge = options.maxEdge ?? 2000;
  const quality = options.quality ?? 0.85;
  const aspectRatio = options.aspectRatio;

  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPEG, PNG ou WebP).");
  }

  const bitmap = await createImageBitmap(file);
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;

  if (aspectRatio && aspectRatio > 0) {
    const current = bitmap.width / bitmap.height;
    if (current > aspectRatio) {
      // Too wide — crop sides
      sw = Math.round(bitmap.height * aspectRatio);
      sx = Math.round((bitmap.width - sw) / 2);
    } else if (current < aspectRatio) {
      // Too tall — crop top/bottom
      sh = Math.round(bitmap.width / aspectRatio);
      sy = Math.round((bitmap.height - sh) / 2);
    }
  }

  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem neste navegador.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error("Falha ao comprimir a imagem."));
        else resolve(result);
      },
      "image/jpeg",
      quality,
    );
  });

  const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

/** Preset for property listing photos: 4:3, sharp and consistent. */
export const PROPERTY_IMAGE_PRESET: PrepareImageOptions = {
  maxEdge: 1920,
  quality: 0.88,
  aspectRatio: 4 / 3,
};
