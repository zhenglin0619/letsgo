# Let's Go — Travel Journal

A premium personal travel journal for documenting your dining experiences, hotel stays, and trips across the world. Log memories, visualize your footprint on an interactive globe, and share journeys with collaborators.

---

## Features

- **World Map Dashboard** — Visualize every trip on a 3D interactive globe with location pins
- **Trip Management** — Create trips with cover photos, country tags, and nested dining/hotel entries
- **Restaurant Logging** — Track restaurants with dishes, ratings, Michelin stars, cuisine, and photos
- **Hotel Logging** — Record hotel stays with room details, price per night, and check-in/out dates
- **Photo Uploads** — Drag-and-drop upload with HEIC support and EXIF metadata extraction
- **Collaborators** — Invite others to view and contribute to your trips and individual logs
- **Future Plans** — Keep a wishlist of upcoming trips, dining, and hotel ideas
- **Demo Mode** — Explore the full app with sample data, no sign-in required
- **Night Mode** — Full dark theme across the entire app
- **What's New** — In-app changelog modal for feature announcements
- **Privacy & Terms** — Built-in Privacy Policy and Terms of Service pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS v4, Framer Motion |
| Maps | Leaflet, Mapbox GL, Google Maps API, react-globe.gl |
| Icons | Lucide React |
| Image handling | react-dropzone, heic2any, exif-js |
| UI Primitives | Radix UI |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd letsgo
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_CARTO_API_KEY=
```

Set `NEXT_PUBLIC_CARTO_API_KEY` to your CARTO Basemaps key for the dashboard,
trip map, and inline map previews. Restart the development server after changing
it. For a deployed site, set the variable in your hosting environment and rebuild
and redeploy; Next.js embeds public environment variables at build time.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js routes
│   ├── page.tsx            # World map dashboard
│   ├── trips/              # Trip list + trip detail ([id])
│   ├── restaurants/        # Restaurant log
│   ├── hotels/             # Hotel log
│   ├── privacy/            # Privacy Policy page
│   └── terms/              # Terms of Service page
├── components/
│   ├── auth/               # Auth modal (Google + email sign-in)
│   ├── dashboard/          # World map, stats bento
│   ├── dining/             # Restaurant cards and detail drawer
│   ├── hotel/              # Hotel cards and detail drawer
│   ├── layout/             # Navbar, FAB, RootShell
│   ├── trip/               # Trip cards, detail, timeline
│   ├── ui/                 # Shared modals (Settings, Collaborators, Future Plans, What's New)
│   └── upload/             # Add trip/restaurant/hotel modals
├── store/
│   ├── tripsContext.tsx    # Global state, demo mode, collaborator sync
│   └── data.ts             # Demo data
└── lib/
    ├── supabase.ts         # Supabase client
    ├── formatUtils.ts      # Date and country formatting helpers
    └── imageUtils.ts       # Photo upload and storage utilities
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Built with love by CX & ZW — Version 1.0.1
