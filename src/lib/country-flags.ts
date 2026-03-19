const countryToCode: Record<string, string> = {
  // Asia
  India: "in",
  China: "cn",
  Japan: "jp",
  "South Korea": "kr",
  Thailand: "th",
  Vietnam: "vn",
  Singapore: "sg",
  Malaysia: "my",
  Indonesia: "id",
  Philippines: "ph",
  Pakistan: "pk",
  Bangladesh: "bd",
  "Sri Lanka": "lk",
  Nepal: "np",
  Myanmar: "mm",
  Cambodia: "kh",
  Laos: "la",
  Taiwan: "tw",
  "Hong Kong": "hk",
  Macau: "mo",
  Mongolia: "mn",
  Brunei: "bn",
  "Timor-Leste": "tl",

  // Europe
  "United Kingdom": "gb",
  UK: "gb",
  England: "gb-eng",
  Scotland: "gb-sct",
  Wales: "gb-wls",
  France: "fr",
  Germany: "de",
  Italy: "it",
  Spain: "es",
  Portugal: "pt",
  Netherlands: "nl",
  Belgium: "be",
  Switzerland: "ch",
  Austria: "at",
  Poland: "pl",
  Czechia: "cz",
  Hungary: "hu",
  Romania: "ro",
  Greece: "gr",
  Sweden: "se",
  Norway: "no",
  Denmark: "dk",
  Finland: "fi",
  Ireland: "ie",
  Russia: "ru",
  Latvia: "lv",
  Lithuania: "lt",
  Estonia: "ee",
  Slovakia: "sk",
  Slovenia: "si",
  Croatia: "hr",
  Montenegro: "me",
  Serbia: "rs",
  Ukraine: "ua",
  Bulgaria: "bg",
  "North Macedonia": "mk",
  Albania: "al",
  "Bosnia and Herzegovina": "ba",
  Bosnia: "ba",

  // Americas
  "United States": "us",
  USA: "us",
  US: "us",
  Canada: "ca",
  Mexico: "mx",
  Brazil: "br",
  Argentina: "ar",
  Chile: "cl",
  Colombia: "co",
  Peru: "pe",
  Venezuela: "ve",
  Ecuador: "ec",
  Uruguay: "uy",
  "Costa Rica": "cr",
  Panama: "pa",

  // Oceania
  Australia: "au",
  "New Zealand": "nz",

  // Middle East
  UAE: "ae",
  "Saudi Arabia": "sa",
  Israel: "il",
  Turkey: "tr",
  Iran: "ir",
  Qatar: "qa",
  Bahrain: "bh",
  Kuwait: "kw",
  Oman: "om",
  Jordan: "jo",
  Lebanon: "lb",

  // Africa
  "South Africa": "za",
  Egypt: "eg",
  Nigeria: "ng",
  Kenya: "ke",
  Morocco: "ma",
  Botswana: "bw",
  Ghana: "gh",
  Tanzania: "tz",
  Uganda: "ug",
  Ethiopia: "et",
}

// Build a case-insensitive lookup map
const lowerCaseMap = new Map<string, string>()
for (const [name, code] of Object.entries(countryToCode)) {
  lowerCaseMap.set(name.toLowerCase(), code)
}

function findCountryCode(text: string): string | null {
  const trimmed = text.trim().toLowerCase()
  // Direct lookup
  if (lowerCaseMap.has(trimmed)) return lowerCaseMap.get(trimmed)!
  // Check if text contains a country name (longer names first to prefer "South Korea" over just matching a substring)
  const sorted = [...lowerCaseMap.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [name, code] of sorted) {
    if (trimmed.includes(name)) return code
  }
  return null
}

export type FlagResult = { type: 'code'; code: string } | { type: 'emoji'; emoji: string }

export function getCountryFlag(location: string): FlagResult {
  if (!location || location.trim() === '' || location.trim() === 'TBA') {
    return { type: 'emoji', emoji: '🌍' }
  }
  if (location.toLowerCase().includes("online")) {
    return { type: 'emoji', emoji: '💻' }
  }

  // Try each comma-separated part, last to first (country is usually last)
  const parts = location.split(",").map((part) => part.trim())
  for (let i = parts.length - 1; i >= 0; i--) {
    const code = findCountryCode(parts[i])
    if (code) return { type: 'code', code }
  }

  // Fall back to searching the entire string
  const code = findCountryCode(location)
  if (code) return { type: 'code', code }

  return { type: 'emoji', emoji: '🌍' }
}
