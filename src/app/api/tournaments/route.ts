import { NextResponse } from 'next/server';
import { fetchTournaments } from '@/lib/fetch-tournaments';
import { SOURCE_CONFIGS } from '@/lib/sources';

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get('source') ?? 'global';

  if (!SOURCE_CONFIGS[source]) {
    return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 });
  }

  try {
    const tournaments = await fetchTournaments(source);
    const response = NextResponse.json({ tournaments });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
