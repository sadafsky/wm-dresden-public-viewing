import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { t } from '../i18n'
import { flagUrl } from '../utils/flags'
import { matchStatus } from '../utils/matches'
import { getClientId, getName, setName as persistName } from '../utils/chatIdentity'

const SearchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
  </svg>
)

function merge(server, local) {
  const map = new Map()
  for (const m of local) map.set(m.id, m)
  for (const m of server) map.set(m.id, m)
  return [...map.values()].sort((a, b) => a.ts - b.ts).slice(-200)
}

const hhmm = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function ChatModal({ match, lang, onClose }) {
  const tr = t[lang]
  const cid = useRef(getClientId()).current
  const [name, setName] = useState(getName)
  const [editingName, setEditingName] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [looking, setLooking] = useState(false)
  const [onlyLooking, setOnlyLooking] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | err | slow
  const listRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    if (!match) return
    try {
      const res = await fetch(`/api/chat?match=${encodeURIComponent(match.id)}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.messages)) setMessages((prev) => merge(data.messages, prev))
    } catch (_) {}
  }, [match])

  useEffect(() => {
    fetchMessages()
    const id = setInterval(fetchMessages, 4000)
    return () => clearInterval(id)
  }, [fetchMessages])

  // Keep pinned to the newest message
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || status === 'sending') return
    setStatus('sending')
    const optimistic = { id: `local-${Date.now()}`, cid, name, text, looking, ts: Date.now() }
    setMessages((prev) => merge(prev, [optimistic]))
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: match.id, name, text, cid, looking }),
      })
      if (res.status === 429) { setStatus('slow'); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.message) setMessages((prev) => merge(prev, [data.message]))
      setStatus('idle')
    } catch (_) {
      setStatus('err')
    }
  }

  function saveName(v) {
    const clean = v.trim().slice(0, 24) || 'Fan'
    setName(clean)
    persistName(clean)
    setEditingName(false)
  }

  const st = matchStatus(match)
  const liveBadge = st.state === 'live' ? `${st.minute}'`
    : st.state === 'halftime' ? tr.halftime
    : st.state === 'finished' ? tr.ft
    : match.time

  const shown = onlyLooking ? messages.filter((m) => m.looking) : messages

  return (
    <motion.div
      className="about-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="about-card chat-card"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="about-close" onClick={onClose} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
        </button>

        {/* Header — which match this room is for */}
        <div className="chat-head">
          <img src={flagUrl(match.home.code)} alt="" className="chat-head__flag" />
          <b>{match.home.code}</b>
          <span className="chat-head__vs">–</span>
          <b>{match.away.code}</b>
          <img src={flagUrl(match.away.code)} alt="" className="chat-head__flag" />
          <span className={`chat-head__time${st.state === 'live' || st.state === 'halftime' ? ' chat-head__time--live' : ''}`}>{liveBadge}</span>
        </div>

        <button
          className={`chat-filter${onlyLooking ? ' chat-filter--on' : ''}`}
          onClick={() => setOnlyLooking((v) => !v)}
        >
          <SearchIcon />
          {tr.chatLookingFilter}
        </button>

        {/* Messages */}
        <div className="chat-list" ref={listRef}>
          {shown.length === 0 ? (
            <div className="chat-empty">{onlyLooking ? tr.chatNoLooking : tr.chatEmpty}</div>
          ) : (
            shown.map((m) => {
              const own = m.cid === cid
              return (
                <div key={m.id} className={`chat-msg${own ? ' chat-msg--own' : ''}`}>
                  <div className="chat-msg__bubble">
                    {!own && <span className="chat-msg__name">{m.name}</span>}
                    {m.looking && <span className="chat-msg__tag"><SearchIcon />{tr.chatLooking}</span>}
                    <span className="chat-msg__text">{m.text}</span>
                    <span className="chat-msg__time">{hhmm(m.ts)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Composer */}
        <form className="chat-composer" onSubmit={send}>
          <div className="chat-composer__row">
            {editingName ? (
              <input
                className="chat-name-input"
                autoFocus defaultValue={name} maxLength={24}
                onBlur={(e) => saveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(e.target.value) } }}
              />
            ) : (
              <button type="button" className="chat-name" onClick={() => setEditingName(true)}>
                {tr.chatAs} <b>{name}</b>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
            )}
            <button
              type="button"
              className={`chat-looking-toggle${looking ? ' chat-looking-toggle--on' : ''}`}
              onClick={() => setLooking((v) => !v)}
              title={tr.chatLookingHint}
            >
              <SearchIcon />
              {tr.chatLooking}
            </button>
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tr.chatPlaceholder}
              maxLength={280}
            />
            <button type="submit" className="chat-send" disabled={!input.trim() || status === 'sending'} aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>
            </button>
          </div>
          {status === 'slow' && <div className="chat-note">{tr.chatTooFast}</div>}
          {status === 'err' && <div className="chat-note chat-note--err">{tr.chatErr}</div>}
        </form>
      </motion.div>
    </motion.div>
  )
}
