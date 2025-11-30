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
  // Tournament dates are in format like "January 15-17 2025" or "Feb 20 2025" or "Dec 28 - Jan 4"
  const cleaned = dateStr.trim();

  // Try to extract year
  const yearMatch = cleaned.match(/\d{4}/);
  const baseYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

  // Try to extract months (may be one or two)
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const lowerCleaned = cleaned.toLowerCase();
  const foundMonths: Array<{ idx: number; pos: number; day?: number }> = [];

  for (let i = 0; i < monthNames.length; i++) {
    const fullName = monthNames[i];
    const shortName = fullName.slice(0, 3);
    const regex = new RegExp(`\\b(${fullName}|${shortName})\\b`, 'gi');
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
      const pos = match.index;
      // Try to extract day number after this month (e.g., "Dec 28" or "Dec28")
      const afterMatch = cleaned.slice(pos + match[0].length).match(/^\s*(\d{1,2})/);
      const day = afterMatch ? parseInt(afterMatch[1], 10) : undefined;
      foundMonths.push({ idx: i, pos, day });
    }
  }

  // Sort by position in string
  foundMonths.sort((a, b) => a.pos - b.pos);

  const startMonthData = foundMonths[0] ?? { idx: 0, pos: 0, day: undefined };
  const endMonthData = foundMonths.length > 1 ? foundMonths[1] : startMonthData;
  const startMonthIdx = startMonthData.idx;
  const endMonthIdx = endMonthData.idx;
  const startMonth = (startMonthIdx + 1).toString().padStart(2, '0');
  const endMonth = (endMonthIdx + 1).toString().padStart(2, '0');

  // If end month is earlier than start month (or Dec -> Jan), increment year for end date
  const endYear = (endMonthIdx < startMonthIdx || (startMonthIdx === 11 && endMonthIdx === 0)) 
    ? baseYear + 1 
    : baseYear;

  // Extract days - use day from month data if available, otherwise fall back to regex
  let startDay: string;
  let endDay: string;

  if (startMonthData.day !== undefined && endMonthData.day !== undefined) {
    startDay = startMonthData.day.toString().padStart(2, '0');
    endDay = endMonthData.day.toString().padStart(2, '0');
  } else {
    // Fallback to original regex approach
    const dayRangeMatch = cleaned.match(/(\d{1,2})(?:\s*-\s*(\d{1,2}))?/);
    if (dayRangeMatch) {
      startDay = dayRangeMatch[1].padStart(2, '0');
      endDay = dayRangeMatch[2] ? dayRangeMatch[2].padStart(2, '0') : startDay;
    } else {
      startDay = startMonthData.day?.toString().padStart(2, '0') ?? '01';
      endDay = endMonthData.day?.toString().padStart(2, '0') ?? '01';
    }
  }

  const startDate = new Date(`${baseYear}-${startMonth}-${startDay}`);
  const endDate = new Date(`${endYear}-${endMonth}-${endDay}`);

  return { startDate, endDate };
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
