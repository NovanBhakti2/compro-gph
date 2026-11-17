import { readFile } from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";

const ASSETS = path.join(process.cwd(), "assets", "certificate");

// The template is one 1491×1055 image on an A4 landscape page. Positions below
// are measured on that image (pixels from the top-left) and converted here.
const PAGE_H = 595.276;
const K = PAGE_H / 1055;
const x = (px: number) => px * K;
const y = (pxFromTop: number) => PAGE_H - pxFromTop * K;

const PAPER = rgb(250 / 255, 249 / 255, 248 / 255);
const INK = rgb(0.12, 0.13, 0.17);
const NAVY = rgb(0.06, 0.13, 0.27);

export type CertificateData = {
  participantName: string;
  trainingTitle: string;
  /** Already formatted, e.g. "8 November 2026" */
  date: string;
  /** e.g. "001/GPH/TRN/2026"; empty for a preview */
  number: string;
  /** Public verification URL, encoded as a QR code; omitted for a preview */
  verifyUrl?: string;
  /** Name and title under the signature line; blank when omitted */
  trainer?: {
    name: string;
    title: string;
    /** PNG (transparent background works best) or JPEG bytes */
    signature?: Uint8Array | null;
  };
};

let assets: Promise<{ template: Uint8Array; name: Uint8Array; body: Uint8Array; bodyBold: Uint8Array }> | null = null;
function loadAssets() {
  // Read once per server instance
  assets ??= Promise.all([
    readFile(path.join(ASSETS, "template.pdf")),
    readFile(path.join(ASSETS, "fonts", "CormorantGaramond-SemiBold.ttf")),
    readFile(path.join(ASSETS, "fonts", "EBGaramond-Regular.ttf")),
    readFile(path.join(ASSETS, "fonts", "EBGaramond-SemiBold.ttf")),
  ]).then(([template, name, body, bodyBold]) => ({ template, name, body, bodyBold }));
  return assets;
}

/** Largest size from `max` down to `min` at which `text` fits in `width`. */
function fitSize(font: PDFFont, text: string, width: number, max: number, min: number) {
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > width) size -= 0.5;
  return size;
}

function drawCentered(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  baselineY: number,
  color = INK,
  centerPx = 745
) {
  page.drawText(text, { x: x(centerPx) - font.widthOfTextAtSize(text, size) / 2, y: baselineY, size, font, color });
}

const isPng = (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const isJpeg = (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8;

/** Paints over part of the template (erased placeholder marks) with paper colour. */
function cover(page: PDFPage, left: number, top: number, right: number, bottom: number) {
  page.drawRectangle({ x: x(left), y: y(bottom), width: x(right - left), height: (bottom - top) * K, color: PAPER });
}

export async function renderCertificate(data: CertificateData): Promise<Uint8Array> {
  const { template, name: nameFontBytes, body: bodyFontBytes, bodyBold: bodyBoldBytes } = await loadAssets();
  const pdf = await PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  const nameFont = await pdf.embedFont(nameFontBytes, { subset: false });
  const bodyFont = await pdf.embedFont(bodyFontBytes, { subset: false });
  const page = pdf.getPages()[0];

  pdf.setTitle(`Certificate of Training — ${data.participantName}`);
  pdf.setAuthor("PT. Gama Putra Harmoni");
  pdf.setSubject(data.trainingTitle);

  // Participant name, between the two ornaments
  cover(page, 320, 490, 1170, 597);
  const name = data.participantName.toUpperCase();
  const nameSize = fitSize(nameFont, name, x(780), 34, 12);
  // Keep the capitals centred on the ornaments (y 545) whatever the size
  const capHeightPx = (nameFont.heightAtSize(nameSize, { descender: false }) * 0.72) / K;
  drawCentered(page, name, nameFont, nameSize, y(545 + capHeightPx / 2), NAVY);

  // "completed the training program "<title>"" (second line of the paragraph)
  const lead = "completed the training program";
  const quoted = `“${data.trainingTitle}”`;
  const oneLine = `${lead} ${quoted}`;
  const width = x(870);
  if (bodyFont.widthOfTextAtSize(oneLine, 12.5) <= width) {
    cover(page, 300, 661, 1190, 701);
    drawCentered(page, oneLine, bodyFont, fitSize(bodyFont, oneLine, width, 15.5, 12.5), y(687));
  } else {
    // Long title: its own line, and the closing line moves down
    cover(page, 300, 661, 1190, 750);
    drawCentered(page, lead, bodyFont, 14.5, y(687));
    drawCentered(page, quoted, bodyFont, fitSize(bodyFont, quoted, width, 14.5, 9), y(717));
    drawCentered(page, "organized by PT. Gama Putra Harmoni.", bodyFont, 14.5, y(747));
  }

  // Date and certificate number, after their labels
  page.drawText(data.date, { x: x(292), y: y(836), size: fitSize(bodyFont, data.date, x(250), 12, 8), font: bodyFont, color: INK });
  if (data.number) {
    page.drawText(data.number, { x: x(366), y: y(905), size: fitSize(bodyFont, data.number, x(178), 12, 8), font: bodyFont, color: INK });
  }

  // Trainer under the signature line (template: line at y 825, centred on x 1116).
  // The template's sample name and company line are always erased; without a
  // trainer the space stays blank for a hand signature.
  const SIGN_X = 1116;
  cover(page, 950, 836, 1284, 935);
  if (data.trainer) {
    const bold = await pdf.embedFont(bodyBoldBytes, { subset: false });
    const trainerName = data.trainer.name;
    drawCentered(page, trainerName, bold, fitSize(bold, trainerName, x(320), 19, 11), y(870), NAVY, SIGN_X);
    const title = data.trainer.title;
    drawCentered(page, title, bodyFont, fitSize(bodyFont, title, x(320), 13, 8), y(900), INK, SIGN_X);

    const sig = data.trainer.signature;
    if (sig && (isPng(sig) || isJpeg(sig))) {
      const image = isPng(sig) ? await pdf.embedPng(sig) : await pdf.embedJpg(sig);
      // Fit in the space above the line, standing on it
      const box = { w: x(270), h: x(90) };
      const scale = Math.min(box.w / image.width, box.h / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      // Slightly over the line, like a real signature
      page.drawImage(image, { x: x(SIGN_X) - w / 2, y: y(834), width: w, height: h });
    }
  }

  // Verification QR, bottom right inside the frame
  if (data.verifyUrl) {
    const png = await QRCode.toBuffer(data.verifyUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 8,
      color: { dark: "#0f2145", light: "#faf9f8" },
    });
    const qr = await pdf.embedPng(png);
    const sizePt = x(84);
    page.drawImage(qr, { x: x(1290), y: y(958), width: sizePt, height: sizePt });
    const label = "SCAN TO VERIFY";
    const labelSize = 5.5;
    page.drawText(label, {
      x: x(1290) + sizePt / 2 - bodyFont.widthOfTextAtSize(label, labelSize) / 2,
      y: y(866),
      size: labelSize,
      font: bodyFont,
      color: NAVY,
    });
  }

  return pdf.save();
}
