import { Tournament } from '@/types/tournament';
import { CellData, extractCellValue, extractCellLink, getCategoryFromColor } from '@/lib/sheets';
import { SOURCE_CONFIGS, SourceConfig, cleanNewlines } from '@/lib/sources';

const SHEETS_FIELDS = 'sheets(data(rowData(values(formattedValue,hyperlink,textFormatRuns(format(link(uri)),startIndex),effectiveFormat(backgroundColor)))))';

export async function fetchTournaments(sourceId: string): Promise<Tournament[]> {
  const config = SOURCE_CONFIGS[sourceId];
  if (!config) throw new Error(`Unknown source: ${sourceId}`);

  const apiKey = process.env.SHEETS_API_KEY;
  const ranges = config.ranges();

  const results = await Promise.all(
    ranges.map(async ({ range, label }) => {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}?ranges=${encodeURIComponent(range)}&fields=${encodeURIComponent(SHEETS_FIELDS)}&key=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        console.warn(`Skipping range ${range}: ${json.error?.message || 'Unknown error'}`);
        return [];
      }

      const rowData: { values?: CellData[] }[] = json.sheets?.[0]?.data?.[0]?.rowData || [];
      if (rowData.length === 0) return [];

      const headerIndex =
        config.headerDetection === 'firstCellEquals'
          ? rowData.findIndex(row => (row.values || [])[0]?.formattedValue === config.headerDetectionValue)
          : rowData.findIndex(row => (row.values || []).some(c => c.formattedValue === config.headerDetectionValue));
      if (headerIndex === -1) return [];

      const headerCells = rowData[headerIndex].values || [];
      const headerRow = headerCells.map(cell => (cell.formattedValue || '').trim());
      const dataRows = rowData.slice(headerIndex + 1);

      return config.statefulIteration
        ? processRowsStateful(config, dataRows, headerRow)
        : processRowsStateless(config, dataRows, headerRow, label);
    }),
  );

  return results.flat();
}

function processRowsStateless(
  config: SourceConfig,
  dataRows: { values?: CellData[] }[],
  headerRow: string[],
  label: string,
): Tournament[] {
  return dataRows
    .filter(row => {
      const cells = row.values || [];
      if (cells.length === 0) return false;

      const filledCells = cells.filter(c => c.formattedValue && c.formattedValue.trim() !== '');
      if (filledCells.length <= 1) return false;

      const firstVal = (cells[0]?.formattedValue || '').trim();
      if (!firstVal) return false;
      if (headerRow.includes(firstVal)) return false;

      return true;
    })
    .map(row => mapRow(config, row.values || [], headerRow, label));
}

function processRowsStateful(
  config: SourceConfig,
  dataRows: { values?: CellData[] }[],
  headerRow: string[],
): Tournament[] {
  const si = config.statefulIteration!;
  const state = si.initialState();
  const tournaments: Tournament[] = [];

  for (const row of dataRows) {
    const cells = row.values || [];
    const firstVal = (cells[0]?.formattedValue || '').trim();
    const filledCells = cells.filter(c => c.formattedValue && c.formattedValue.trim() !== '');

    const result = si.processRow(cells, filledCells.length, firstVal, state);
    if (result === 'skip') continue;

    tournaments.push(mapRow(config, cells, headerRow, si.getDateLabel(state)));
  }

  return tournaments;
}

function mapRow(
  config: SourceConfig,
  cells: CellData[],
  headerRow: string[],
  label: string,
): Tournament {
  const tournament: Record<string, string> = {};

  // Initialize all mapped fields to empty string
  for (const field of Object.values(config.headerMap)) {
    tournament[field] = '';
  }
  // Apply source-specific defaults
  for (const [field, value] of Object.entries(config.fieldDefaults)) {
    tournament[field] = value;
  }

  headerRow.forEach((header, i) => {
    const propertyName = config.headerMap[header] || header;

    let value: string;
    if (config.linkFields.has(propertyName)) {
      value = extractCellLink(cells[i]);
    } else {
      value = extractCellValue(cells[i]);
      if (config.cleanNewlinesOnExtract) {
        value = cleanNewlines(value);
      }
    }

    const transform = config.fieldTransforms[propertyName];
    if (transform) {
      value = transform(value, label);
    }

    tournament[propertyName] = value;
  });

  tournament.category = getCategoryFromColor(cells[0], config.categoryColors);

  if (config.postRow) {
    config.postRow(tournament);
  }

  return tournament as unknown as Tournament;
}
