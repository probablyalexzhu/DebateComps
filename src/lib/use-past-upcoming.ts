import { useMemo } from 'react';
import { parseTournamentDateRange } from '@/lib/calendar-export';
import { MONTH_RE } from '@/lib/constants';
import type { Tournament } from '@/types/tournament';

export function usePastUpcoming(tournaments: Tournament[]) {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let prevStartDate: Date | null = null;

    const upcoming: Tournament[] = [];
    const past: Tournament[] = [];

    for (const t of tournaments) {
      let endDate: Date;
      const dateStr = t.date || '';
      const hasMonth = MONTH_RE.test(dateStr);

      try {
        const parsed = parseTournamentDateRange(dateStr);
        endDate = parsed.endDate;
        if (!hasMonth && prevStartDate) {
          endDate.setMonth(prevStartDate.getMonth());
          endDate.setFullYear(prevStartDate.getFullYear());
        }
        prevStartDate = parsed.startDate;
      } catch {
        endDate = new Date();
        prevStartDate = endDate;
      }

      (endDate < today ? past : upcoming).push(t);
    }

    return { upcoming, past: past.reverse() };
  }, [tournaments]);
}
