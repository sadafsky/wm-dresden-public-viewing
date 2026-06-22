import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGoing } from '../context/GoingContext'
import { todayMatches, upcomingMatches, matchStatus } from '../utils/matches'
import { flagUrl } from '../utils/flags'
import { t } from '../i18n'

// Vertical match list: pick which match the "heat" reflects.
// People go to a venue to watch a SPECIFIC match — this selector scopes the
// glowing pins to "who's going to THIS match".
// variant: 'rail' (desktop, inside the left brand bar) | 'floating' (mobile, fixed top-left).
export default function MatchHeatSelector({ matches, lang, variant = 'floating' }) {
  const tr = t[lang]
  const { selectedMatchId, setSelectedMatchId, counts } = useGoing()

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

  return (
    <motion.div
      className={`match-heat match-heat--${variant}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="match-heat__title">{tr.watchingWhich}</div>
      <div className="match-heat__row">
        {list.map((m) => {
          const st = matchStatus(m)
          const active = m.id === selectedMatchId
          const badge = st.state === 'live' ? `${st.minute}'`
            : st.state === 'halftime' ? tr.halftime
            : st.state === 'finished' ? tr.ft
            : m.time
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`match-chip${active ? ' match-chip--active' : ''}`}
              title={`${m.home[lang]} – ${m.away[lang]}`}
            >
              <img src={flagUrl(m.home.code)} alt="" className="match-chip__flag" loading="lazy" />
              <b>{m.home.code}</b>
              <span className="match-chip__vs">–</span>
              <b>{m.away.code}</b>
              <img src={flagUrl(m.away.code)} alt="" className="match-chip__flag" loading="lazy" />
              <span className={`match-chip__time${st.state === 'live' || st.state === 'halftime' ? ' match-chip__time--live' : ''}`}>{badge}</span>
              {active && total > 0 && <span className="match-chip__count">{total}</span>}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
