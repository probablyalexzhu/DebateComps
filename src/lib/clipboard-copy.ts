import type { Tournament } from '@/types/tournament'
import { generateEventDetails, parseTournamentDateRange } from '@/lib/calendar-export'

const displayDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function formatDateRange(dateStr: string): string {
  const { startDate, endDate } = parseTournamentDateRange(dateStr)
  const startText = displayDateFormatter.format(startDate)
  const endText = displayDateFormatter.format(endDate)

  return startDate.toDateString() === endDate.toDateString() ? startText : `${startText} – ${endText}`
}

function buildClipboardSection(tournament: Tournament): string {
  const details = generateEventDetails(tournament)
  const location = tournament.location !== 'Online' ? tournament.location : 'Online Event'

  return [
    `Competition: ${tournament.competitionName}`,
    `Dates: ${formatDateRange(tournament.date)}`,
    `Location: ${location}`,
    details ? `${details}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

async function writeTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Continue to fallback
    }
  }

  // Fallback to legacy clipboard fallback
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    return successful
  } catch {
    return false
  }
}

export async function copyTournamentsToClipboard(tournaments: Tournament[]): Promise<boolean> {
  if (!tournaments.length) {
    return false
  }

  const text = tournaments.map(buildClipboardSection).join('\n\n---\n\n')
  return writeTextToClipboard(text)
}

