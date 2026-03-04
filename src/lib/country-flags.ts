// Mapping of country names to their flag emojis
const countryFlags: Record<string, string> = {
    // Asia
    India: "🇮🇳",
    China: "🇨🇳",
    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    Thailand: "🇹🇭",
    Vietnam: "🇻🇳",
    Singapore: "🇸🇬",
    Malaysia: "🇲🇾",
    Indonesia: "🇮🇩",
    Philippines: "🇵🇭",
    Pakistan: "🇵🇰",
    Bangladesh: "🇧🇩",
    "Sri Lanka": "🇱🇰",
    Nepal: "🇳🇵",
    Myanmar: "🇲🇲",
    Cambodia: "🇰🇭",
    Laos: "🇱🇦",
    Taiwan: "🇹🇼",
    "Hong Kong": "🇭🇰",
    Macau: "🇲🇴",
  
    // Europe
    "United Kingdom": "🇬🇧",
    UK: "🇬🇧",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    France: "🇫🇷",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Portugal: "🇵🇹",
    Netherlands: "🇳🇱",
    Belgium: "🇧🇪",
    Switzerland: "🇨🇭",
    Austria: "🇦🇹",
    Poland: "🇵🇱",
    Czechia: "🇨🇿",
    Hungary: "🇭🇺",
    Romania: "🇷🇴",
    Greece: "🇬🇷",
    Sweden: "🇸🇪",
    Norway: "🇳🇴",
    Denmark: "🇩🇰",
    Finland: "🇫🇮",
    Ireland: "🇮🇪",
    Russia: "🇷🇺",
    Latvia: "🇱🇻",
    Lithuania: "🇱🇹",
    Estonia: "🇪🇪",
    Slovakia: "🇸🇰",
    Slovenia: "🇸🇮",
    Croatia: "🇭🇷",
    Montenegro: "🇲🇪",
    Serbia: "🇷🇸",
  
    // Americas
    "United States": "🇺🇸",
    USA: "🇺🇸",
    US: "🇺🇸",
    Canada: "🇨🇦",
    Mexico: "🇲🇽",
    Brazil: "🇧🇷",
    Argentina: "🇦🇷",
    Chile: "🇨🇱",
    Colombia: "🇨🇴",
    Peru: "🇵🇪",
    Venezuela: "🇻🇪",
  
    // Oceania
    Australia: "🇦🇺",
    "New Zealand": "🇳🇿",
  
    // Middle East
    UAE: "🇦🇪",
    "Saudi Arabia": "🇸🇦",
    Israel: "🇮🇱",
    Turkey: "🇹🇷",
    Iran: "🇮🇷",
  
    // Africa
    "South Africa": "🇿🇦",
    Egypt: "🇪🇬",
    Nigeria: "🇳🇬",
    Kenya: "🇰🇪",
    Morocco: "🇲🇦",
  }
  
  export function getCountryFlag(location: string): string {
    if (!location) return "🌍"
    // Check if location contains "online" (case insensitive)
    if (location.toLowerCase().includes("online")) {
      return "💻"
    }
  
    // Extract country from location string (usually the last part after comma)
    const parts = location.split(",").map((part) => part.trim())
    const country = parts[parts.length - 1]
  
    // Look up the country flag
    return countryFlags[country] || "🌍"
  }
  