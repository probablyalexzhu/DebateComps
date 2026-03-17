"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { EventCard } from "@/components/custom/event-card";
import { Button } from "@/components/ui/button";
import { Grid3x3, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { FilterState, SearchFilterBar } from "@/components/custom/search-filter-bar";
import { CalendarView } from "@/components/custom/calendar-view";
import { cn } from "@/lib/utils";

const ITEMS_PER_BATCH = 16;

type ViewMode = 'grid' | 'calendar';

export default function Home() {
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
    teamCapMax: 200,
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

      // Format filter (checks if format contains BP or AP)
      if (filters.format) {
        if (!(tournament.format || '').toUpperCase().includes(filters.format)) return false
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

  const currentTournaments = filteredTournaments.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTournaments.length;

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
        ? `/api/tournaments?t=${Date.now()}`
        : '/api/tournaments';
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
    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="bg-background overflow-y-scroll">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex flex-col justify-center py-8">
              <h1 className="text-4xl font-bold mb-2">DebateComps - The home for debate</h1>
              <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
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
      <div className="bg-background overflow-y-scroll">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex flex-col justify-center py-8">
              <h1 className="text-4xl font-bold mb-2">DebateComps - The home for debate</h1>
              <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
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
        <header className="mb-8">
          <div className="flex flex-col justify-center py-8">
            <h1 className="text-4xl font-bold mb-2">DebateComps - The home for debate</h1>
            <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
          </div>
        </header>

        <SearchFilterBar filters={filters} onFiltersChange={handleFiltersChange} />

        <div className="flex items-center justify-between gap-2 mb-6 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                viewMode === 'grid'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Grid View
              </div>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                viewMode === 'calendar'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </div>
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchTournaments(true)}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentTournaments.map((tournament, index) => (
                <EventCard key={`${tournament.competitionName}-${index}`} tournament={tournament} />
              ))}
            </div>

            {hasMore && <div ref={sentinelRef} className="h-4" />}
          </>
        ) : (
          <CalendarView tournaments={filteredTournaments} />
        )}
      </div>
    </div>
  );
}
