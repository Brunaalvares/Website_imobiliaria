import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { getUploadRoot } from "@/lib/storage";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: Params) {
  const segments = (await params).path || [];
  if (!segments.length || segments.some((s) => s.includes("..") || s.includes("\\") || s.includes("\0"))) {
    return new Response("Not found", { status: 404 });
  }

  const absolute = path.join(getUploadRoot(), ...segments);
  const root = getUploadRoot();
  if (!absolute.startsWith(root) || !existsSync(absolute)) {
    return new Response("Not found", { status: 404 });
  }

  const stat = statSync(absolute);
  const stream = createReadStream(absolute);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  const ext = path.extname(absolute).toLowerCase();
  const type =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "application/octet-stream";

  return new Response(webStream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
