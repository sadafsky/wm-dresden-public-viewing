import { useState, useEffect } from 'react'
import venuesRaw from '../data/venues.json'
import { getCached, geocodeAddress } from '../utils/geocode'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function useVenues() {
  // Venues with coordinates in JSON are available immediately — no network needed
  const [venues, setVenues] = useState(
    venuesRaw.filter((v) => v.coordinates)
  )
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    // Only geocode venues that have no coordinates in the JSON
    const needsGeocode = venuesRaw.filter((v) => !v.coordinates)
    if (!needsGeocode.length) return

    async function load() {
      // Show any cached results immediately
      const cached = needsGeocode
        .map((v) => {
          const coords = getCached(v.address)
          return coords ? { ...v, coordinates: coords } : null
        })
        .filter(Boolean)
      if (cached.length) {
        setVenues((prev) => [...prev, ...cached])
      }

      // Geocode the rest sequentially (Nominatim: max 1 req/sec)
      const uncached = needsGeocode.filter((v) => !getCached(v.address))
      if (!uncached.length) return

      setGeocoding(true)
      for (let i = 0; i < uncached.length; i++) {
        if (i > 0) await sleep(1100)
        try {
          const coords = await geocodeAddress(uncached[i].address)
          setVenues((prev) => {
            if (prev.find((v) => v.id === uncached[i].id)) return prev
            return [...prev, { ...uncached[i], coordinates: coords }]
          })
        } catch (err) {
          console.warn(`Geocode failed for "${uncached[i].name}":`, err.message)
        }
      }
      setGeocoding(false)
    }

    load()
  }, [])

  return { venues, geocoding }
}
