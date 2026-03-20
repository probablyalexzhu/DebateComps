import { CellData } from './sheets';

// --- Reusable transforms ---

export const cleanNewlines = (v: string) =>
  v.replace(/([,;:.!?]) *\n/g, '$1 ').replace(/\n/g, ', ');

const stripWhitespace = (v: string) => v.replace(/\s+/g, '');
const stripOperatorSpaces = (v: string) => v.replace(/\s*([=+\-])\s*/g, '$1');

const appendYearIfMissing =
  (test: RegExp) =>
  (v: string, label: string) => {
    const trimmed = v.trim();
    return trimmed && !test.test(trimmed) ? `${trimmed} ${label}` : v;
  };

// --- Canada helpers ---

const INSTITUTION_MAP = [
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

const MONTH_RE = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
const NEW_YEAR_MONTHS_RE = /^(january|february|march|april)$/i;

/** Academic year starting month (August). Returns the start year of the current cycle. */
function academicStartYear(): number {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

// --- Types ---

export interface SheetRange {
  label: string;
  range: string;
}

export interface SourceConfig {
  id: string;
  label: string;
  dropdownLabel: string;
  flagCode: string | null;
  route: string;
  sheetName: string;
  sheetUrl: string;

  sheetId: string;
  ranges: () => SheetRange[];

  headerDetection: 'firstCellEquals' | 'anyCellContains';
  headerDetectionValue: string;

  headerMap: Record<string, string>;

  linkFields: Set<string>;

  fieldDefaults: Record<string, string>;
  fieldTransforms: Record<string, (value: string, label: string) => string>;
  cleanNewlinesOnExtract: boolean;

  categoryColors: { hex: string; category: string }[];

  postRow?: (tournament: Record<string, string>) => void;

  statefulIteration?: {
    initialState: () => Record<string, string>;
    processRow: (
      cells: CellData[],
      filledCount: number,
      firstVal: string,
      state: Record<string, string>,
    ) => 'skip' | 'include';
    getDateLabel: (state: Record<string, string>) => string;
  };
}

// --- Source configs ---

const globalConfig: SourceConfig = {
  id: 'global',
  label: '',
  dropdownLabel: 'Global',
  flagCode: null,
  route: '/',
  sheetName: 'Global Debating Spreadsheet',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o',

  sheetId: '1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o',
  ranges: () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return [
      { label: currentYear.toString(), range: `${currentYear}!A1:K1000` },
      { label: nextYear.toString(), range: `${nextYear}!A1:K1000` },
    ];
  },

  headerDetection: 'anyCellContains',
  headerDetectionValue: 'Competition Name',

  headerMap: {
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
    'Info Link': 'infoLink',
  },

  linkFields: new Set(['regLink', 'infoLink']),

  fieldDefaults: {},
  fieldTransforms: {
    timezone: (v) => stripWhitespace(v),
    judgeRule: (v) => stripOperatorSpaces(v),
    date: appendYearIfMissing(/\d{4}$/),
  },
  cleanNewlinesOnExtract: false,

  categoryColors: [
    { hex: '#fbbc04', category: 'premier' },
    { hex: '#25d6e4', category: 'wudc' },
    { hex: '#dd7e6b', category: 'large' },
  ],
};

const indiaConfig: SourceConfig = {
  id: 'india',
  label: 'India',
  dropdownLabel: 'India',
  flagCode: 'in',
  route: '/india',
  sheetName: 'Indian Debating Spreadsheet',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg',

  sheetId: '1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg',
  ranges: () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return [
      { label: currentYear.toString(), range: `${currentYear}!A1:M1000` },
      { label: nextYear.toString(), range: `${nextYear}!A1:M1000` },
    ];
  },

  headerDetection: 'firstCellEquals',
  headerDetectionValue: 'Name',

  headerMap: {
    'Name': 'competitionName',
    'Mode': '_mode',
    'Date': 'date',
    'Format': 'format',
    'Institution': '_institution',
    'City': '_city',
    'Last Checked Reg Status': 'regLink',
    'Judge Rule': 'judgeRule',
    'Cost': 'fees',
    'Profit Status': 'profitStatus',
    'Link': 'infoLink',
  },

  linkFields: new Set(['regLink', 'infoLink']),

  fieldDefaults: { teamCap: '', timezone: 'IST' },
  fieldTransforms: {
    judgeRule: (v) => stripOperatorSpaces(v),
    date: appendYearIfMissing(/\d{4}$/),
  },
  cleanNewlinesOnExtract: true,

  categoryColors: [
    { hex: '#e06666', category: 'large' },
  ],

  postRow: (t) => {
    const mode = t._mode || '';
    const city = t._city || '';
    t.location = mode === 'Online' ? 'Online' : [city, 'India'].filter(Boolean).join(', ');
    delete t._mode;
    delete t._institution;
    delete t._city;
  },
};

const canadaConfig: SourceConfig = {
  id: 'canada',
  label: 'Canada',
  dropdownLabel: 'Canada',
  flagCode: 'ca',
  route: '/canada',
  sheetName: 'CUSID University Schedule',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY',

  sheetId: '1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY',
  ranges: () => {
    const start = academicStartYear();
    return [{ label: '', range: `'${start}-${start + 1} university'!A1:G1000` }];
  },

  headerDetection: 'firstCellEquals',
  headerDetectionValue: 'Date',

  headerMap: {
    'Date': 'date',
    'Competition Name': 'competitionName',
    'Hosting Institution': '_institution',
    'Format': 'format',
    'Location (Online/In-Person)': '_mode',
    'Fee': 'fees',
    'Info Link': 'infoLink',
  },

  linkFields: new Set(['infoLink']),

  fieldDefaults: { timezone: 'TBA', regLink: '', judgeRule: '', profitStatus: '', teamCap: '' },
  fieldTransforms: {
    date: appendYearIfMissing(/\d{4}$/),
    format: (v) =>
      v
        .replace('British Parliamentary', 'BP')
        .replace('Canadian Parliamentary', 'CanPar')
        .replace('North American Style', 'NorthAms'),
    fees: (v) => cleanNewlines(v),
  },
  cleanNewlinesOnExtract: false,

  categoryColors: [
    { hex: '#d9d2e9', category: 'premier' },
    { hex: '#fff3cc', category: 'premier' },
    { hex: '#d9d9d9', category: 'large' },
  ],

  postRow: (t) => {
    const mode = t._mode || '';
    const institution = t._institution || '';
    const resolved = resolveCanadaInfo(institution);
    t.location = mode === 'Online' ? 'Online' : (resolved ? resolved.location : institution);
    if (resolved) t.timezone = resolved.timezone;
    delete t._mode;
    delete t._institution;
  },

  statefulIteration: {
    initialState: () => ({ currentYear: String(academicStartYear()) }),
    processRow: (cells, filledCount, firstVal, state) => {
      if (!firstVal) return 'skip';

      if (filledCount <= 1 && MONTH_RE.test(firstVal)) {
        if (NEW_YEAR_MONTHS_RE.test(firstVal)) state.currentYear = String(academicStartYear() + 1);
        return 'skip';
      }

      const competitionName = (cells[1]?.formattedValue || '').trim();
      if (!competitionName) return 'skip';

      return 'include';
    },
    getDateLabel: (state) => state.currentYear,
  },
};

// --- Exports ---

export const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  global: globalConfig,
  india: indiaConfig,
  canada: canadaConfig,
};

export const SOURCE_LIST = [globalConfig, canadaConfig, indiaConfig];
