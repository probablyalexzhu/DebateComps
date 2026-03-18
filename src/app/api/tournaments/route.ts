import { NextResponse } from 'next/server';

interface CellData {
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

const CATEGORY_COLORS: { hex: string; category: string }[] = [
  { hex: '#fbbc04', category: 'premier' },
  { hex: '#25d6e4', category: 'wudc' },
  { hex: '#dd7e6b', category: 'large' },
];

function getCategoryFromColor(cell: CellData | undefined): string {
  const bg = cell?.effectiveFormat?.backgroundColor;
  if (!bg) return '';
  const hex = rgbToHex(bg.red ?? 0, bg.green ?? 0, bg.blue ?? 0);
  for (const { hex: target, category } of CATEGORY_COLORS) {
    if (colorDistance(hex, target) < 30) return category;
  }
  return '';
}

function extractCellValue(cell: CellData | undefined): string {
  return cell?.formattedValue || '';
}

function extractCellLink(cell: CellData | undefined): string {
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

export async function GET() {
  const sheetId = '1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o';
  const apiKey = process.env.SHEETS_API_KEY;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const ranges = [
    { label: currentYear.toString(), range: `${currentYear}!A1:K1000` },
    { label: nextYear.toString(), range: `${nextYear}!A1:K1000` }
  ];

  const headerMap: { [key: string]: string } = {
    'Competition Name': 'competitionName',
    'Online/In Person': 'location',
    'Location': 'location',
    'Format': 'format',
    'Date': 'date',
    'Timezone': 'timezone',
    'Reg Link': 'regLink',
    'Judge Rule': 'judgeRule',
    'Fees': 'fees',
    'Profit Status': 'profitStatus',
    'Team Cap': 'teamCap',
    'Info Link': 'infoLink'
  };

  const linkFields = new Set(['regLink', 'infoLink']);

  try {
    const results = await Promise.all(
      ranges.map(async ({ range, label }) => {
        const fields = 'sheets(data(rowData(values(formattedValue,hyperlink,textFormatRuns(format(link(uri)),startIndex),effectiveFormat(backgroundColor)))))';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?ranges=${encodeURIComponent(range)}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(`API Error (${range}): ${json.error?.message || 'Unknown error'}`);
        }

        const rowData: { values?: CellData[] }[] = json.sheets?.[0]?.data?.[0]?.rowData || [];
        if (rowData.length === 0) return [];

        // Find the header row by looking for a row containing "Competition Name"
        const headerIndex = rowData.findIndex(row => {
          const cells = row.values || [];
          return cells.some(c => c.formattedValue === 'Competition Name');
        });
        if (headerIndex === -1) return [];

        const headerCells = rowData[headerIndex].values || [];
        const headerRow = headerCells.map(cell => cell.formattedValue || '');
        const dataRows = rowData.slice(headerIndex + 1);

        return dataRows
          .filter(row => {
            const cells = row.values || [];
            if (cells.length === 0) return false;

            const filledCells = cells.filter(c => c.formattedValue && c.formattedValue.trim() !== '');
            if (filledCells.length <= 1) return false;

            const firstVal = cells[0]?.formattedValue || '';
            if (!firstVal.trim()) return false;
            if (headerRow.includes(firstVal)) return false;

            return true;
          })
          .map(row => {
            const cells = row.values || [];
            const tournament: any = {};

            // Ensure all expected fields default to empty string
            const expectedFields = Object.values(headerMap);
            expectedFields.forEach(field => { tournament[field] = ''; });

            headerRow.forEach((header, i) => {
              const propertyName = headerMap[header] || header;
              let value: string;

              if (linkFields.has(propertyName)) {
                value = extractCellLink(cells[i]);
              } else {
                value = extractCellValue(cells[i]);
              }

              if (propertyName === 'judgeRule' || propertyName === 'timezone') {
                value = value.replace(/\s+/g, '');
              }

              if (propertyName === 'date') {
                const trimmed = value.trim();
                if (trimmed && !/\d{4}$/.test(trimmed)) {
                  value = `${trimmed} ${label}`;
                }
              }

              tournament[propertyName] = value;
            });
            tournament.category = getCategoryFromColor(cells[0]);
            return tournament;
          });
      })
    );

    const tournaments = results.flat();
    const response = NextResponse.json({ tournaments });

    // Cache for 1 hour (3600 seconds) on the server
    // stale-while-revalidate allows serving stale data for up to 24 hours while revalidating in background
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
