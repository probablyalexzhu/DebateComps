'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, CircleDollarSign, Bookmark, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCountryFlag } from "@/lib/country-flags"
import { cn } from "@/lib/utils"
import { toggleSavedTournament, isTournamentSaved } from "@/lib/saved-tournaments"
import { generateGoogleCalendarUrl } from "@/lib/calendar-export"
import { Tournament } from "@/types/tournament"
import { getTimezoneDiff } from "@/lib/timezone"

interface EventCardProps {
  tournament: Tournament
}

const CATEGORY_CONFIG: Record<string, { label: string; bg: string; tabColor: string; tabText: string }> = {
  premier: { label: 'Premier Regional', bg: '!bg-(--card-premier)', tabColor: 'bg-amber-400 dark:bg-amber-500', tabText: 'text-white dark:text-amber-950' },
  wudc:    { label: 'WUDC',             bg: '!bg-(--card-wudc)',    tabColor: 'bg-cyan-500 dark:bg-cyan-400',    tabText: 'text-white dark:text-cyan-950' },
  large:   { label: 'Large Tournament', bg: '!bg-(--card-large)',   tabColor: 'bg-emerald-400',                  tabText: 'text-white dark:text-emerald-950' },
}

function getFormatChipStyle(format: string) {
  const f = format.toUpperCase().trim()
  if (f.includes('BP')) return 'bg-secondary/40 text-secondary-foreground border-secondary/60'
  if (f.includes('AP')) return 'bg-accent/40 text-amber-900 dark:text-amber-100 border-accent/60'
  return 'bg-muted text-muted-foreground'
}

function getTeamCapChipStyle(teamCap: string) {
  const cap = parseInt(teamCap, 10)
  if (!isNaN(cap) && cap > 80) return 'bg-primary/20 text-primary border-primary/40'
  return 'bg-muted text-muted-foreground'
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
            CATEGORY_CONFIG[tournament.category]?.tabColor,
          )}
        >
          <span
            className={cn(
              "text-sm font-extrabold uppercase tracking-widest whitespace-nowrap md:[writing-mode:vertical-rl] md:rotate-180",
              CATEGORY_CONFIG[tournament.category]?.tabText,
            )}
          >
            {CATEGORY_CONFIG[tournament.category]?.label}
          </span>
        </div>
      )}
      <Card className={cn(
        "relative z-10 overflow-hidden h-full flex flex-col pt-0 pb-0",
        hasCategory && "rounded-t-none md:rounded-t-xl",
        hasCategory && "translate-y-3 md:translate-y-0 md:translate-x-0 md:transition-transform md:duration-300 md:ease-[cubic-bezier(0.25,1.3,0.5,1)] md:group-hover/card:translate-x-3 md:group-hover/card:translate-y-[3px]",
        CATEGORY_CONFIG[tournament.category]?.bg,
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
              <span className="leading-relaxed">{tournament.date}</span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tournament.location}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="leading-relaxed">{tournament.timezone}</span>
              {(() => {
                const diff = getTimezoneDiff(tournament.timezone)
                if (!diff) return null
                const color = diff.direction === 'ahead' ? 'text-sky-600 dark:text-sky-400'
                  : diff.direction === 'behind' ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
                return <>
                  <span className="shrink-0">·</span>
                  <span className={cn("text-xs", color)}>{diff.label}</span>
                </>
              })()}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground min-w-0 flex-wrap md:flex-nowrap">
              <CircleDollarSign className="h-4 w-4 shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:truncate">{tournament.fees?.trim() || "TBA"}</span>
                </TooltipTrigger>
                <TooltipContent>{tournament.fees?.trim() || "TBA"}</TooltipContent>
              </Tooltip>
              <span className="shrink-0">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:truncate md:min-w-10">{tournament.judgeRule?.trim() || "TBA"}</span>
                </TooltipTrigger>
                <TooltipContent>{tournament.judgeRule?.trim() || "TBA"}</TooltipContent>
              </Tooltip>
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
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={tournament.infoLink} target="_blank" rel="noopener noreferrer">
                More Info
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 opacity-50 cursor-not-allowed" disabled>
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
