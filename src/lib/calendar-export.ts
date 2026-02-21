import type { Tournament } from '@/types/tournament';

export function generateGoogleCalendarUrl(tournament: Tournament): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: tournament.competitionName,
    dates: formatDateForGoogle(tournament.date),
    details: generateEventDetails(tournament),
    location: tournament.location !== 'Online' ? tournament.location : 'Online Event',
  });

  return `${baseUrl}?${params.toString()}`;
}

export function generateICalFile(tournaments: Tournament[]): string {
  const events = tournaments.map(tournament => {
    const details = generateEventDetails(tournament);
    const { startDate, endDate } = parseTournamentDateRange(tournament.date);

    // Add 1 day to end date because iCal uses exclusive end dates for all-day events
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDateStr = adjustedEndDate.toISOString().split('T')[0].replace(/-/g, '');

    return [
      'BEGIN:VEVENT',
      `SUMMARY:${escapeICalText(tournament.competitionName)}`,
      `DTSTART;VALUE=DATE:${startDateStr}`,
      `DTEND;VALUE=DATE:${endDateStr}`,
      `DESCRIPTION:${escapeICalText(details)}`,
      `LOCATION:${escapeICalText(tournament.location !== 'Online' ? tournament.location : 'Online Event')}`,
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DebateComps//Tournament Calendar//EN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICalFile(tournaments: Tournament[], filename = 'tournaments.ics'): void {
  const icalContent = generateICalFile(tournaments);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function generateEventDetails(tournament: Tournament): string {
  const parts = [];

  parts.push(`Format: ${tournament.format || 'TBA'}`);

  if (tournament.regLink) {
    parts.push(`Registration: ${tournament.regLink}`);
  }

  if (tournament.infoLink) {
    parts.push(`More Info: ${tournament.infoLink}`);
  }

  if (tournament.fees) {
    parts.push(`Fees: ${tournament.fees}`);
  }

  return parts.join('\n');
}

function formatDateForGoogle(dateStr: string): string {
  // Google Calendar expects format: YYYYMMDDTHHmmSS/YYYYMMDDTHHmmSS
  // For all-day events: YYYYMMDD/YYYYMMDD
  // IMPORTANT: End date is exclusive (day after the last day)

  try {
    const { startDate, endDate } = parseTournamentDateRange(dateStr);

    // Add 1 day to end date because Google Calendar uses exclusive end dates
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const startFormatted = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endFormatted = adjustedEndDate.toISOString().split('T')[0].replace(/-/g, '');
    return `${startFormatted}/${endFormatted}`;
  } catch {
    // Fallback to current date if parsing fails
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `${today}/${today}`;
  }
}

export function parseTournamentDateRange(dateStr: string): { startDate: Date; endDate: Date } {
  const cleaned = dateStr.trim();

  // Extract year
  const yearMatch = cleaned.match(/\b(20\d{2})\b/);
  const baseYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  // Remove year so its digits don't get mistaken for a day number
  const withoutYear = cleaned.replace(/\b20\d{2}\b/g, '').replace(/\s+/g, ' ').trim();

  const MONTHS: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9,
    oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  };

  const MONTH_RE = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;
  const DAY_RE = /\b(\d{1,2})(?:st|nd|rd|th)?\b/;

  function parsePart(part: string): { month: number | null; day: number | null } {
    const monthMatch = part.match(MONTH_RE);
    const month = monthMatch ? (MONTHS[monthMatch[1].toLowerCase()] ?? null) : null;
    const dayMatch = part.match(DAY_RE);
    const day = dayMatch ? parseInt(dayMatch[1]) : null;
    return { month, day };
  }

  // Split into start / end on the first dash
  const dashMatch = withoutYear.match(/^(.+?)\s*-\s*(.+)$/);
  const startParsed = parsePart(dashMatch ? dashMatch[1].trim() : withoutYear);
  const endParsed   = dashMatch ? parsePart(dashMatch[2].trim()) : null;

  // Inherit month if one part is missing it
  const startMonth = startParsed.month ?? endParsed?.month ?? 1;
  const endMonth   = endParsed?.month ?? startParsed.month ?? 1;
  const startDay   = startParsed.day ?? 1;
  const endDay     = endParsed?.day ?? startParsed.day ?? 1;

  // Cross-year: if end month is before start month, end is next year
  const endYear = endMonth < startMonth ? baseYear + 1 : baseYear;

  const startDate = new Date(baseYear, startMonth - 1, startDay);
  const endDate   = new Date(endYear, endMonth - 1, endDay);

  return { startDate, endDate };
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
