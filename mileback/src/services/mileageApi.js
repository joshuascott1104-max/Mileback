/**
 * Mileage Calculation Service — MileBack
 * ---
 * Uses the same free, no-API-key approach from WYT Express:
 *   1. postcodes.io   → converts UK postcode to lat/lon (free, no key)
 *   2. OSRM           → calculates actual driving distance in miles (free, no key)
 *
 * Falls back gracefully to manual entry if either service is unavailable.
 *
 * To swap in a premium provider later (Google Maps, Mapbox etc.),
 * add your key to .env and uncomment the relevant function below.
 */

// ── PRIMARY: postcodes.io + OSRM (free, no key required) ─────────────────

async function geocodePostcode(postcode) {
  const clean = postcode.replace(/\s+/g, '').toUpperCase()
  const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`)
  if (!res.ok) throw new Error(`Postcode not found: ${postcode}`)
  const data = await res.json()
  if (data.status !== 200 || !data.result) throw new Error(`Invalid postcode: ${postcode}`)
  return { lat: data.result.latitude, lon: data.result.longitude }
}

async function calculateWithOSRM(startPostcode, endPostcode) {
  const [start, end] = await Promise.all([
    geocodePostcode(startPostcode),
    geocodePostcode(endPostcode),
  ])

  const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
  const res = await fetch(url)
  const data = await res.json()

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error('Route not found')
  }

  const metres = data.routes[0].distance
  const miles = Math.round((metres / 1000) * 0.621371 * 10) / 10 // 1dp
  return miles
}

// ── OPTIONAL: Google Maps Distance Matrix API ─────────────────────────────
// Add VITE_GOOGLE_MAPS_API_KEY to .env to enable
// Docs: https://developers.google.com/maps/documentation/distance-matrix
async function calculateWithGoogleMaps(startPostcode, endPostcode) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('No Google Maps API key')
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(startPostcode + ', UK')}&destinations=${encodeURIComponent(endPostcode + ', UK')}&units=imperial&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  const metres = data.rows?.[0]?.elements?.[0]?.distance?.value
  if (!metres) throw new Error('No distance returned')
  return Math.round((metres / 1609.344) * 10) / 10
}

// ── OPTIONAL: OpenRouteService ────────────────────────────────────────────
// Add VITE_ORS_API_KEY to .env to enable
// Docs: https://openrouteservice.org/dev/#/api-docs
async function calculateWithORS(startPostcode, endPostcode) {
  const apiKey = import.meta.env.VITE_ORS_API_KEY
  if (!apiKey) throw new Error('No ORS API key')
  const [start, end] = await Promise.all([
    geocodePostcode(startPostcode),
    geocodePostcode(endPostcode),
  ])
  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`
  )
  const data = await res.json()
  const metres = data.features?.[0]?.properties?.segments?.[0]?.distance
  if (!metres) throw new Error('No route found')
  return Math.round((metres / 1609.344) * 10) / 10
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────

/**
 * Calculate driving distance between two UK postcodes.
 * Returns miles (1 decimal place).
 * Tries providers in order — first success wins.
 * @param {string} startPostcode  e.g. "LS1 1BA"
 * @param {string} endPostcode    e.g. "M1 1AE"
 * @returns {Promise<number>} miles
 */
export async function calculateMileage(startPostcode, endPostcode) {
  // Always try the free OSRM route first (no key needed)
  // If you add a Google Maps or ORS key, add those functions to this array
  const providers = [
    calculateWithOSRM,
    ...(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? [calculateWithGoogleMaps] : []),
    ...(import.meta.env.VITE_ORS_API_KEY ? [calculateWithORS] : []),
  ]

  for (const fn of providers) {
    try {
      return await fn(startPostcode, endPostcode)
    } catch (err) {
      console.warn('Mileage provider failed:', err.message)
    }
  }

  throw new Error('Could not calculate mileage automatically. Please enter miles manually.')
}

/**
 * Always true now — OSRM/postcodes.io work with no config.
 * Kept for backwards compat with any UI that checks this.
 */
export const isApiConfigured = () => true
