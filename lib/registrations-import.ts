// Maps an attendee spreadsheet (our template, a Google Form export, an
// offline list…) to name / email / phone, whatever the column order.

const EMAIL_HEADER = /e-?mail/i;
const PHONE_HEADER = /\b(hp|no\.?\s*hp|handphone|telepon|telp|phone|whatsapp|wa|ponsel|mobile)\b/i;
const NAME_HEADER = /\b(nama|name)\b/i;
// "Nama perusahaan", "Company name"… are not the participant's name
const NOT_PERSON = /(perusahaan|company|instansi|hotel|organi[sz]a|jabatan|position|panggilan|nickname|usaha|outlet)/i;

export type ImportColumns = { name: number; email: number; phone: number | null };

export type ImportRow = { line: number; name: string; email: string; phone: string };

function findColumns(header: string[]): ImportColumns | null {
  const email = header.findIndex((h) => EMAIL_HEADER.test(h));
  if (email < 0) return null;
  const names = header
    .map((h, i) => ({ h, i }))
    .filter(({ h, i }) => i !== email && NAME_HEADER.test(h) && !NOT_PERSON.test(h));
  // "Nama lengkap" / "Full name" wins over a plain "Nama"
  const name = (names.find(({ h }) => /lengkap|full/i.test(h)) ?? names[0])?.i;
  if (name === undefined) return null;
  const phone = header.findIndex((h, i) => i !== email && i !== name && PHONE_HEADER.test(h));
  return { name, email, phone: phone < 0 ? null : phone };
}

/**
 * Finds the header row (within the first rows, after any title lines) and
 * returns the data rows with their spreadsheet line numbers. Null when no
 * row has both a name and an email column.
 */
export function extractRegistrants(rows: string[][]): { columns: ImportColumns; rows: ImportRow[] } | null {
  for (let h = 0; h < Math.min(rows.length, 10); h++) {
    const columns = findColumns(rows[h].map((c) => c ?? ""));
    if (!columns) continue;
    const data: ImportRow[] = [];
    for (let r = h + 1; r < rows.length; r++) {
      const cell = (i: number | null) => (i === null ? "" : (rows[r][i] ?? "").trim());
      const row = { line: r + 1, name: cell(columns.name), email: cell(columns.email), phone: cell(columns.phone) };
      // Blank lines at the end of a sheet are common
      if (row.name || row.email || row.phone) data.push(row);
    }
    return { columns, rows: data };
  }
  return null;
}
