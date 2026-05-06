# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (hot reload)
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test runner is configured.

## Architecture

### Stack
React 18 + Vite 5, Tailwind CSS 3, react-router-dom 6, date-fns 3, lucide-react icons, papaparse (CSV), vite-plugin-pwa. No backend — fully offline-first with all data in `localStorage`.

### Repo layout
All deployable source lives in `mileback/`. The repo root only contains `.gitignore` and `package-lock.json`. Vercel's root directory is set to `mileback/`.

### State & persistence
Single React Context in `src/store/AppContext.jsx` wraps the entire app. All state is persisted via the `useLocalStorage` hook (`src/hooks/useLocalStorage.js`), which accepts either a value or updater function.

| localStorage key | Stores |
|---|---|
| `mileback_mileage` | mileageClaims array |
| `mileback_expenses` | expenses array |
| `mileback_vehicles` | vehicles array |
| `mileback_settings` | settings object |
| `mileback_favourites` | favouriteJourneys array |

IDs are generated as `{prefix}${Date.now()}` (e.g. `m1234`, `e1234`, `v1234`, `fj1234`).

All context actions (`addMileageClaim`, `updateMileageClaim`, `deleteMileageClaim`, `addExpense`, `updateExpense`, `deleteExpense`, `addVehicle`, `updateVehicle`, `deleteVehicle`, `setDefaultVehicle`, `addFavouriteJourney`, `deleteFavouriteJourney`, `setSettings`, `restoreBackup`) are consumed via `useApp()`.

### Routing
`src/App.jsx` defines all routes. Layout wraps every route with a fixed bottom nav (`src/components/layout/BottomNav.jsx`) and max-width 512px container.

| Route | Component |
|---|---|
| `/` | Dashboard |
| `/mileage` | MileageList |
| `/mileage/add` | MileageForm |
| `/mileage/edit/:id` | MileageForm |
| `/expenses` | ExpenseList |
| `/expenses/add` | ExpenseForm |
| `/expenses/edit/:id` | ExpenseForm |
| `/reports` | Reports |
| `/settings` | Settings |

### Data shapes

**Mileage claim:**
```js
{ id, date, vehicleId, vehicleName, startPostcode, endPostcode,
  startLocationName, endLocationName, reason, miles, rate,
  odometerStart, odometerEnd, returnJourney, notes,
  status: 'draft'|'submitted'|'paid', total }
```
`total` is pre-calculated (`calcMileageTotal` from formatters) and stored — not derived at render time.

**Expense:**
```js
{ id, date, category, supplier, description, amount, vat, notes,
  receiptImage, status: 'draft'|'submitted'|'paid' }
```
`receiptImage` is a base64 data URL (canvas-compressed JPEG, max 1200px, 70% quality).

**Vehicle:** `{ id, name, registration, defaultRate, isDefault }`

**Settings:** `{ userName, companyName, standardRate, defaultVehicleId, exportFormat, lastExpenseCategory }`

**Favourite journey:** `{ id, name, startPostcode, endPostcode, startName, endName }`

### Services
- `src/services/mileageApi.js` — distance calculation. Tries postcodes.io + OSRM (free, no key) first, then optional Google Maps (`VITE_GOOGLE_MAPS_API_KEY`) and ORS (`VITE_ORS_API_KEY`). Exported: `calculateMileage(start, end)`, `isApiConfigured()`.
- `src/services/exportService.js` — `exportToCSV(mileageClaims, expenses)` and `copyToClipboard(mileageClaims, expenses)`.
- `src/services/backupService.js` — `exportBackup(data)` downloads JSON file; `readBackupFile(file)` parses and validates.

### Utilities
`src/utils/formatters.js` is the primary utility file:
- `formatCurrency(n)` → `£X.XX`
- `formatDate(str)` → `d MMM yyyy`
- `formatMiles(n)` → `X.X mi`
- `calcMileageTotal(miles, rate, returnJourney)` → number (doubles miles if return)
- `getFinancialSummary(mileageClaims, expenses)` → `{ owed, draft, submitted, paid }`
- `getMonthClaims(mileageClaims, expenses)` → current-month stats
- `EXPENSE_CATEGORIES` — array of 8 strings
- `STATUS_LABELS` — `{ draft, submitted, paid }`

### Styling conventions
Custom Tailwind tokens — always use these rather than arbitrary values:

**Brand (sky blue):** `brand-400` `brand-500` `brand-600`  
**Surface (dark neutrals):** `surface-300` `surface-400` `surface-700` `surface-800` `surface-900` `surface-950`

CSS utility classes defined in `src/index.css`:
- `.card` — `bg-surface-900 border border-surface-800 rounded-2xl`
- `.input-base` — standard form input (full width, surface-800 bg, focus ring)
- `.label-base` — uppercase xs label above inputs
- `.btn-primary` — brand-500 filled button
- `.btn-secondary` — surface-800 outlined button
- `.btn-ghost` — text-only button
- `.status-draft` / `.status-submitted` / `.status-paid` — coloured pill badges

### UI patterns
- **Forms** use a `fixed bottom-16 z-50` footer for action buttons (sits above the `z-40` bottom nav which is 64px tall — hence `bottom-16`). Page content needs `pb-52` or `pb-44` to avoid being hidden behind it.
- **StatusBadge** (`src/components/ui/StatusBadge.jsx`) accepts an optional `onClick` prop; when provided renders as a `<button>` that cycles `draft→submitted→paid→draft`.
- **Swipe-to-delete** on list rows uses `onTouchStart`/`onTouchEnd` with a >60px threshold to reveal a red delete button via `translateX(-80px)`.
- Odometer readings are the primary mileage input method. When both `odometerStart` and `odometerEnd` are filled, miles are auto-calculated and the return journey toggle is disabled.
