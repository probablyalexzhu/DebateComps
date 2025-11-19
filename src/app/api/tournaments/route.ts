import { NextResponse } from 'next/server';

export async function GET() {
  const sheetId = '1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o';
  const apiKey = process.env.SHEETS_API_KEY;
  const ranges = [
    { label: '2025', value: '2025!A7:K1000' },
    { label: '2026', value: '2026!A7:K1000' }
  ];
  
  const headerMap: { [key: string]: string } = {
    'Competition Name': 'competitionName',
    'Online/In Person': 'location',
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
  
  try {
    const results = await Promise.all(
      ranges.map(async ({ value: range, label }) => {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(`API Error (${range}): ${json.error?.message || 'Unknown error'}`);
        }

        const [headerRow, ...rows] = (json.values as string[][]) || [];
        if (!headerRow) return [];

        return rows
          .filter(row => {
            if (!row || row.length === 0) return false;
            if (row.every(cell => !cell || cell.trim() === '')) return false;

            const filledCells = row.filter(cell => cell && cell.trim() !== '');
            if (filledCells.length === 1) return false;

            if (row[0] && headerRow.includes(row[0])) return false;

            return row[0] && row[0].trim() !== '';
          })
          .map(row => {
            const tournament: any = {};
            headerRow.forEach((header, i) => {
              const propertyName = headerMap[header] || header;
              let value = row[i] || '';

              if (propertyName === 'judgeRule' || propertyName === 'timezone') {
                value = value.replace(/\s+/g, '');
              }

              if (propertyName === 'date') {
                const trimmed = value.trim();
                if (trimmed && !/(2025|2026)$/.test(trimmed)) {
                  value = `${trimmed} ${label}`;
                }
              }

              if (propertyName === 'regLink') {
                value = value.replace(/^(Teamreg|Team Reg|Team reg|Teams|Registration|Reg|Link):\s*/i, '');
                value = value.split(/\s+/)[0];
                if (value && !value.match(/^https?:\/\//) && !value.match(/^bit\.ly\/|^tinyurl\.com\/|^t\.co\//)) {
                  if (value.includes('.')) {
                    value = 'https://' + value;
                  }
                }
              }

              tournament[propertyName] = value;
            });
            return tournament;
          });
      })
    );

    const tournaments = results.flat();
    return NextResponse.json({ tournaments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
