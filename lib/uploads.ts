import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

/**
 * Image storage with two backends:
 * - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production on Vercel).
 *   The token is added automatically when a Blob store is connected to the project.
 * - Local disk otherwise (development), served by app/uploads/[name]/route.ts.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
// Vercel Functions reject request bodies above 4.5 MB
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const isBlobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const TYPES = {
  jpg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  png: { mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  gif: { mime: "image/gif", magic: [[0x47, 0x49, 0x46, 0x38]] },
  // RIFF....WEBP
  webp: { mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
} as const;

type Ext = keyof typeof TYPES;

const FILE_NAME = /^[a-f0-9-]{36}\.(jpg|png|gif|webp)$/;

/** Detect the image type from the file bytes, not the client-provided name. */
function detectType(bytes: Uint8Array): Ext | null {
  for (const [ext, { magic }] of Object.entries(TYPES) as [Ext, (typeof TYPES)[Ext]][]) {
    const match = magic.some((sig) => sig.every((b, i) => bytes[i] === b));
    if (!match) continue;
    if (ext === "webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") continue;
    return ext;
  }
  return null;
}

export async function saveImage(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Ukuran gambar maksimal 4 MB." } as const;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = detectType(bytes);
  if (!ext) {
    return { error: "Format harus JPG, PNG, WEBP, atau GIF." } as const;
  }

  const name = `${randomUUID()}.${ext}`;

  if (isBlobEnabled()) {
    const blob = await put(`uploads/${name}`, Buffer.from(bytes), {
      access: "public",
      contentType: TYPES[ext].mime,
      addRandomSuffix: false,
      // File names are random UUIDs and never overwritten
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: blob.url } as const;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);

  return { url: `/uploads/${name}` } as const;
}

export async function readImage(name: string) {
  // Only names we generated; blocks path traversal like ../../.env
  if (!FILE_NAME.test(name)) return null;
  const ext = name.split(".").pop() as Ext;

  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return { data, mime: TYPES[ext].mime };
  } catch {
    return null;
  }
}
