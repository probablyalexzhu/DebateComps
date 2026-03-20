"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { startOfWeek, endOfWeek, format, isWithinInterval } from "date-fns";

import { EventCard } from "@/components/custom/event-card";
import { ViewToggle } from "@/components/custom/view-toggle";
import { Tournament } from "@/types/tournament";
import { FilterState, SearchFilterBar } from "@/components/custom/search-filter-bar";
import { CalendarView } from "@/components/custom/calendar-view";
import { parseTournamentDateRange } from "@/lib/calendar-export";
import { SOURCE_CONFIGS } from "@/lib/sources";
import { usePastUpcoming } from "@/lib/use-past-upcoming";
import { PastSection } from "@/components/custom/past-section";

const ITEMS_PER_BATCH = 16;

type ViewMode = 'grid' | 'calendar';
type TournamentSection = { label: string; tournaments: Tournament[] };

const GRID_CLASSNAME = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-6";

/**
 * TournamentsPage is the shared page component rendered by all source routes
 * (/, /india, /canada). It accepts a `source` prop which is passed to the
 * /api/tournaments?source= endpoint to fetch the appropriate dataset.
 *
 * Responsibilities:
 * - Fetches and paginates tournaments (infinite scroll via IntersectionObserver)
 * - Manages filter state (search, format, online, team cap, one-day, category, timezone)
 * - Filters persist across source switches; visibleCount resets on source change
 * - Sections tournaments into "This Week" and month groups
 * - Renders grid view (EventCard) or calendar view (CalendarView)
 * - Supports manual cache-bypass refresh via ViewToggle
 * - Customises the page title per source (e.g. "...in India", "...in Canada")
 */
