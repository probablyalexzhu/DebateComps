import { NextResponse } from 'next/server';

export async function GET() {
  const sheetId = '1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o';
  const apiKey = process.env.SHEETS_API_KEY;
  const range = 'A7:K1000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(`API Error: ${json.error?.message || 'Unknown error'}`);
    }
    
    // First row (row 7) contains headers
    const [headerRow, ...rows] = json.values as string[][];
    
    // Map headers to camelCase property names
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
    
    // Filter and parse tournament data
    const tournaments = rows
      .filter(row => {
        // Skip empty rows
        if (!row || row.length === 0) return false;
        
        // Skip rows where all cells are empty
        if (row.every(cell => !cell || cell.trim() === '')) return false;
        
        // Skip rows that are just month names (single column filled)
        const filledCells = row.filter(cell => cell && cell.trim() !== '');
        if (filledCells.length === 1) return false;
        
        // Skip repeated header rows (check if first cell matches a header)
        if (row[0] && headerRow.includes(row[0])) return false;
        
        // Only keep rows that have a competition name
        return row[0] && row[0].trim() !== '';
      })
      .map(row => {
        const tournament: any = {};
        headerRow.forEach((header, i) => {
          const propertyName = headerMap[header] || header;
          let value = row[i] || '';
          
          // Sanitize specific fields
          if (propertyName === 'judgeRule' || propertyName === 'timezone') {
            value = value.replace(/\s+/g, '');
          }
          
          // Sanitize regLink to extract just the URL
          if (propertyName === 'regLink') {
            // Remove common prefixes and extract URL
            value = value.replace(/^(Teamreg|Team Reg|Team reg|Teams|Registration|Reg|Link):\s*/i, '');
            // Remove any trailing text after the URL
            value = value.split(/\s+/)[0];
            // Ensure it starts with http/https or is a valid short URL
            if (value && !value.match(/^https?:\/\//) && !value.match(/^bit\.ly\/|^tinyurl\.com\/|^t\.co\//)) {
              // If it doesn't start with http/https, assume it's a relative URL and add https://
              if (value.includes('.')) {
                value = 'https://' + value;
              }
            }
          }
          
          tournament[propertyName] = value;
        });
        return tournament;
      });
    
    return NextResponse.json({ tournaments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
