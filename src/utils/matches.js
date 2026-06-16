const pad = (n) => String(n).padStart(2, '0')
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const matchStart = (m) => new Date(`${m.date}T${m.time}:00`)

const FULL_MS = 115 * 60000

// Approximate on-pitch minute from elapsed real time (accounts for ~15min halftime).
function liveMinute(diff) {
  const m = Math.floor(diff / 60000)
  if (m <= 45) return Math.max(1, m)
  if (m < 60) return 45          // halftime break
  return Math.min(95, m - 15)    // second half, minus the break
}

export function matchStatus(m, now = new Date()) {
  const diff = now - matchStart(m)
  // API status takes precedence; minute comes from API if present, else the clock
  if (m.status === 'finished') return { state: 'finished', minute: 90 }
  if (m.status === 'live') return { state: 'live', minute: m.minute ?? liveMinute(diff) }
  if (diff < 0) return { state: 'upcoming', minute: 0 }
  if (diff > FULL_MS) return { state: 'finished', minute: 90 }
  return { state: 'live', minute: m.minute ?? liveMinute(diff) }
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
