# Let's Go — Travel Journal

A premium personal travel journal for documenting your dining experiences, hotel stays, and trips across the world. Log memories, visualize your footprint on an interactive globe, and share journeys with collaborators.

---

## Features

- **World Map Dashboard** — Visualize every trip on a 3D interactive globe with location pins
- **Trip Management** — Create trips with cover photos, country tags, and nested dining/hotel entries
- **Restaurant Logging** — Track restaurants with dishes, ratings, Michelin stars, and photos
- **Hotel Logging** — Record hotel stays with room details and check-in/out dates
- **Photo Uploads** — Drag-and-drop upload with HEIC support and EXIF metadata extraction
- **Collaborators** — Invite others to view and contribute to your trips
- **Future Plans** — Keep a wishlist of upcoming trips, dining, and hotel ideas
- **Demo Mode** — Explore the full app with sample data, no sign-in required
- **Night Mode** — Full dark theme across the entire app
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
cd foodprint
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

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
│   ├── dining/             # Restaurant cards and detail views
│   ├── hotel/              # Hotel cards and detail views
│   ├── layout/             # Navbar, FAB, RootShell
│   ├── trip/               # Trip cards, detail, timeline
│   ├── ui/                 # Shared modals (Settings, Collaborators, Future Plans)
│   └── upload/             # Add trip/restaurant/hotel modals
├── store/
│   └── tripsContext.tsx    # Global state, demo mode, collaborator sync
└── lib/
    └── supabase.ts         # Supabase client
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
