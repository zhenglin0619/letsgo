# Foodprint

A travel memory app for documenting dining experiences and hotel stays across your trips. Log restaurants, dishes, and hotels, visualize your journeys on an interactive globe, and share trips with collaborators.

## Features

- **Trip management** — Create trips with cover photos and country tags; add dining and hotel entries to each
- **Restaurant logging** — Track restaurants with dishes, ratings, Michelin stars, and photos
- **Hotel logging** — Record hotel stays with room details and check-in/out dates
- **World map dashboard** — Visualize all your trips on a 3D interactive globe
- **Photo uploads** — Drag-and-drop with HEIC support and EXIF metadata extraction
- **Collaborator sharing** — Invite others to view or contribute to a trip
- **Demo mode** — Explore the app with mock data before signing in

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Backend** — Supabase (PostgreSQL + Auth + Storage)
- **Maps** — Leaflet, Mapbox GL, Google Maps API, react-globe.gl
- **UI** — Tailwind CSS v4, Radix UI, Framer Motion, Lucide icons
- **Image handling** — react-dropzone, heic2any, exif-js

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
  app/           # Next.js routes (/, /trips, /trips/[id], /restaurants, /hotels)
  components/    # Feature components (auth, dashboard, dining, hotel, trip, upload, ui)
  store/         # Global state via React Context + mock data for demo mode
  utils/         # Supabase client and data converters (camelCase ↔ snake_case)
```
