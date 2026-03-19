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
  { hex: '#d9d2e9', category: 'premier' }, // International Title
  { hex: '#fff3cc', category: 'premier' }, // National Title
  { hex: '#f4cdcc', category: 'premier' }, // East Title
  { hex: '#d9ebd3', category: 'premier' }, // Central Title
  { hex: '#c9dbf8', category: 'premier' }, // West Title
  { hex: '#d9d9d9', category: 'large' },   // International Major
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
  'Date': 'date',
  'Competition Name': 'competitionName',
  'Hosting Institution': '_institution', // temp — used to build location
  'Format': 'format',
  'Location (Online/In-Person)': '_mode', // temp — used to build location
  'Fee': 'fees',
  'Info Link': 'infoLink',
};

const linkFields = new Set(['infoLink']);

const INSTITUTION_MAP: { match: string; location: string; timezone: string }[] = [
  { match: 'calgary',          location: 'Calgary, Alberta, Canada',  timezone: 'MDT' },
  { match: 'waterloo',         location: 'Waterloo, Ontario, Canada', timezone: 'EDT' },
  { match: 'mcgill',           location: 'Montreal, Quebec, Canada',  timezone: 'EDT' },
  { match: 'british columbia', location: 'Vancouver, BC, Canada',     timezone: 'PDT' },
  { match: 'british colombia', location: 'Vancouver, BC, Canada',     timezone: 'PDT' },
  { match: 'dalhousie',        location: 'Halifax, NS, Canada',       timezone: 'ADT' },
  { match: 'queen',            location: 'Kingston, Ontario, Canada', timezone: 'EDT' },
  { match: 'toronto',          location: 'Toronto, Ontario, Canada',  timezone: 'EDT' },
  { match: 'uottawa',          location: 'Ottawa, Ontario, Canada',   timezone: 'EDT' },
  { match: 'ottawa',           location: 'Ottawa, Ontario, Canada',   timezone: 'EDT' },
  { match: 'eds',              location: 'Ottawa, Ontario, Canada',   timezone: 'EDT' },
];

function resolveCanadaInfo(institution: string): { location: string; timezone: string } | null {
  const lower = institution.toLowerCase();
  for (const { match, location, timezone } of INSTITUTION_MAP) {
    if (lower.includes(match)) return { location, timezone };
  }
  return null;
}

// Month separator rows in the sheet mark the passage of time across 2025-2026.
// We track these to know which year to append to date strings.
const MONTH_RE = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
const NEW_YEAR_MONTHS_RE = /^(january|february|march|april)$/i;

export async function fetchCanadaTournaments(): Promise<Tournament[]> {
  const sheetId = '1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY';
  const apiKey = process.env.SHEETS_API_KEY;

  const ranges = [
    { range: "'2025-2026 university'!A1:G1000" }
  ];

  const results = await Promise.all(
    ranges.map(async ({ range }) => {
      const fields = 'sheets(data(rowData(values(formattedValue,hyperlink,textFormatRuns(format(link(uri)),startIndex),effectiveFormat(backgroundColor)))))';
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?ranges=${encodeURIComponent(range)}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(`API Error (${range}): ${json.error?.message || 'Unknown error'}`);
      }

      const rowData: { values?: CellData[] }[] = json.sheets?.[0]?.data?.[0]?.rowData || [];
      if (rowData.length === 0) return [];

      // Find the header row by looking for a row whose first cell is "Date"
      const headerIndex = rowData.findIndex(row => {
        const cells = row.values || [];
        return cells[0]?.formattedValue === 'Date';
      });
      if (headerIndex === -1) return [];

      const headerCells = rowData[headerIndex].values || [];
      const headerRow = headerCells.map(cell => (cell.formattedValue || '').trim());
      const dataRows = rowData.slice(headerIndex + 1);

      // A for loop is used here (instead of filter/map) because year tracking
      // is stateful — month separator rows tell us when we cross from 2025 to 2026.
      let currentYear = '2025';
      const tournaments: Tournament[] = [];

      for (const row of dataRows) {
        const cells = row.values || [];
        const firstVal = (cells[0]?.formattedValue || '').trim();

        if (!firstVal) continue;

        // Detect month separator rows (only first cell filled, value is a month name)
        const filledCells = cells.filter(c => c.formattedValue && c.formattedValue.trim() !== '');
        if (filledCells.length <= 1 && MONTH_RE.test(firstVal)) {
          if (NEW_YEAR_MONTHS_RE.test(firstVal)) currentYear = '2026';
          continue;
        }

        // Skip rows with no competition name
        const competitionName = (cells[1]?.formattedValue || '').trim();
        if (!competitionName) continue;

        const tournament: any = {};

        // Ensure all expected fields default to empty string
        const expectedFields = Object.values(headerMap);
        expectedFields.forEach(field => { tournament[field] = ''; });
        // Fields not in headerMap that Tournament requires
        tournament.timezone = 'EDT';
        tournament.regLink = '';
        tournament.judgeRule = '';
        tournament.profitStatus = '';
        tournament.teamCap = '';

        headerRow.forEach((header, i) => {
          const propertyName = headerMap[header];
          if (!propertyName) return;

          let value: string;

          if (linkFields.has(propertyName)) {
            value = extractCellLink(cells[i]);
          } else {
            value = extractCellValue(cells[i]);
          }

          if (propertyName === 'date') {
            const trimmed = value.trim();
            if (trimmed && !/\d{4}/.test(trimmed)) {
              value = `${trimmed} ${currentYear}`;
            }
          }

          if (propertyName === 'format') {
            value = value
              .replace('British Parliamentary', 'BP')
              .replace('Canadian Parliamentary', 'CanPar')
              .replace('North American Style', 'NorthAms');
          }

          if (propertyName === 'fees') {
            value = value.replace(/([,;:.!?]) *\n/g, '$1 ').replace(/\n/g, ', ');
          }

          tournament[propertyName] = value;
        });

        // Combine mode + institution into location, mapping known institutions to city/province
        const mode = tournament._mode || '';
        const institution = tournament._institution || '';
        const resolved = resolveCanadaInfo(institution);
        tournament.location = mode === 'Online' ? 'Online' : `In person, ${resolved ? resolved.location : institution}`;
        if (resolved) tournament.timezone = resolved.timezone;
        delete tournament._mode;
        delete tournament._institution;

        tournament.category = getCategoryFromColor(cells[0]);
        tournaments.push(tournament as Tournament);
      }

      return tournaments;
    })
  );

  return results.flat();
}
