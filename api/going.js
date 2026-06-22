// "Ich geh hin" counters per venue, stored in Vercel KV (Upstash Redis).
// Counts reset every matchday (key namespaced by Berlin date).
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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const key = `going:${berlinDate()}`
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const venue = String(body.venue || '').slice(0, 64)
      const delta = Number(body.delta) > 0 ? 1 : -1
      if (!venue) return res.status(400).json({})
      const count = await kv.hincrby(key, venue, delta)
      if (count < 0) await kv.hset(key, { [venue]: 0 })
      await kv.expire(key, 60 * 60 * 36) // ~1.5 days
    }
    const counts = await kv.hgetall(key)
    return res.status(200).json(normalize(counts))
  } catch (_) {
    return res.status(200).json({}) // KV not set up → empty, no error
  }
}
