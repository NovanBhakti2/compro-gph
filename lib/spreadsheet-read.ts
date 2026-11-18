import { inflateRawSync } from "zlib";

// Reads the first sheet of an .xlsx (Excel, Google Sheets, LibreOffice) or a
// .csv file into rows of text cells. Small and dependency-free: enough for an
// attendee list, not a general spreadsheet engine.

/** Files inside a zip (.xlsx is one), by name. */
function unzip(data: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  // End of central directory: last 22+ bytes, signature 0x06054b50
  let end = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 65557); i--) {
    if (data.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("not a zip file");
  const count = data.readUInt16LE(end + 10);
  let pos = data.readUInt32LE(end + 16);
  for (let n = 0; n < count; n++) {
    if (data.readUInt32LE(pos) !== 0x02014b50) throw new Error("broken zip directory");
    const method = data.readUInt16LE(pos + 10);
    const compressedSize = data.readUInt32LE(pos + 20);
    const nameLength = data.readUInt16LE(pos + 28);
    const extraLength = data.readUInt16LE(pos + 30);
    const commentLength = data.readUInt16LE(pos + 32);
    const localOffset = data.readUInt32LE(pos + 42);
    const name = data.toString("utf8", pos + 46, pos + 46 + nameLength);
    pos += 46 + nameLength + extraLength + commentLength;

    // Sizes in the local header can be zero (data descriptor); use the central ones
    const localNameLength = data.readUInt16LE(localOffset + 26);
    const localExtraLength = data.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = data.subarray(start, start + compressedSize);
    if (method === 0) files.set(name, Buffer.from(raw));
    else if (method === 8) files.set(name, inflateRawSync(raw));
  }
  return files;
}

const decodeXml = (value: string) =>
  value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    const lower = e.toLowerCase();
    if (lower.startsWith("#x")) return String.fromCodePoint(parseInt(lower.slice(2), 16));
    if (lower.startsWith("#")) return String.fromCodePoint(parseInt(lower.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[lower]!;
  });

/** All <t> texts inside an element (rich text has several runs). */
const textOf = (xml: string) =>
  decodeXml([...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(""));

const columnIndex = (ref: string) => {
  let index = 0;
  for (const ch of ref.replace(/\d+$/, "")) index = index * 26 + (ch.charCodeAt(0) - 64);
  return index - 1;
};

function readXlsx(data: Buffer): string[][] {
  const files = unzip(data);
  const text = (name: string) => files.get(name)?.toString("utf8");

  // First sheet in tab order, through the workbook relationships
  let sheetPath = "xl/worksheets/sheet1.xml";
  const workbook = text("xl/workbook.xml");
  const rels = text("xl/_rels/workbook.xml.rels");
  const firstId = workbook?.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1];
  if (firstId && rels) {
    const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)]
      .map((m) => m[0])
      .find((r) => r.includes(`Id="${firstId}"`));
    const target = rel?.match(/Target="([^"]+)"/)?.[1];
    if (target) sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
  }
  const sheet = text(sheetPath);
  if (!sheet) throw new Error("no worksheet");

  const shared = [...(text("xl/sharedStrings.xml") ?? "").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1]));

  const rows: string[][] = [];
  for (const row of sheet.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const cell of row[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1];
      const body = cell[2] ?? "";
      const ref = attrs.match(/\br="([A-Z]+\d+)"/)?.[1];
      const type = attrs.match(/\bt="([^"]+)"/)?.[1];
      const v = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let value = "";
      if (type === "s" && v !== undefined) value = shared[Number(v)] ?? "";
      else if (type === "inlineStr") value = textOf(body);
      else if (v !== undefined) value = decodeXml(v);
      const index = ref ? columnIndex(ref) : cells.length;
      cells[index] = value.trim();
    }
    // Empty rows are left out of the file: place each row at its own number,
    // so reported line numbers match what the admin sees in Excel
    const number = Number(row[1].match(/\br="(\d+)"/)?.[1]);
    const index = number > 0 ? number - 1 : rows.length;
    while (rows.length < index) rows.push([]);
    rows[index] = Array.from(cells, (c) => c ?? "");
  }
  return rows;
}

/** CSV with "," ";" or tab, quotes and line breaks inside quotes. */
function readCsv(data: Buffer): string[][] {
  const source = data.toString("utf8").replace(/^﻿/, "");
  const firstLine = source.split(/\r?\n/, 1)[0];
  const delimiter = [";", "\t", ","].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

/** Rows of the file's first sheet; throws when it isn't a readable .xlsx or .csv. */
export function readSpreadsheet(data: Buffer, fileName: string): string[][] {
  const isZip = data.length > 4 && data.readUInt32LE(0) === 0x04034b50;
  if (isZip) return readXlsx(data);
  if (/\.csv$/i.test(fileName) || /\.txt$/i.test(fileName)) return readCsv(data);
  throw new Error("unsupported file");
}
