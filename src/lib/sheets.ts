// Shared helpers for Google Sheets API v4 responses.
// Used by global_route, india_route, and canada_route.

export interface CellData {
  formattedValue?: string;
  hyperlink?: string;
  textFormatRuns?: { format?: { link?: { uri?: string } }; startIndex?: number }[];
  effectiveFormat?: { backgroundColor?: { red?: number; green?: number; blue?: number } };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorDistance(hex1: string, hex2: string): number {
  const parse = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function extractCellValue(cell: CellData | undefined): string {
  return cell?.formattedValue || '';
}

export function extractCellLink(cell: CellData | undefined): string {
  if (!cell) return '';

  // 1. Single hyperlink on the whole cell
  if (cell.hyperlink) return cell.hyperlink;

  // 2. Multiple hyperlinks — grab the first one from textFormatRuns
  if (cell.textFormatRuns) {
    for (const run of cell.textFormatRuns) {
      if (run.format?.link?.uri) return run.format.link.uri;
    }
  }

  // 3. Fall back to extracting a URL from the display text
  const text = cell.formattedValue || '';
  const urlMatch = text.match(/https?:\/\/[^\s)>\]]+/);
  if (urlMatch) return urlMatch[0];

  const bareMatch = text.match(/(?:bit\.ly|tinyurl\.com|t\.co|forms\.gle|docs\.google\.com|[\w-]+\.[\w.]+)\/[^\s)>\]]+/);
  if (bareMatch) return 'https://' + bareMatch[0];

  return text;
}

export function getCategoryFromColor(
  cell: CellData | undefined,
  categoryColors: { hex: string; category: string }[],
): string {
  const bg = cell?.effectiveFormat?.backgroundColor;
  if (!bg) return '';
  const hex = rgbToHex(bg.red ?? 0, bg.green ?? 0, bg.blue ?? 0);
  for (const { hex: target, category } of categoryColors) {
    if (colorDistance(hex, target) < 15) return category;
  }
  return '';
}
