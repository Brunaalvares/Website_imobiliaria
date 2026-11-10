/** Compress/resize images in the browser before uploading (fits Vercel body limits). */
export async function prepareImageForUpload(file: File, maxEdge = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPEG, PNG ou WebP).");
  }

  // Keep small files as-is when already under ~1.5MB and not HEIC-like.
  if (file.size <= 1.5 * 1024 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/png")) {
    // Still normalize very large dimensions via canvas below.
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem neste navegador.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
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
