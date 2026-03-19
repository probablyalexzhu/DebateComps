import { Tournament } from '@/types/tournament';

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
  { hex: '#e06666', category: 'large' },
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

const headerMap: { [key: string]: string } = {
  'Name': 'competitionName',
  'Mode': '_mode',           // temp — combined into location after row mapping
  'Date': 'date',
  'Format': 'format',
  'Institution': '_institution', // temp — combined into location after row mapping
  'City': '_city',           // temp — combined into location after row mapping
  'Last Checked Reg Status': 'regLink',
  'Judge Rule': 'judgeRule',
  'Cost': 'fees',
  'Profit Status': 'profitStatus',
  'Link': 'infoLink',
  // Break and IA Compensation are intentionally omitted
};

const linkFields = new Set(['regLink', 'infoLink']);

export async function fetchIndiaTournaments(): Promise<Tournament[]> {
  const sheetId = '1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg';
  const apiKey = process.env.SHEETS_API_KEY;

  const ranges = [
    { label: '2026', range: '2026!A1:M1000' }
  ];

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

      // Find the header row by looking for a row whose first cell is "Name"
      const headerIndex = rowData.findIndex(row => {
        const cells = row.values || [];
        return cells[0]?.formattedValue === 'Name';
      });
      if (headerIndex === -1) return [];

      const headerCells = rowData[headerIndex].values || [];
      const headerRow = headerCells.map(cell => (cell.formattedValue || '').trim());
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
          // Fields not in headerMap that Tournament requires
          tournament.teamCap = '';
          tournament.timezone = 'IST';

          headerRow.forEach((header, i) => {
            const propertyName = headerMap[header];
            if (!propertyName) return; // skip Break, IA Compensation

            let value: string;

            if (linkFields.has(propertyName)) {
              value = extractCellLink(cells[i]);
            } else {
              value = extractCellValue(cells[i])
                .replace(/([,;:.!?]) *\n/g, '$1 ')
                .replace(/\n/g, ', ');
            }

            if (propertyName === 'judgeRule') {
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

          // Combine mode + institution + city into location
          const mode = tournament._mode || '';
          const institution = tournament._institution || '';
          const city = tournament._city || '';
          const cityAlreadyInInstitution = city && institution.toLowerCase().endsWith(city.toLowerCase());
          tournament.location = mode === 'Online'
            ? 'Online'
            : [institution, cityAlreadyInInstitution ? '' : city].filter(Boolean).join(', ');
          delete tournament._mode;
          delete tournament._institution;
          delete tournament._city;

          tournament.category = getCategoryFromColor(cells[0]);
          return tournament as Tournament;
        });
    })
  );

  return results.flat();
}
