const pad = (n) => String(n).padStart(2, '0')
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const matchStart = (m) => new Date(`${m.date}T${m.time}:00`)

const FULL_MS = 115 * 60000

export function matchStatus(m, now = new Date()) {
  if (m.status === 'finished') return { state: 'finished', minute: 90 }
  if (m.status === 'live') return { state: 'live', minute: m.minute ?? 1 }
  const start = matchStart(m)
  const diff = now - start
  if (diff < 0) return { state: 'upcoming', minute: 0 }
  if (diff > FULL_MS) return { state: 'finished', minute: 90 }
  const minute = Math.min(95, Math.max(1, Math.floor(diff / 60000)))
  return { state: 'live', minute }
}

export function todayMatches(matches = [], now = new Date()) {
  const today = isoDate(now)
  return matches
    .filter((m) => m.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function upcomingMatches(matches = [], now = new Date(), limit = 5) {
  const today = isoDate(now)
  return matches
    .filter((m) => matchStart(m) > now && m.date !== today)
    .sort((a, b) => matchStart(a) - matchStart(b))
    .slice(0, limit)
}

export function tickerMatches(matches = [], now = new Date()) {
  return [...todayMatches(matches, now), ...upcomingMatches(matches, now, 4)]
}

export function dayLabel(date, lang) {
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  }).format(date)
}
