'use client'

import { useEffect, useState } from 'react'
import { EventCard } from '@/components/custom/event-card'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Info } from 'lucide-react'
import { getSavedTournaments } from '@/lib/saved-tournaments'
import { downloadICalFile } from '@/lib/calendar-export'
import { copyTournamentsToClipboard } from '@/lib/clipboard-copy'
import type { Tournament } from '@/types/tournament'

export default function SavedPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [savedTournaments, setSavedTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments')
        const data = await response.json()

        if (data.error) {
          setError(data.error)
          return
        }

        setTournaments(data.tournaments || [])
      } catch (err) {
        setError('Failed to load tournaments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  useEffect(() => {
    const updateSavedTournaments = () => {
      const savedIds = getSavedTournaments()
      const filtered = tournaments.filter((tournament) => {
        const tournamentId = `${tournament.competitionName}-${tournament.date}`
          .replace(/\s+/g, '-')
          .toLowerCase()
        return savedIds.has(tournamentId)
      })
      setSavedTournaments(filtered)
    }

    updateSavedTournaments()

    // Listen for changes to saved tournaments
    window.addEventListener('savedTournamentsChanged', updateSavedTournaments)

    return () => {
      window.removeEventListener('savedTournamentsChanged', updateSavedTournaments)
    }
  }, [tournaments])

  const handleBulkExport = () => {
    if (savedTournaments.length === 0) return
    downloadICalFile(savedTournaments, 'saved-tournaments.ics')
  }

  const handleCopyDetails = async () => {
    if (savedTournaments.length === 0) return
    const success = await copyTournamentsToClipboard(savedTournaments)
    setCopyFeedback(success ? 'copied' : 'error')
  }

  useEffect(() => {
    if (copyFeedback === 'idle') return
    const timeout = window.setTimeout(() => setCopyFeedback('idle'), 2000)
    return () => window.clearTimeout(timeout)
  }, [copyFeedback])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Loading saved tournaments...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Saved Tournaments ({savedTournaments.length})</h1>

        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Browser Storage Notice</p>
            <p>
              Tournaments are saved in your browser only. Export to your calendar for
              persistent storage across devices.
            </p>
          </div>
        </div>

        {savedTournaments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleBulkExport} variant="default" className="gap-2 cursor-pointer">
              <Calendar className="h-4 w-4" />
              Download Calendar File
            </Button>
            <div className="relative">
              <Button
                onClick={handleCopyDetails}
                variant="secondary"
                className="gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Copy Tournament Details
              </Button>
              <span
                className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-3 py-1 text-xs text-background transition-all ${
                  copyFeedback === 'idle' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                role="status"
              >
                {copyFeedback !== 'error' ? 'Copied!' : 'Copy failed'}
              </span>
            </div>
          </div>
        )}
      </div>

      {savedTournaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No saved tournaments yet.</p>
          <p className="text-sm text-muted-foreground">
            Browse tournaments and click the bookmark icon to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedTournaments.map((tournament, index) => (
            <EventCard key={`${tournament.competitionName}-${index}`} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  )
}
