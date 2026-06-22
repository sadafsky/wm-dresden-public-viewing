import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const KEY = 'wm_going_v1'
const Ctx = createContext(null)

function berlinDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// Which venues this device marked today (resets each matchday)
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
  const [counts, setCounts] = useState({})
  const [going, setGoing] = useState(loadGoing)

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/going')
      if (!res.ok) return
      const data = await res.json()
      if (data && typeof data === 'object') setCounts(data)
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchCounts()
    const id = setInterval(fetchCounts, 60000)
    return () => clearInterval(id)
  }, [fetchCounts])

  const toggleGoing = useCallback((venueId) => {
    setGoing((g) => {
      const isGoing = g.has(venueId)
      const delta = isGoing ? -1 : 1
      // optimistic count update
      setCounts((c) => ({ ...c, [venueId]: Math.max(0, (c[venueId] || 0) + delta) }))
      const next = new Set(g)
      if (isGoing) next.delete(venueId); else next.add(venueId)
      saveGoing(next)
      fetch('/api/going', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: venueId, delta }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && typeof d === 'object' && Object.keys(d).length) setCounts(d) })
        .catch(() => {})
      return next
    })
  }, [])

  return <Ctx.Provider value={{ counts, going, toggleGoing }}>{children}</Ctx.Provider>
}

export function useGoing() {
  return useContext(Ctx) || { counts: {}, going: new Set(), toggleGoing: () => {} }
}
