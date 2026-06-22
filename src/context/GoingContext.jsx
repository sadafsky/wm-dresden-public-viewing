import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const KEY = 'wm_going_v2' // schema bumped: now per match+venue
const Ctx = createContext(null)

function berlinDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// Which (match+venue) pairs this device marked today — stored as "matchId::venueId".
// Resets each matchday.
function loadGoing() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (raw.date === berlinDate()) return new Set(raw.ids || [])
  } catch (_) {}
  return new Set()
}
function saveGoing(set) {
  try { localStorage.setItem(KEY, JSON.stringify({ date: berlinDate(), ids: [...set] })) } catch (_) {}
}

export function GoingProvider({ children }) {
  // Which match the map is currently "heated" for
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  // Per-match counts cache: { [matchId]: { [venueId]: n } }
  const [countsByMatch, setCountsByMatch] = useState({})
  // Composite "matchId::venueId" entries this device tapped
  const [goingSet, setGoingSet] = useState(loadGoing)

  const counts = countsByMatch[selectedMatchId] || {}

  const fetchCounts = useCallback(async (matchId) => {
    if (!matchId) return
    try {
      const res = await fetch(`/api/going?match=${encodeURIComponent(matchId)}`)
      if (!res.ok) return
      const data = await res.json()
      if (data && typeof data === 'object') {
        setCountsByMatch((m) => ({ ...m, [matchId]: data }))
      }
    } catch (_) {}
  }, [])

  // Refetch whenever the selected match changes; keep it fresh every 60s.
  useEffect(() => {
    if (!selectedMatchId) return
    fetchCounts(selectedMatchId)
    const id = setInterval(() => fetchCounts(selectedMatchId), 60000)
    return () => clearInterval(id)
  }, [selectedMatchId, fetchCounts])

  // Venues this device is going to FOR THE SELECTED MATCH
  const going = useMemo(() => {
    const s = new Set()
    if (!selectedMatchId) return s
    const prefix = `${selectedMatchId}::`
    for (const k of goingSet) if (k.startsWith(prefix)) s.add(k.slice(prefix.length))
    return s
  }, [goingSet, selectedMatchId])

  const toggleGoing = useCallback((venueId) => {
    if (!selectedMatchId) return
    const composite = `${selectedMatchId}::${venueId}`
    setGoingSet((g) => {
      const isGoing = g.has(composite)
      const delta = isGoing ? -1 : 1
      // optimistic count update for the selected match
      setCountsByMatch((cm) => {
        const cur = cm[selectedMatchId] || {}
        return { ...cm, [selectedMatchId]: { ...cur, [venueId]: Math.max(0, (cur[venueId] || 0) + delta) } }
      })
      const next = new Set(g)
      if (isGoing) next.delete(composite); else next.add(composite)
      saveGoing(next)
      fetch('/api/going', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: venueId, match: selectedMatchId, delta }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d === 'object' && Object.keys(d).length) {
            setCountsByMatch((cm) => ({ ...cm, [selectedMatchId]: d }))
          }
        })
        .catch(() => {})
      return next
    })
  }, [selectedMatchId])

  return (
    <Ctx.Provider value={{ counts, going, toggleGoing, selectedMatchId, setSelectedMatchId }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGoing() {
  return (
    useContext(Ctx) || {
      counts: {}, going: new Set(), toggleGoing: () => {},
      selectedMatchId: null, setSelectedMatchId: () => {},
    }
  )
}
