import { useState, useEffect } from 'react'
import bundled from '../data/matches.json'

// Tries the live endpoint (/api/matches → real WC fixtures via serverless proxy).
// Falls back to the bundled schedule when the endpoint is unavailable
// (local dev, no API key, network error) so the app always works.
export function useMatches() {
  const [matches, setMatches] = useState(bundled)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/matches')
        if (!res.ok) return
        const data = await res.json()
        if (alive && Array.isArray(data) && data.length) setMatches(data)
      } catch (_) {
        /* keep bundled fallback */
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000) // refresh live scores every 5 min
    return () => { alive = false; clearInterval(id) }
  }, [])

  return matches
}
