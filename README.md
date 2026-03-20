# DebateComps

The home for competitive debate. Discover upcoming debate tournaments from around the world with a modern, intuitive interface.

**Live at:** [debatecomps.com](https://debatecomps.com)

## About

DebateComps is a curated tournament discovery platform for the global debate community. Whether you're a debater looking for your next competition, an adjudicator searching for judging opportunities, or an organizer promoting your tournament, DebateComps makes it easy to find and share debate competitions.

Data is sourced from multiple community-managed Google Sheets:

- [Global Debating Spreadsheet (GDS)](https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o) - International tournaments
- [CUSID University Schedule](https://docs.google.com/spreadsheets/d/1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY) - Canadian tournaments
- [Indian Debating Spreadsheet (IDS)](https://docs.google.com/spreadsheets/d/1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg) - Indian tournaments

## Features

- 🌍 **Multi-Source Tournament Directory** - Browse tournaments from Global, Canada, and India sources via a config-driven architecture
- 🏳️ **Country Toggle** - Switch between sources using the header dropdown with SVG flag icons
- 📅 **Dual View Modes** - Switch between grid and calendar views
- 🔍 **Advanced Filtering** - Filter by location (online/in-person), format, team cap, category, timezone proximity, and more
- ⏪ **Past Tournaments** - Collapsible section for past tournaments with automatic date-based splitting
- 🔄 **Live Data** - Auto-updates from multiple community-managed spreadsheets
- 💾 **Save Tournaments** - Bookmark tournaments across all sources; saved page fetches and deduplicates from every source
- 🌙 **Dark Mode** - Complete dark mode support with theme persistence
- ⚡ **Smart Caching** - 1-hour server caching for optimal performance
- 📱 **Mobile Responsive** - Fully responsive design for all devices
- 🔄 **Manual Refresh** - One-click refresh to bypass cache when needed

## How It Works

### Architecture

The app uses a **config-driven** approach to multi-source tournament fetching. Each data source (Global, Canada, India) is defined as a `SourceConfig` object in `src/lib/sources.ts` that specifies:

- Google Sheet ID and range formulas (with dynamic year derivation)
- Header detection strategy and column-to-field mapping
- Field transforms, defaults, and post-processing hooks
- Category color mappings for row classification
- Optional stateful iteration (e.g., Canada's month-header rows)

A single `fetchTournaments(sourceId)` function in `src/lib/fetch-tournaments.ts` handles all sources via these configs, eliminating per-source route files.

### Data Flow

1. **Config-Driven Sources** - Each source is a `SourceConfig` in `src/lib/sources.ts` pointing to a community-managed Google Sheet
2. **Unified API** - `GET /api/tournaments?source=global|india|canada` dispatches to the shared fetch logic
3. **Smart Caching** - Responses are cached for 1 hour (`s-maxage=3600, stale-while-revalidate=86400`)
4. **Dynamic Routing** - `src/app/[source]/page.tsx` renders the shared `TournamentsPage` component for each source
5. **Past/Upcoming Split** - Tournaments are automatically split into upcoming and past sections based on end dates

### Adding a Tournament

To add a tournament to DebateComps:

1. Open the appropriate spreadsheet (GDS for global, CUSID for Canada, IDS for India)
2. Find the appropriate year tab (dynamically fetches current and next year)
3. Fill in tournament information following the existing format in that sheet
4. Click the refresh button on DebateComps to see your tournament immediately (or wait up to 1 hour)

### Adding a New Source

To add a new regional source (e.g., UK tournaments):

1. Add a new `SourceConfig` in `src/lib/sources.ts` with the sheet ID, column mappings, and any field transforms
2. Add it to `SOURCE_CONFIGS` and `SOURCE_LIST`
3. No new route files or API changes needed -- the existing `/api/tournaments?source=<id>` and `[source]/page.tsx` handle it automatically

### Cache Behavior

- **Default**: Data is cached for 1 hour on the server
- **Manual Refresh**: Click the refresh icon to bypass cache and fetch latest data immediately
- **Stale-While-Revalidate**: After 1 hour, the cache refreshes in the background for seamless updates

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Calendar**: [React Big Calendar](https://jqueueuewith.github.io/react-big-calendar)
- **Icons**: [Lucide React](https://lucide.dev)
- **Flags**: [flag-icons](https://flagicons.lipis.dev) (SVG country flags)
- **Data Source**: [Google Sheets API](https://developers.google.com/sheets/api)
- **Linting**: [Biome](https://biomejs.dev)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/debatecomps.git
cd debatecomps

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SHEETS_API_KEY to .env.local
```

### Running Locally

```bash
# Start development server with Turbopack
npm run dev

# Open http://localhost:3000 in your browser
```

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
# Lint and format code
npm run lint
npm run format
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (renders TournamentsPage with source="global")
│   ├── [source]/page.tsx     # Dynamic source routes (/india, /canada)
│   ├── about/page.tsx        # About page
│   ├── saved/page.tsx        # Saved tournaments (multi-source fetch + dedup)
│   ├── api/tournaments/route.ts  # Unified API endpoint (?source=global|india|canada)
│   ├── layout.tsx            # Root layout with theme provider
│   └── globals.css           # Global styles and theme
├── components/
│   ├── custom/
│   │   ├── tournaments-page.tsx   # Shared page component for all sources
│   │   ├── site-header.tsx        # Header with logo, nav, and country toggle
│   │   ├── country-toggle.tsx     # Source switcher dropdown with flag icons
│   │   ├── search-filter-bar.tsx  # Search and filter controls
│   │   ├── event-card.tsx         # Tournament card component
│   │   ├── past-section.tsx       # Collapsible past tournaments section
│   │   ├── calendar-view.tsx      # Calendar view component
│   │   ├── footer.tsx             # Footer with source attribution links
│   │   └── theme-toggle.tsx       # Dark mode toggle
│   └── ui/                   # Radix UI component wrappers
├── lib/
│   ├── sources.ts            # Source configs (sheet IDs, header maps, transforms)
│   ├── fetch-tournaments.ts  # Config-driven Google Sheets fetcher
│   ├── sheets.ts             # Shared Sheets API cell extraction helpers
│   ├── use-past-upcoming.ts  # Hook to split tournaments by date
│   ├── theme-provider.tsx    # Dark mode context and logic
│   ├── utils.ts              # Utility functions
│   └── ...                   # Other utilities (timezone, calendar-export, etc.)
└── types/
    └── tournament.ts         # TypeScript types
```

## Environment Variables

```
SHEETS_API_KEY=your_google_sheets_api_key
```

## Contributing

DebateComps is built by and for the debate community. Contributions are welcome!

- **Found a bug?** Open an issue
- **Have a feature idea?** Start a discussion
- **Want to improve the code?** Submit a pull request

## Features in Detail

### Grid View
Browse tournaments in a card-based grid with essential information at a glance. Click any tournament card to see full details.

### Calendar View
Visualize tournaments on a calendar. Available in month, week, day, and agenda views. Color-coded by type (online/in-person).

### Search & Filter
- **Search** by tournament name or location
- **Filter** by format (BP, AP, Other)
- **Filter** by type (online/in-person)
- **Filter** by category (Premier Regional, Large, WUDC)
- **Filter** by timezone proximity (same, close, far)
- **Filter** by team capacity range
- **One-day only** toggle

### Save Tournaments
Bookmark tournaments for later. The saved page fetches from all sources and deduplicates by competition name and date. Tournaments are stored locally in your browser.

### Past Tournaments
Tournaments whose end date has passed are automatically moved to a collapsible "Past" section at the bottom of both the main page and saved page.

### Dark Mode
Toggle between light and dark themes. Your preference is saved automatically.

## Performance

- **Smart Caching**: 1-hour server-side caching reduces API calls
- **Optimized Images**: Next.js Image optimization for logo and assets
- **Vercel Deployment**: Global CDN for fast content delivery
- **Code Splitting**: Automatic code splitting for optimal page loads

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available under the MIT License.

## Credits

- **Creators**: Alex Zhu, Aditya Keerthi, Barton Lu, Advait Sangle, Acon Lin
- **Data Management**: Senkai Hsia and Claire Beamer (Global Debating Spreadsheet)
- **Community**: The global debate community for tournament data and feedback

## Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Reach out to Alex on Facebook or Discord

---

Made with ❤️ for the debate community
