export function getTournamentId(competitionName: string, date: string): string {
  return `${competitionName || ''}-${date || ''}`.replace(/\s+/g, '-').toLowerCase();
}
