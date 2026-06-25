import { useEffect, useState, Fragment } from 'react'
import { motion } from 'framer-motion'
import { useGoing } from '../context/GoingContext'
import { todayMatches, upcomingMatches, matchStatus } from '../utils/matches'
import { flagUrl } from '../utils/flags'
import { t } from '../i18n'

const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"/>
  </svg>
)

// Vertical match list: pick which match the "heat" reflects.
// variant: 'rail' (desktop, in the left brand bar — always open)
//        | 'floating' (mobile, fixed top-left — collapsible dropdown to save space)
export default function MatchHeatSelector({ matches, lang, variant = 'floating', onOpenChat }) {
  const tr = t[lang]
  const { selectedMatchId, setSelectedMatchId, counts } = useGoing()
  const [open, setOpen] = useState(false)

  const today = todayMatches(matches)
  const list = today.length ? today : upcomingMatches(matches, new Date(), 4)

  // Auto-pick a sensible default: a live match, else the next upcoming, else first.
  useEffect(() => {
    if (!list.length) return
    if (selectedMatchId && list.some((m) => m.id === selectedMatchId)) return
    const live = list.find((m) => ['live', 'halftime'].includes(matchStatus(m).state))
    const upcoming = list.find((m) => matchStatus(m).state === 'upcoming')
    setSelectedMatchId((live || upcoming || list[0]).id)
  }, [list, selectedMatchId, setSelectedMatchId])

  if (!list.length) return null

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const badgeOf = (m) => {
    const st = matchStatus(m)
    return st.state === 'live' ? `${st.minute}'`
      : st.state === 'halftime' ? tr.halftime
      : st.state === 'finished' ? tr.ft
      : m.time
  }
  const isLiveState = (m) => ['live', 'halftime'].includes(matchStatus(m).state)

  const chip = (m) => {
    const active = m.id === selectedMatchId
    return (
      <button
        onClick={() => setSelectedMatchId(m.id)}
        className={`match-chip${active ? ' match-chip--active' : ''}`}
        title={`${m.home[lang]} – ${m.away[lang]}`}
      >
        <img src={flagUrl(m.home.code)} alt="" className="match-chip__flag" loading="lazy" />
        <b>{m.home.code}</b>
        <span className="match-chip__vs">–</span>
        <b>{m.away.code}</b>
        <img src={flagUrl(m.away.code)} alt="" className="match-chip__flag" loading="lazy" />
        <span className={`match-chip__time${isLiveState(m) ? ' match-chip__time--live' : ''}`}>{badgeOf(m)}</span>
        {active && total > 0 && <span className="match-chip__count">{total}</span>}
      </button>
    )
  }

  const chatBtn = onOpenChat && selectedMatchId && (
    <button className="match-heat__chat" onClick={() => onOpenChat(selectedMatchId)}>
      <ChatIcon />{tr.chatCta}
    </button>
  )

  // ── Mobile: collapsible dropdown ───────────────────────
  if (variant === 'floating') {
    const selected = list.find((m) => m.id === selectedMatchId)
    return (
      <motion.div
        className={`match-heat match-heat--floating${open ? ' match-heat--open' : ''}`}
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="match-heat__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {selected ? (
            <span className="match-heat__toggle-label">
              <img src={flagUrl(selected.home.code)} alt="" className="match-chip__flag" />
              <b>{selected.home.code}</b><span className="match-chip__vs">–</span><b>{selected.away.code}</b>
              <img src={flagUrl(selected.away.code)} alt="" className="match-chip__flag" />
              <span className={`match-chip__time${isLiveState(selected) ? ' match-chip__time--live' : ''}`}>{badgeOf(selected)}</span>
            </span>
          ) : (
            <span className="match-heat__toggle-label">{tr.watchingWhich}</span>
          )}
          <svg className="match-heat__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {open && (
          <div className="match-heat__panel">
            <div className="match-heat__row">{list.map((m) => <Fragment key={m.id}>{chip(m)}</Fragment>)}</div>
            {chatBtn}
          </div>
        )}
      </motion.div>
    )
  }

  // ── Desktop: always-open vertical rail ─────────────────
  return (
    <motion.div
      className="match-heat match-heat--rail"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="match-heat__title">{tr.watchingWhich}</div>
      <div className="match-heat__row">
        {list.map((m) => (
          <Fragment key={m.id}>
            {chip(m)}
            {m.id === selectedMatchId && chatBtn}
          </Fragment>
        ))}
      </div>
    </motion.div>
  )
}
