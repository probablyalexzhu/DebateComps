'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, CircleDollarSign, Gavel, Bookmark } from "lucide-react"
import { getCountryFlag } from "@/lib/country-flags"
import { cn } from "@/lib/utils"
import { toggleSavedTournament, isTournamentSaved } from "@/lib/saved-tournaments"
import { generateGoogleCalendarUrl } from "@/lib/calendar-export"

interface Tournament {
  competitionName: string
  date: string
  fees: string
  format: string
  infoLink: string
  judgeRule: string
  location: string
  profitStatus: string
  regLink: string
  timezone: string
  teamCap: string
}

interface EventCardProps {
  tournament: Tournament
}

export function EventCard({ tournament }: EventCardProps) {
  // Generate unique ID for tournament
  const tournamentId = `${tournament.competitionName}-${tournament.date}`.replace(/\s+/g, '-').toLowerCase()

  const [isSaved, setIsSaved] = useState(false)
  const flag = getCountryFlag(tournament.location)

  useEffect(() => {
    setIsSaved(isTournamentSaved(tournamentId))
  }, [tournamentId])

  const handleToggleSave = () => {
    const newSavedState = toggleSavedTournament(tournamentId)
    setIsSaved(newSavedState)
  }

  const handleExportToGoogleCal = () => {
    const url = generateGoogleCalendarUrl(tournament)
    window.open(url, '_blank')
  }

  // Helper function for format chip styling
  const getFormatChipStyle = (format: string) => {
    if (format === 'BP') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (format === 'APD' || format === 'AP') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-secondary text-secondary-foreground'
  }

  // Helper function for team cap chip styling
  const getTeamCapChipStyle = (teamCap: string) => {
    const cap = parseInt(teamCap, 10)
    if (!isNaN(cap) && cap > 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-secondary text-secondary-foreground'
  }

  // Get team cap display value
  const teamCapDisplay = tournament.teamCap && tournament.teamCap.trim() !== ''
  && tournament.teamCap !== 'N/A' && tournament.teamCap !== 'TBA'
    ? tournament.teamCap + " Teams"
    : 'N/A'

  return (
    <Card className="overflow-hidden h-full flex flex-col pt-0 pb-0 transition-transform duration-200 ease-out hover:-translate-y-0.5">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="space-y-4 flex-1">
          <div className="flex items-start justify-between">
            <span className="text-3xl">{flag}</span>
            <button
              onClick={handleToggleSave}
              className="-m-1.5 p-2.5 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label={isSaved ? "Remove from saved" : "Save tournament"}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight text-balance">{tournament.competitionName}</h3>
            <div className="flex gap-1 flex-wrap mt-2">
              <Badge variant="secondary" className={cn("text-xs", getFormatChipStyle(tournament.format))}>
                {tournament.format}
              </Badge>
              <Badge variant="secondary" className={cn("text-xs", getTeamCapChipStyle(teamCapDisplay))}>
                {teamCapDisplay}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="leading-relaxed">
                {tournament.date} • {tournament.timezone}
              </span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tournament.location}</span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <CircleDollarSign className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {tournament.fees}
              </span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <Gavel className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed truncate">
                {tournament.judgeRule}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 mt-auto">
          {tournament.regLink && tournament.regLink !== "TBA" && tournament.regLink.trim() !== "" ? (
            <Button asChild className="flex-1">
              <a href={tournament.regLink} target="_blank" rel="noopener noreferrer">
                Register
              </a>
            </Button>
          ) : (
            <Button className="flex-1 opacity-50 cursor-not-allowed" disabled>
              Register
            </Button>
          )}
          {tournament.infoLink && tournament.infoLink !== "TBA" && tournament.infoLink.trim() !== "" ? (
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <a href={tournament.infoLink} target="_blank" rel="noopener noreferrer">
                More Info
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 bg-transparent opacity-50 cursor-not-allowed" disabled>
              More Info
            </Button>
          )}
          <Button
            onClick={handleExportToGoogleCal}
            variant="outline"
            size="icon"
            className="shrink-0 cursor-pointer"
            title="Add to Google Calendar"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
