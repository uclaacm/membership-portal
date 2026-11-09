// Applicant-written cells starting with these would run as formulas once opened in Sheets or Excel.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCsvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(rows) {
  return rows.map(row => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function formatSpreadsheetDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US");
}

export function downloadCsv(fileName, rows) {
  // The byte-order mark makes Excel read the file as UTF-8 instead of mangling accented names.
  const blob = new Blob(["\uFEFF", buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
