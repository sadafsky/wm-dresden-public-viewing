// Vercel serverless function: proxies live FIFA World Cup fixtures from
// football-data.org and maps them to the app's match shape.
//
// To enable live data, set the env var FOOTBALL_DATA_TOKEN in Vercel
// (free key from https://www.football-data.org/client/register).
// Without a token (or on any error) it returns [] and the client keeps
// its bundled schedule — so the site always works.

const WC_COMPETITION = 2000 // FIFA World Cup

function berlinParts(utcDate) {
  const dt = new Date(utcDate)
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(dt)
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(dt)
  return { date, time }
}

function teamShape(team) {
  const name = team?.name || team?.shortName || 'TBD'
  const code = team?.tla || (team?.shortName || name).slice(0, 3).toUpperCase()
  return { code, de: name, en: name }
}

function mapStatus(s) {
  if (s === 'FINISHED' || s === 'AWARDED') return 'finished'
  if (s === 'PAUSED') return 'paused'   // halftime
  if (s === 'IN_PLAY') return 'live'
  return 'upcoming'
}

export default async function handler(req, res) {
  const token = process.env.FOOTBALL_DATA_TOKEN
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  if (!token) return res.status(200).json([])

  try {
    const r = await fetch(
      `https://api.football-data.org/v4/competitions/${WC_COMPETITION}/matches`,
      { headers: { 'X-Auth-Token': token } }
    )
    if (!r.ok) return res.status(200).json([])
    const data = await r.json()

    const matches = (data.matches || [])
      .map((m) => {
        const { date, time } = berlinParts(m.utcDate)
        const ft = m.score?.fullTime || {}
        const score = ft.home != null && ft.away != null ? `${ft.home}-${ft.away}` : null
        const group = m.group ? String(m.group).replace(/^GROUP_/, '') : null
        return {
          id: String(m.id),
          date, time, group,
          status: mapStatus(m.status),
          minute: m.minute ?? undefined,
          score,
          home: teamShape(m.homeTeam),
          away: teamShape(m.awayTeam),
        }
      })
      .filter((m) => m.home.code && m.away.code)

    return res.status(200).json(matches)
  } catch (_) {
    return res.status(200).json([])
  }
}
