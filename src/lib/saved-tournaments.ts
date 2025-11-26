const STORAGE_KEY = 'debatecomps_saved_tournaments';

export function getSavedTournaments(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

export function isTournamentSaved(tournamentId: string): boolean {
  const saved = getSavedTournaments();
  return saved.has(tournamentId);
}

export function toggleSavedTournament(tournamentId: string): boolean {
  const saved = getSavedTournaments();

  if (saved.has(tournamentId)) {
    saved.delete(tournamentId);
  } else {
    saved.add(tournamentId);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));

  // Dispatch custom event for UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('savedTournamentsChanged'));
  }

  return saved.has(tournamentId);
}

export function clearAllSavedTournaments(): void {
  localStorage.removeItem(STORAGE_KEY);
}
