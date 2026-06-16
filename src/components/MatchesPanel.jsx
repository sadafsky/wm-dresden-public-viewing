import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { t } from '../i18n'
import { todayMatches, upcomingMatches } from '../utils/matches'
import { flagUrl } from '../utils/flags'
import MatchCard from './MatchCard'

const listV = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }
const labelV = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

const isGermany = (m) => m.home.code === 'GER' || m.away.code === 'GER'

export default function MatchesPanel({ lang, matches = [], bare = false }) {
  const tr = t[lang]
  const [gerOnly, setGerOnly] = useState(false)
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  let today = todayMatches(matches)
  let upcoming = upcomingMatches(matches, new Date(), 6)
  if (gerOnly) {
    today = today.filter(isGermany)
    upcoming = upcomingMatches(matches.filter(isGermany), new Date(), 8)
  }

  const inner = (
    <motion.div variants={listV} initial="hidden" animate="visible">
      <motion.button
        variants={labelV}
        className={`ger-filter${gerOnly ? ' ger-filter--active' : ''}`}
        onClick={() => setGerOnly((v) => !v)}
      >
        <img className="ger-filter__flag" src={flagUrl('GER')} alt="GER" width="22" height="16" />
        {tr.germanyOnly}
      </motion.button>

      <motion.div variants={labelV} className="panel__section-label" style={{ marginTop: 12 }}>{tr.today}</motion.div>
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