export function TournamentsPage({ source }: { source: string }) {
  const sourceInfo = SOURCE_CONFIGS[source] || SOURCE_CONFIGS.global;
  const pageTitle = `DebateComps — The home for debate${sourceInfo.label ? ` in ${sourceInfo.label}` : ''}`;

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchText: "",
    isOnline: null,
    format: null,
    teamCapMin: 0,
    teamCapMax: 400,
    oneDayOnly: false,
    category: null,
    timezoneProximity: 'any',
  })

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      // Search text filter (searches both competitionName and location)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        const matchesName = (tournament.competitionName || '').toLowerCase().includes(searchLower)
        const matchesLocation = (tournament.location || '').toLowerCase().includes(searchLower)
        if (!matchesName && !matchesLocation) return false
      }

      // Online/In-person filter
      if (filters.isOnline !== null) {
        const isOnline = (tournament.location || '').toLowerCase().includes("online")
        if (filters.isOnline !== isOnline) return false
      }

      // Format filter
      if (filters.format) {
        const fmt = (tournament.format || '').toUpperCase()
        if (filters.format === 'OTHER') {
          if (fmt.includes('BP') || fmt.includes('AP')) return false
        } else {
          if (!fmt.includes(filters.format)) return false
        }
      }

      // One-day tournament filter
      if (filters.oneDayOnly) {
        try {
          const { startDate, endDate } = parseTournamentDateRange(tournament.date || '')
          if (startDate.toDateString() !== endDate.toDateString()) return false
        } catch {
          return false
        }
      }

      // Category filter
      if (filters.category) {
        if (tournament.category !== filters.category) return false
      }

      // Team cap range filter
      const teamCapNum = parseInt(tournament.teamCap)
      if (!isNaN(teamCapNum)) {
        if (teamCapNum < filters.teamCapMin || teamCapNum > filters.teamCapMax) {
          return false
        }
      }
      // If teamCap is N/A or invalid, include it in results

      return true
    })
  }, [filters, tournaments])

  const { upcoming: upcomingTournaments, past: pastTournaments } = usePastUpcoming(filteredTournaments);

  const currentTournaments = upcomingTournaments.slice(0, visibleCount);
  const hasMore = visibleCount < upcomingTournaments.length;

  const sections = useMemo<TournamentSection[]>(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const thisWeek: Tournament[] = [];
    const monthGroups = new Map<string, Tournament[]>();
    const MONTH_RE = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
    let prevStartDate: Date | null = null;

    for (const t of currentTournaments) {
      let startDate: Date;
      const dateStr = t.date || '';
      const hasMonth = MONTH_RE.test(dateStr);

      try {
        startDate = parseTournamentDateRange(dateStr).startDate;
      } catch {
        startDate = new Date();
      }

      if (!hasMonth && prevStartDate) {
        startDate.setMonth(prevStartDate.getMonth());
        startDate.setFullYear(prevStartDate.getFullYear());
      }
      prevStartDate = startDate;

      if (isWithinInterval(startDate, { start: weekStart, end: weekEnd })) {
        thisWeek.push(t);
      } else {
        const key = format(startDate, "MMMM yyyy");
        const group = monthGroups.get(key);
        if (group) {
          group.push(t);
        } else {
          monthGroups.set(key, [t]);
        }
      }
    }

    const result: TournamentSection[] = [];
    if (thisWeek.length > 0) {
      result.push({ label: "This Week", tournaments: thisWeek });
    }
    for (const [label, tournaments] of monthGroups) {
      result.push({ label, tournaments });
    }
    return result;
  }, [currentTournaments]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleCount(ITEMS_PER_BATCH);
  }

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_BATCH);
        }
      },
      { rootMargin: '200px' }
    );
    observerRef.current.observe(node);
  }, []);

  const fetchTournaments = async (bypassCache = false) => {
    setIsRefreshing(true);
    try {
      const url = bypassCache
        ? `/api/tournaments?source=${source}&t=${Date.now()}`
        : `/api/tournaments?source=${source}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTournaments(data.tournaments);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setVisibleCount(ITEMS_PER_BATCH);
    fetchTournaments();
  }, [source]);

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-10">
            <div className="flex flex-col justify-center pt-10 pb-6">
              <h1 className="text-4xl font-bold mb-2 font-serif tracking-tight">
                {pageTitle}
                {sourceInfo.flagCode && <span className={`fi fi-${sourceInfo.flagCode} rounded-[0.375rem] ml-3 align-middle relative -top-[0.25rem]`} style={{ fontSize: '1.75rem' }} />}
              </h1>
              <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
              <p className="text-xs text-muted-foreground/70 mt-2">Data from <a href={sourceInfo.sheetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">{sourceInfo.sheetName}</a></p>
            </div>
          </header>
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">Loading tournaments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-10">
            <div className="flex flex-col justify-center pt-10 pb-6">
              <h1 className="text-4xl font-bold mb-2 font-serif tracking-tight">
                {pageTitle}
                {sourceInfo.flagCode && <span className={`fi fi-${sourceInfo.flagCode} rounded-[0.375rem] ml-3 align-middle relative -top-[0.25rem]`} style={{ fontSize: '1.75rem' }} />}
              </h1>
              <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
              <p className="text-xs text-muted-foreground/70 mt-2">Data from <a href={sourceInfo.sheetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">{sourceInfo.sheetName}</a></p>
            </div>
          </header>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-2">Error loading tournaments</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex flex-col justify-center pt-10 pb-6">
            <h1 className="text-4xl font-bold mb-2 font-serif tracking-tight">
              {pageTitle}
              {sourceInfo.flagCode && <span className={`fi fi-${sourceInfo.flagCode} rounded-[0.375rem] ml-3 align-middle relative -top-[0.25rem]`} style={{ fontSize: '1.75rem' }} />}
            </h1>
            <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Data from <a href={sourceInfo.sheetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">{sourceInfo.sheetName}</a></p>
          </div>
        </header>

        <SearchFilterBar filters={filters} onFiltersChange={handleFiltersChange} />

        <ViewToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={() => fetchTournaments(true)}
          isRefreshing={isRefreshing}
        />

        {viewMode === 'grid' ? (
          <>
            {sections.map((section) =>
              section.label === "This Week" ? (
                <div key={section.label} className="this-week-banner mb-8 pt-8 pb-12">
                  <h2 className="text-2xl font-semibold mb-6 text-white font-serif tracking-tight">
                    {section.label} ({section.tournaments.length})
                  </h2>
                  <div className={GRID_CLASSNAME}>
                    {section.tournaments.map((tournament, index) => (
                      <EventCard key={`${section.label}-${tournament.competitionName}-${index}`} tournament={tournament} />
                    ))}
                  </div>
                </div>
              ) : (
                <div key={section.label} className="mb-12">
                  <h2 className={`text-2xl font-semibold text-foreground font-serif tracking-tight ${section.tournaments[0]?.category ? "mb-7 md:mb-4" : "mb-4"}`}>
                    {section.label} ({section.tournaments.length})
                  </h2>
                  <div className={GRID_CLASSNAME}>
                    {section.tournaments.map((tournament, index) => (
                      <EventCard key={`${section.label}-${tournament.competitionName}-${index}`} tournament={tournament} />
                    ))}
                  </div>
                </div>
              )
            )}

            {hasMore && <div ref={sentinelRef} className="h-4" />}

            <PastSection tournaments={pastTournaments} className="mb-12" />
          </>
        ) : (
          <CalendarView tournaments={filteredTournaments} />
        )}
      </div>
    </div>
  );
}
