# DebateComps

The home for competitive debate. Discover upcoming debate tournaments from around the world with a modern, intuitive interface.

**Live at:** [debatecomps.com](https://debatecomps.com)

## About

DebateComps is a curated tournament discovery platform for the global debate community. Whether you're a debater looking for your next competition, an adjudicator searching for judging opportunities, or an organizer promoting your tournament, DebateComps makes it easy to find and share debate competitions.

Data is sourced directly from the [Global Debating Spreadsheet](https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o), ensuring tournaments are current and community-managed.

## Features

- 🌍 **Global Tournament Directory** - Browse tournaments from around the world
- 📅 **Dual View Modes** - Switch between grid and calendar views
- 🔍 **Advanced Filtering** - Filter by location (online/in-person), format, team cap, and more
- 🔄 **Live Data** - Auto-updates from the Global Debating Spreadsheet
- 💾 **Save Tournaments** - Bookmark tournaments you're interested in
- 🌙 **Dark Mode** - Complete dark mode support with theme persistence
- ⚡ **Smart Caching** - 1-hour server caching for optimal performance
- 📱 **Mobile Responsive** - Fully responsive design for all devices
- 🔄 **Manual Refresh** - One-click refresh to bypass cache when needed

## How It Works

### Data Flow

1. **Google Sheets Integration** - Tournament data lives in the [Global Debating Spreadsheet](https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o)
2. **API Fetch** - The app fetches data via Google Sheets API (`/api/tournaments`)
3. **Smart Caching** - Responses are cached for 1 hour to reduce API calls
4. **Display** - Data is rendered in grid or calendar format with filters applied

### Adding a Tournament

To add a tournament to DebateComps:

1. Open the [Global Debating Spreadsheet](https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o)
2. Find the appropriate year tab (dynamically fetches current and next year)
3. Fill in tournament information following the existing format:
   - Competition Name
   - Online/In Person
   - Format (e.g., BP, AP)
   - Date
   - Timezone
   - Registration Link
   - Judge Rule
   - Fees
   - Profit Status
   - Team Cap
   - Info Link

4. Click the refresh button on DebateComps to see your tournament immediately (or wait up to 1 hour)

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
- **Data Source**: [Google Sheets API](https://developers.google.com/sheets/api)
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
│   ├── page.tsx              # Home page with grid/calendar views
│   ├── about/page.tsx        # About page
│   ├── saved/page.tsx        # Saved tournaments page
│   ├── api/tournaments/route.ts  # Google Sheets API integration
│   ├── layout.tsx            # Root layout with theme provider
│   └── globals.css           # Global styles and theme
├── components/
│   ├── custom/
│   │   ├── site-header.tsx   # Header with logo and nav
│   │   ├── footer.tsx        # Footer
│   │   ├── search-filter-bar.tsx  # Search and filter controls
│   │   ├── event-card.tsx    # Tournament card component
│   │   ├── calendar-view.tsx # Calendar view component
│   │   └── theme-toggle.tsx  # Dark mode toggle
│   └── ui/                   # Radix UI component wrappers
├── lib/
│   ├── theme-provider.tsx    # Dark mode context and logic
│   ├── utils.ts              # Utility functions
│   └── ...                   # Other utilities
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
- **Filter** by format (BP, AP, etc.)
- **Filter** by type (online/in-person)
- **Filter** by team capacity range

### Save Tournaments
Bookmark tournaments for later. Your saved tournaments are stored locally in your browser.

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

- **Creators**: Alex Zhu, Aditya Keerthi, Barton Lu
- **Data Management**: Senkai Hsia and Claire Beamer (Global Debating Spreadsheet)
- **Community**: The global debate community for tournament data and feedback

## Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact the team through [probablyalex.com](https://probablyalex.com)
- Reach out on social media

---

Made with ❤️ for the debate community
