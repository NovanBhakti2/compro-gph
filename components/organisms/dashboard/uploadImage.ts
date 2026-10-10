/** Uploads an image to /api/uploads and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads", { method: "POST", body });
  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json.url) {
    throw new Error(json.error ?? "Upload gagal.");
  }
  return json.url;
}
