import { motion } from 'framer-motion'
import { t } from '../i18n'
import { todayMatches, upcomingMatches } from '../utils/matches'
import MatchCard from './MatchCard'

const listV = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }
const labelV = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export default function MatchesPanel({ lang, matches = [], bare = false }) {
  const tr = t[lang]
  const today = todayMatches(matches)
  const upcoming = upcomingMatches(matches, new Date(), 6)

  const inner = (
    <motion.div variants={listV} initial="hidden" animate="visible">
      <motion.div variants={labelV} className="panel__section-label">{tr.today}</motion.div>
      {today.length === 0 ? (
        <motion.div variants={labelV} className="panel__empty">{tr.noMatchesToday}</motion.div>
      ) : (
        today.map((m) => <MatchCard key={m.id} m={m} lang={lang} />)
      )}

      <motion.div variants={labelV} className="panel__section-label" style={{ marginTop: 16 }}>{tr.upcoming}</motion.div>
      {upcoming.map((m) => <MatchCard key={m.id} m={m} lang={lang} showDate />)}
    </motion.div>
  )

  if (bare) return inner
  return (
    <div className="panel">
      <div className="panel__title">{tr.matches}</div>
      {inner}
    </div>
  )
}
