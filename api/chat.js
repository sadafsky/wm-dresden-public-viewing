// Ephemeral per-match chat, stored in Vercel KV (Upstash Redis).
// One room per match; messages auto-expire (key namespaced by Berlin date)
// so the chat is "temporary" by design. No login — nickname + client id only.
// Degrades gracefully to an empty room if KV isn't configured.
import { kv } from '@vercel/kv'

function berlinDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

const keyFor = (matchId) => `chat:${berlinDate()}:${matchId}`
const MAX_MESSAGES = 80
const TTL = 60 * 60 * 36 // ~1.5 days

// Strip control chars, collapse whitespace, clamp length.
function clean(str, max) {
  return String(str || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  return (Array.isArray(fwd) ? fwd[0] : (fwd || '')).split(',')[0].trim() || 'anon'
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const match = clean(body.match, 64)
      const name = clean(body.name, 24) || 'Fan'
      const text = clean(body.text, 280)
      const cid = clean(body.cid, 40)
      const looking = !!body.looking
      if (!match || !text) return res.status(400).json({ error: 'bad_request' })

      // Anti-spam: max one message per 3s per IP.
      const rl = `chatrl:${clientIp(req)}`
      const ok = await kv.set(rl, 1, { nx: true, ex: 3 })
      if (ok === null) return res.status(429).json({ error: 'too_fast' })

      const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, cid, name, text, looking, ts: Date.now() }
      const key = keyFor(match)
      await kv.rpush(key, JSON.stringify(msg))
      await kv.ltrim(key, -MAX_MESSAGES, -1)
      await kv.expire(key, TTL)
      return res.status(200).json({ message: msg })
    }

    // GET ?match=<id> → last messages, oldest first
    const match = clean(req.query?.match, 64)
    if (!match) return res.status(200).json({ messages: [] })
    const raw = await kv.lrange(keyFor(match), -MAX_MESSAGES, -1)
    const messages = (raw || []).map((m) => {
      try { return typeof m === 'string' ? JSON.parse(m) : m } catch (_) { return null }
    }).filter(Boolean)
    return res.status(200).json({ messages })
  } catch (_) {
    return res.status(200).json({ messages: [] }) // KV not set up → empty room, no crash
  }
}
