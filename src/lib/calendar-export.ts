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

function generateEventDetails(tournament: Tournament): string {
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

function parseTournamentDateRange(dateStr: string): { startDate: Date; endDate: Date } {
  // Tournament dates are in format like "January 15-17 2025" or "Feb 20 2025"
  const cleaned = dateStr.trim();

  // Try to extract year
  const yearMatch = cleaned.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  // Try to extract month
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const lowerCleaned = cleaned.toLowerCase();
  let month = '01';

  for (let i = 0; i < monthNames.length; i++) {
    if (lowerCleaned.includes(monthNames[i]) || lowerCleaned.includes(monthNames[i].slice(0, 3))) {
      month = (i + 1).toString().padStart(2, '0');
      break;
    }
  }

  // Extract day range (e.g., "15-17", "15 - 17", or just "20")
  const dayRangeMatch = cleaned.match(/(\d{1,2})(?:\s*-\s*(\d{1,2}))?/);

  if (dayRangeMatch) {
    const startDay = dayRangeMatch[1].padStart(2, '0');
    const endDay = dayRangeMatch[2] ? dayRangeMatch[2].padStart(2, '0') : startDay;

    const startDate = new Date(`${year}-${month}-${startDay}`);
    const endDate = new Date(`${year}-${month}-${endDay}`);

    return { startDate, endDate };
  }

  // Fallback
  const fallbackDate = new Date(`${year}-${month}-01`);
  return { startDate: fallbackDate, endDate: fallbackDate };
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
