"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { EventCard } from "@/components/custom/event-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { FilterState, SearchFilterBar } from "@/components/custom/search-filter-bar";

const ITEMS_PER_PAGE = 16;

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
        const matchesName = tournament.competitionName.toLowerCase().includes(searchLower)
        const matchesLocation = tournament.location.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesLocation) return false
      }

      // Online/In-person filter
      if (filters.isOnline !== null) {
        const isOnline = tournament.location.toLowerCase().includes("online")
        if (filters.isOnline !== isOnline) return false
      }

      // Format filter (checks if format contains BP or AP)
      if (filters.format) {
        if (!tournament.format.toUpperCase().includes(filters.format)) return false
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

  const totalPages = Math.ceil(filteredTournaments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex)

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setTournaments(data.tournaments);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-background overflow-y-scroll">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 relative h-56">
            {/* Background image - behind text */}
            <div className="absolute right-0 top-0 opacity-70 z-0 pointer-events-none">
              <Image 
                src="/banner.png" 
                alt="Banner" 
                width={400} 
                height={200}
                className="object-contain"
              />
            </div>
            
            {/* Text - in front */}
            <div className="relative z-10 flex flex-col justify-center h-full">
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
          <header className="mb-8 relative h-56">
            {/* Background image - behind text */}
            <div className="absolute right-0 top-0 opacity-70 z-0 pointer-events-none">
              <Image 
                src="/banner.png" 
                alt="Banner" 
                width={400} 
                height={200}
                className="object-contain"
              />
            </div>
            
            {/* Text - in front */}
            <div className="relative z-10 flex flex-col justify-center h-full">
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
        <header className="mb-8 relative h-56">
          {/* Background image - behind text */}
          <div className="absolute right-0 top-0 opacity-70 z-0 pointer-events-none">
            <Image 
              src="/banner.png" 
              alt="Banner" 
              width={400} 
              height={200}
              className="object-contain"
            />
          </div>
          
          {/* Text - in front */}
          <div className="relative z-10 flex flex-col justify-center h-full">
            <h1 className="text-4xl font-bold mb-2">DebateComps - The home for debate</h1>
            <p className="text-muted-foreground">Where debaters, adjudicators, and organizers come together to find the best opportunities.</p>
          </div>
        </header>

        <SearchFilterBar filters={filters} onFiltersChange={handleFiltersChange} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentTournaments.map((tournament, index) => (
            <EventCard key={`${tournament.competitionName}-${index}`} tournament={tournament} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={goToPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button variant="outline" onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
