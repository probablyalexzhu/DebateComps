import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Info } from "lucide-react"
import { getCountryFlag } from "@/lib/country-flags"
import { cn } from "@/lib/utils"

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
  const flag = getCountryFlag(tournament.location)

  // Helper function for format chip styling
  const getFormatChipStyle = (format: string) => {
    if (format === 'BP') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (format === 'APD' || format === 'AP') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-secondary text-secondary-foreground'
  }

  // Helper function for team cap chip styling
  const getTeamCapChipStyle = (teamCap: string) => {
    const cap = parseInt(teamCap)
    if (!isNaN(cap) && cap > 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-secondary text-secondary-foreground'
  }

  // Get team cap display value
  const teamCapDisplay = tournament.teamCap && tournament.teamCap.trim() !== '' && tournament.teamCap !== 'N/A' 
    ? tournament.teamCap 
    : 'N/A'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col pt-0">
      <div className="aspect-video bg-muted flex items-center justify-center text-6xl">{flag}</div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="space-y-3 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-lg leading-tight flex-1 text-balance">{tournament.competitionName}</h3>
            <div className="flex gap-1 shrink-0">
              <Badge variant="secondary" className={cn("text-xs", getFormatChipStyle(tournament.format))}>
                {tournament.format}
              </Badge>
              <Badge variant="secondary" className={cn("text-xs", getTeamCapChipStyle(teamCapDisplay))}>
                {teamCapDisplay}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm">
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
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {tournament.judgeRule} • {tournament.fees} • {tournament.profitStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 mt-auto">
          {tournament.regLink && tournament.regLink !== "TBA" && tournament.regLink.trim() !== "" ? (
            <Button asChild className="flex-1">
              <a href={tournament.regLink} target="_blank" rel="noopener noreferrer">
                Register
              </a>
            </Button>
          ) : (
            <Button className="flex-1 opacity-50 cursor-not-allowed" disabled>
              Coming Soon
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
              Info TBA
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
