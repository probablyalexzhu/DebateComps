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

export interface LinkEntry {
  label: string | null;
  url: string;
}

export function extractCellLink(cell: CellData | undefined): string {
  return extractCellLinks(cell)[0]?.url ?? '';
}

export function extractCellLinks(cell: CellData | undefined): LinkEntry[] {
  if (!cell) return [];
  const text = cell.formattedValue || '';

  type RawLink = { url: string; startIndex: number; endIndex: number };
  const collected: RawLink[] = [];

  if (cell.textFormatRuns && cell.textFormatRuns.length > 0) {
    const runs = cell.textFormatRuns;
    for (let i = 0; i < runs.length; i++) {
      const uri = runs[i].format?.link?.uri;
      if (!uri) continue;
      const start = runs[i].startIndex ?? 0;
      const end = runs[i + 1]?.startIndex ?? text.length;
      collected.push({ url: uri, startIndex: start, endIndex: end });
    }
  }

  if (collected.length === 0 && cell.hyperlink) {
    collected.push({ url: cell.hyperlink, startIndex: 0, endIndex: text.length });
  }

  const urlRegex = /https?:\/\/[^\s)>\]]+/g;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(text)) !== null) {
    const start = m.index;
    const url = m[0];
    const dup = collected.some(c => c.url === url || (start >= c.startIndex && start < c.endIndex));
    if (!dup) collected.push({ url, startIndex: start, endIndex: start + url.length });
  }

  if (collected.length === 0) {
    const bareMatch = text.match(/(?:bit\.ly|tinyurl\.com|t\.co|forms\.gle|docs\.google\.com|[\w-]+\.[\w.]+)\/[^\s)>\]]+/);
    if (bareMatch && bareMatch.index !== undefined) {
      const url = `https://${bareMatch[0]}`;
      collected.push({ url, startIndex: bareMatch.index, endIndex: bareMatch.index + bareMatch[0].length });
    }
  }

  if (collected.length === 0) return [];

  collected.sort((a, b) => a.startIndex - b.startIndex);

  const seen = new Set<string>();
  const unique = collected.filter(c => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });

  return unique.map((entry, i) => {
    const prevEnd = i > 0 ? unique[i - 1].endIndex : 0;
    const labelArea = text.slice(prevEnd, entry.startIndex);
    return { label: deriveLinkLabel(labelArea), url: entry.url };
  });
}

function deriveLinkLabel(precedingText: string): string | null {
  const trimmed = precedingText.replace(/\s+$/, '');
  if (!trimmed) return null;
  const segments = trimmed.split(/\n+/);
  const lastLine = segments[segments.length - 1].trim();
  const labelMatch = lastLine.match(/([^:\-\n]+?)\s*[:\-]\s*$/);
  if (!labelMatch) return null;
  const label = labelMatch[1].trim();
  if (!label || label.length > 40) return null;
  return label;
}

export function getCategoryFromColor(
  cell: CellData | undefined,
  categoryColors: { hex: string; category: string }[],
  threshold = 30,
): string {
  const bg = cell?.effectiveFormat?.backgroundColor;
  if (!bg) return '';
  const hex = rgbToHex(bg.red ?? 0, bg.green ?? 0, bg.blue ?? 0);
  for (const { hex: target, category } of categoryColors) {
    if (colorDistance(hex, target) < threshold) return category;
  }
  return '';
}
