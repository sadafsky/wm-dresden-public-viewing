import { motion, AnimatePresence } from 'framer-motion'
import { t } from '../i18n'
import MatchesPanel from './MatchesPanel'
import WeatherControls from './WeatherControls'

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
)

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.97 },
  transition: { type: 'spring', stiffness: 380, damping: 30 },
}

export default function TopControls({
  lang, toggleLang, openPanel, setOpenPanel, weather, matches, onAbout,
  showRain, setShowRain, showTraffic, setShowTraffic,
}) {
  const toggle = (name) => setOpenPanel((p) => (p === name ? null : name))

  return (
    <div className="top-controls">
      <div className="top-controls__row">
        <WeatherControls
          weather={weather}
          lang={lang}
          showRain={showRain} setShowRain={setShowRain}
          showTraffic={showTraffic} setShowTraffic={setShowTraffic}
          compact
        />

        <button
          className={`ctrl-btn${openPanel === 'matches' ? ' ctrl-btn--active' : ''}`}
          onClick={() => toggle('matches')}
          aria-label={t[lang].matches}
        >
          <CalendarIcon />
        </button>

        <button className="ctrl-btn" onClick={onAbout} aria-label={t[lang].about}>
          <InfoIcon />
        </button>

        <button className="ctrl-btn ctrl-btn--lang" onClick={toggleLang}>
          <AnimatePresence mode="wait">
            <motion.span
              key={lang}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {lang.toUpperCase()}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {openPanel === 'matches' && (
          <motion.div key="matches" {...panelMotion}>
            <MatchesPanel lang={lang} matches={matches} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
