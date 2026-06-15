import { motion } from 'framer-motion'
import { t } from '../i18n'
import { matchStatus, matchStart, dayLabel } from '../utils/matches'

export const matchCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
}

// A fixture card: each team on its own line (code · full name · score),
// aligned on a grid so everything lines up perfectly — no truncation.
export default function MatchCard({ m, lang, showDate = false }) {
  const tr = t[lang]
  const { state, minute } = matchStatus(m)
  const [hs, as] = (m.score || '').split('-')
  const hasScore = state !== 'upcoming' && hs != null && as != null
  const homeWin = hasScore && Number(hs) > Number(as)
  const awayWin = hasScore && Number(as) > Number(hs)

  return (
    <motion.div variants={matchCardVariants} className={`mcard mcard--${state}`}>
      <div className="mcard__head">
        <span className="mcard__time">
          {state === 'live' && <><span className="mcard__live-dot" /><b className="mcard__live">{tr.live} {minute}'</b></>}
          {state === 'finished' && <span className="mcard__ft">{tr.ft}</span>}
          {state === 'upcoming' && (
            <>{showDate && <span className="mcard__date">{dayLabel(matchStart(m), lang)} · </span>}{m.time}</>
          )}
        </span>
        {m.group && <span className="mcard__group">{tr.group} {m.group}</span>}
      </div>

      <div className={`mcard__team${homeWin ? ' mcard__team--win' : ''}`}>
        <span className="team-code">{m.home.code}</span>
        <span className="mcard__name">{m.home[lang]}</span>
        {hasScore && <span className="mcard__score">{hs}</span>}
      </div>
      <div className={`mcard__team${awayWin ? ' mcard__team--win' : ''}`}>
        <span className="team-code">{m.away.code}</span>
        <span className="mcard__name">{m.away[lang]}</span>
        {hasScore && <span className="mcard__score">{as}</span>}
      </div>
    </motion.div>
  )
}
