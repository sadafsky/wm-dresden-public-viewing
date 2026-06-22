// "Ich geh hin" counters, stored in Vercel KV (Upstash Redis).
// Counts are per MATCH (people pick which match they're going to watch),
// and reset every matchday (key namespaced by Berlin date + match id).
// If KV isn't configured yet, returns {} gracefully (feature degrades, no crash).
import { kv } from '@vercel/kv'

function berlinDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function normalize(obj) {
  const out = {}
  for (const k in obj || {}) {
    const n = Number(obj[k])
    if (n > 0) out[k] = n
  }
  return out
}

const keyFor = (matchId) => `going:${berlinDate()}:${matchId}`

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const venue = String(body.venue || '').slice(0, 64)
      const match = String(body.match || '').slice(0, 64)
      const delta = Number(body.delta) > 0 ? 1 : -1
      if (!venue || !match) return res.status(400).json({})
      const key = keyFor(match)
      const count = await kv.hincrby(key, venue, delta)
      if (count < 0) await kv.hset(key, { [venue]: 0 })
      await kv.expire(key, 60 * 60 * 36) // ~1.5 days
      return res.status(200).json(normalize(await kv.hgetall(key)))
    }

    // GET — requires ?match=<id>; returns { venueId: count } for that match
    const match = String(req.query?.match || '').slice(0, 64)
    if (!match) return res.status(200).json({})
    return res.status(200).json(normalize(await kv.hgetall(keyFor(match))))
  } catch (_) {
    return res.status(200).json({}) // KV not set up → empty, no error
  }
}
