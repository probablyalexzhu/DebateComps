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
import { Tournament } from "@/types/tournament"

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

  const getFormatChipStyle = (format: string) => {
    const f = format.toUpperCase().trim()
    if (f.includes('BP')) return 'bg-secondary/25 text-secondary-foreground border-secondary/40'
    if (f.includes('AP')) return 'bg-accent/25 text-accent border-accent/40'
    return 'bg-muted text-muted-foreground'
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'premier': return 'Premier Regional'
      case 'wudc': return 'WUDC'
      case 'large': return 'Large Tournament'
      default: return ''
    }
  }

  const getTeamCapChipStyle = (teamCap: string) => {
    const cap = parseInt(teamCap, 10)
    if (!isNaN(cap) && cap > 80) return 'bg-primary/10 text-primary border-primary/20'
    return 'bg-muted text-muted-foreground'
  }

  const getCardCategoryBg = (category: string) => {
    switch (category) {
      case 'premier': return '!bg-(--card-premier)'
      case 'wudc': return '!bg-(--card-wudc)'
      case 'large': return '!bg-(--card-large)'
      default: return ''
    }
  }

  const getCategoryTabColor = (category: string) => {
    switch (category) {
      case 'premier': return 'bg-amber-400 dark:bg-amber-500'
      case 'wudc': return 'bg-cyan-500 dark:bg-cyan-400'
      case 'large': return 'bg-[oklch(0.65_0.15_35)] dark:bg-[oklch(0.68_0.13_35)]'
      default: return ''
    }
  }

  const getCategoryTabText = (category: string) => {
    switch (category) {
      case 'premier': return 'text-white dark:text-amber-950'
      case 'wudc': return 'text-white dark:text-cyan-950'
      case 'large': return 'text-white dark:text-red-950'
      default: return ''
    }
  }

  // Get team cap display value
  const teamCapDisplay = tournament.teamCap && tournament.teamCap.trim() !== ''
  && tournament.teamCap !== 'N/A' && tournament.teamCap !== 'TBA'
    ? tournament.teamCap + " Teams"
    : 'N/A'

  const hasCategory = !!tournament.category

  return (
    <div className={cn("group/card relative h-full", hasCategory && "hover:z-20")}>
      {hasCategory && (
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 right-0 rounded-xl",
            "-translate-y-3 md:translate-y-0 md:-translate-x-[4px] md:group-hover/card:-translate-x-3 md:group-hover/card:-translate-y-[3px]",
            "transition-transform duration-300 ease-[cubic-bezier(0.25,1.3,0.5,1)]",
            "flex md:items-center md:justify-start md:pl-0.5 items-start justify-center pt-0.5",
            getCategoryTabColor(tournament.category),
          )}
        >
          <span
            className={cn(
              "text-sm font-extrabold uppercase tracking-widest whitespace-nowrap md:[writing-mode:vertical-rl] md:rotate-180",
              getCategoryTabText(tournament.category),
            )}
          >
            {getCategoryLabel(tournament.category)}
          </span>
        </div>
      )}
      <Card className={cn(
        "relative z-10 overflow-hidden h-full flex flex-col pt-0 pb-0",
        hasCategory && "translate-y-3 md:translate-y-0 md:translate-x-0 md:transition-transform md:duration-300 md:ease-[cubic-bezier(0.25,1.3,0.5,1)] md:group-hover/card:translate-x-3 md:group-hover/card:translate-y-[3px]",
        getCardCategoryBg(tournament.category),
      )}>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="space-y-4 flex-1">
          <div className="flex items-start justify-between">
            <span className="text-2xl">{flag}</span>
            <button
              onClick={handleToggleSave}
              className="-m-1.5 p-2.5 ml-3 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label={isSaved ? "Remove from saved" : "Save tournament"}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight text-balance">{tournament.competitionName}</h3>
            <div className="flex gap-1.5 flex-wrap items-center mt-2">
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
                {tournament.fees?.trim() || "TBA"}
              </span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <Gavel className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed truncate">
                {tournament.judgeRule?.trim() || "TBA"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 mt-auto">
          {tournament.regLink && tournament.regLink !== "TBA" && tournament.regLink.trim() !== "" ? (
            <Button asChild size="sm" className="flex-1">
              <a href={tournament.regLink} target="_blank" rel="noopener noreferrer">
                Register
              </a>
            </Button>
          ) : (
            <Button size="sm" className="flex-1 opacity-50 cursor-not-allowed" disabled>
              Register
            </Button>
          )}
          {tournament.infoLink && tournament.infoLink !== "TBA" && tournament.infoLink.trim() !== "" ? (
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <a href={tournament.infoLink} target="_blank" rel="noopener noreferrer">
                More Info
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 bg-transparent opacity-50 cursor-not-allowed" disabled>
              More Info
            </Button>
          )}
          <Button
            onClick={handleExportToGoogleCal}
            variant="outline"
            size="sm"
            className="shrink-0 cursor-pointer"
            title="Add to Google Calendar"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
