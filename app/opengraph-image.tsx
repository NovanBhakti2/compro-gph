import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/site";

// Default share preview for pages without their own image (articles use
// their thumbnail instead). Generated once at build time.
export const alt = `${SITE.name}: Consulting & Training`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/gph-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0b1329 0%, #0f1932 60%, #1b2a4d 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              padding: 14,
              borderRadius: 20,
              background: "white",
            }}
          >
            <img src={logoSrc} width={72} height={72} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#e0b673" }}>{SITE.name}</span>
            <span style={{ fontSize: 20, letterSpacing: 4, color: "#C7974C" }}>
              CONSULTING & TRAINING
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>
            Hospitality excellence, elevated by safety & standards
          </span>
          <span style={{ fontSize: 26, color: "#cbd5e1" }}>
            Food Safety · Halal Assurance · Quality Assurance · 5S · Licensing
          </span>
        </div>

        <div style={{ display: "flex", height: 6, width: 160, borderRadius: 3, background: "#C7974C" }} />
      </div>
    ),
    size
  );
}
