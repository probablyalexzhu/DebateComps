import { NextResponse } from 'next/server';
import { fetchGlobalTournaments } from './global_route';
import { fetchIndiaTournaments } from './india_route';
import { fetchCanadaTournaments } from './canada_route';

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get('source') ?? 'global';

  try {
    let tournaments;

    if (source === 'india') {
      tournaments = await fetchIndiaTournaments();
    } else if (source === 'canada') {
      tournaments = await fetchCanadaTournaments();
    } else {
      tournaments = await fetchGlobalTournaments();
    }

    const response = NextResponse.json({ tournaments });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch data' }, { status: 500 });
  }
}
