# MileBack

A fast, mobile-first mileage and expenses tracker for professionals on the move.

## Getting Started

```bash
npm install
npm run dev
```

## Setup

1. Copy `.env.example` to `.env`
2. Optionally add a mileage API key (Google Maps, ORS, or Mapbox) for auto-calculation
3. Without an API key, manual mileage entry works perfectly

## Deploying to Vercel

```bash
npm run build
# Push to GitHub, then import to Vercel — zero config needed
```

Or with Vercel CLI:
```bash
npx vercel
```

## Folder Structure

```
src/
├── components/
│   ├── layout/       # BottomNav
│   ├── dashboard/    # Dashboard overview
│   ├── mileage/      # MileageList, MileageForm
│   ├── expenses/     # ExpenseList, ExpenseForm
│   ├── reports/      # Reports + export
│   ├── settings/     # Settings, vehicles
│   └── ui/           # StatusBadge, Modal, EmptyState
├── hooks/            # useLocalStorage
├── services/         # mileageApi.js, exportService.js
├── store/            # AppContext (swap for Supabase later)
├── utils/            # formatters, calculators
└── data/             # demo seed data
```

## Adding a Database Later

The entire data layer lives in `src/store/AppContext.jsx` and `src/hooks/useLocalStorage.js`.
To migrate to Supabase:
1. Replace `useLocalStorage` calls with Supabase queries
2. Update CRUD functions to hit your API
3. Add auth wrapper around `AppProvider`

## Mileage API

See `src/services/mileageApi.js` — supports Google Maps, OpenRouteService, and Mapbox.
Add your key to `.env` and the Calculate button will auto-populate miles from postcodes.
