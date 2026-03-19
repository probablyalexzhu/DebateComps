const TIMEZONE_OFFSETS: Record<string, number> = {
  'UTC': 0, 'GMT': 0,
  'EST': -5, 'EDT': -4,
  'CST': -6, 'CDT': -5,
  'MST': -7, 'MDT': -6,
  'PST': -8, 'PDT': -7,
  'BST': 1,
  'CET': 1, 'CEST': 2,
  'EET': 2, 'EEST': 3,
  'IST': 5.5,
  'JST': 9,
  'KST': 9,
  'CST_CN': 8,
  'AEST': 10, 'AEDT': 11,
  'ACST': 9.5, 'ACDT': 10.5,
  'AWST': 8,
  'NZST': 12, 'NZDT': 13,
  'SGT': 8,
  'HKT': 8,
  'WIB': 7, 'WITA': 8, 'WIT': 9,
  'PHT': 8,
  'ICT': 7,
  'MYT': 8,
}

export function parseOffsetMinutes(tz: string): number | null {
  const trimmed = tz.trim().toUpperCase()

  // Match "UTC", "GMT" alone (no offset = +0)
  if (/^(UTC|GMT)$/i.test(trimmed)) return 0

  // Match "UTC+8", "GMT-5:30", "UTC+05:30", etc.
  const offsetMatch = trimmed.match(/(?:UTC|GMT)([+\-\u2212])(\d{1,2})(?::(\d{2}))?/)
  if (offsetMatch) {
    const sign = offsetMatch[1] === '+' ? 1 : -1 // covers -, − (U+2212)
    const hours = parseInt(offsetMatch[2], 10)
    const minutes = parseInt(offsetMatch[3] || '0', 10)
    return sign * (hours * 60 + minutes)
  }

  // Match common abbreviations
  const abbrev = TIMEZONE_OFFSETS[trimmed]
  if (abbrev !== undefined) return abbrev * 60

  return null
}

export function getAbsHourDiff(tz: string): number | null {
  const tournamentOffsetMin = parseOffsetMinutes(tz)
  if (tournamentOffsetMin === null) return null
  const localOffsetMin = -new Date().getTimezoneOffset()
  return Math.abs(tournamentOffsetMin - localOffsetMin) / 60
}

export type TimezoneDiff = { label: string; direction: 'ahead' | 'behind' | 'same' }

export function getTimezoneDiff(tz: string): TimezoneDiff | null {
  const tournamentOffsetMin = parseOffsetMinutes(tz)
  if (tournamentOffsetMin === null) return null
  const localOffsetMin = -new Date().getTimezoneOffset()
  const diffMin = tournamentOffsetMin - localOffsetMin
  if (diffMin === 0) return { label: 'same as you', direction: 'same' }
  const diffHours = Math.floor(Math.abs(diffMin) / 60)
  const diffMins = Math.abs(diffMin) % 60
  const time = diffMins > 0 ? `${diffHours}h${diffMins}m` : `${diffHours}h`
  return diffMin > 0
    ? { label: `${time} ahead`, direction: 'ahead' }
    : { label: `${time} behind`, direction: 'behind' }
}
