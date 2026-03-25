'use client'

import { Calendar, View } from 'react-big-calendar'
import { dateFnsLocalizer } from 'react-big-calendar'
import { format, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Tournament } from '@/types/tournament'
import { parseTournamentDateRange } from '@/lib/calendar-export'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { EventCard } from '@/components/custom/event-card'
import { useMemo, useState } from 'react'

const localizer = dateFnsLocalizer({
  format,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Tournament
}

interface CalendarViewProps {
  tournaments: Tournament[]
  onSelectEvent?: (event: CalendarEvent) => void
}

export function CalendarView({ tournaments, onSelectEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('month')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const events = useMemo(() => {
    return tournaments
      .map((tournament, index) => {
        try {
          const { startDate, endDate } = parseTournamentDateRange(tournament.date)
          
          // Make all events all-day by setting times to start and end of day
          const start = new Date(startDate)
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          
          // Include timezone in the event title
          const title = tournament.timezone 
            ? `${tournament.competitionName} (${tournament.timezone})`
            : tournament.competitionName
          
          return {
            id: `${tournament.competitionName}-${index}`,
            title,
            start,
            end,
            resource: tournament,
            allDay: true,
          } as CalendarEvent & { allDay: boolean }
        } catch (error) {
          // Skip tournaments with invalid dates
          return null
        }
      })
      .filter((event): event is CalendarEvent & { allDay: boolean } => event !== null)
  }, [tournaments])

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event)
    } else {
      // Show dialog with event details
      setSelectedEvent(event)
    }
  }

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleView = (newView: View) => {
    setCurrentView(newView)
  }

  const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    premier: { bg: 'var(--tab-premier)', text: 'var(--tab-premier-text)' },
    wudc:    { bg: 'var(--tab-wudc)',    text: 'var(--tab-wudc-text)' },
    large:   { bg: 'var(--tab-large)',   text: 'var(--tab-large-text)' },
  }

  return (
    <>
      <Card className="p-4">
        {/* Legend - only show when colors are visible (not in agenda view) */}
        {currentView !== 'agenda' && (
          <div className="flex items-center gap-4 pb-4 border-b border-border flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'oklch(from var(--secondary) l calc(c * 0.5) h)' }}></div>
              <span className="text-sm text-foreground">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'oklch(from var(--primary) l calc(c * 0.5) h)' }}></div>
              <span className="text-sm text-foreground">In-Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--tab-large)' }}></div>
              <span className="text-sm text-foreground">Large Tournament</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--tab-premier)' }}></div>
              <span className="text-sm text-foreground">Premier Regional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--tab-wudc)' }}></div>
              <span className="text-sm text-foreground">WUDC</span>
            </div>
          </div>
        )}

        <div className="h-[600px] min-h-[400px] w-full">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            view={currentView}
            onNavigate={handleNavigate}
            onView={handleView}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day', 'agenda']}
            popup
            eventPropGetter={(event: CalendarEvent) => {
              const isOnline = (event.resource.location || '').toLowerCase().includes('online')
              const style: React.CSSProperties = {
                backgroundColor: isOnline ? 'oklch(from var(--secondary) l calc(c * 0.5) h)' : 'oklch(from var(--primary) l calc(c * 0.5) h)',
                color: isOnline ? 'var(--secondary-foreground)' : 'var(--primary-foreground)',
              }
              const category = event.resource.category
              if (category && CATEGORY_COLORS[category] && currentView !== 'agenda') {
                style.borderLeft = `4px solid ${CATEGORY_COLORS[category].bg}`
              }
              return { style }
            }}
          />
        </div>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogTitle className="sr-only">
            {selectedEvent ? selectedEvent.resource.competitionName : 'Tournament Details'}
          </DialogTitle>
          {selectedEvent && (
            <EventCard
              tournament={selectedEvent.resource}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

