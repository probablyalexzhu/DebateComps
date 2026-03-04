import { NextResponse } from 'next/server';

export async function GET() {
  const sheetId = '1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o';
  const apiKey = process.env.SHEETS_API_KEY;

  // Dynamically generate ranges for current year and next year
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const ranges = [
    { label: currentYear.toString(), value: `${currentYear}!A7:K1000` },
    { label: nextYear.toString(), value: `${nextYear}!A7:K1000` }
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
            // Ensure all expected fields default to empty string
            const expectedFields = Object.values(headerMap);
            expectedFields.forEach(field => { tournament[field] = ''; });

            headerRow.forEach((header, i) => {
              const propertyName = headerMap[header] || header;
              let value = row[i] || '';

              if (propertyName === 'judgeRule' || propertyName === 'timezone') {
                value = value.replace(/\s+/g, '');
              }

              if (propertyName === 'date') {
                const trimmed = value.trim();
                // Check if the date already ends with a year number
                if (trimmed && !/\d{4}$/.test(trimmed)) {
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
    const response = NextResponse.json({ tournaments });

    // Cache for 1 hour (3600 seconds) on the server
    // stale-while-revalidate allows serving stale data for up to 24 hours while revalidating in background
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
