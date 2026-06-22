import { motion, AnimatePresence } from 'framer-motion'
import { t } from '../i18n'
import WeatherChip from './WeatherChip'
import LayersPanel from './LayersPanel'
import ThemeToggle from './ThemeToggle'

const LayersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.97 },
  transition: { type: 'spring', stiffness: 380, damping: 30 },
}

export default function TopControls({
  lang, toggleLang, openPanel, setOpenPanel, weather, hidden, inline,
  showRain, setShowRain, showTraffic, setShowTraffic, theme, onToggleTheme,
}) {
  const anyLayerOn = showRain || showTraffic
  return (
    <div className={`top-controls${inline ? ' top-controls--inline' : ''}${hidden ? ' ui-hidden' : ''}`}>
      <div className="top-controls__row">
        <WeatherChip weather={weather} lang={lang} compact />
        <button
          className={`ctrl-btn${openPanel === 'layers' ? ' ctrl-btn--active' : ''}`}
          onClick={() => setOpenPanel((p) => (p === 'layers' ? null : 'layers'))}
          data-tip={t[lang].layers}
          aria-label={t[lang].layers}
        >
          <LayersIcon />
          {anyLayerOn && <span className="ctrl-btn__dot" />}
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} lang={lang} />
        <button className="ctrl-btn ctrl-btn--lang" onClick={toggleLang}>
          <AnimatePresence mode="wait">
            <motion.span key={lang} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}>
              {lang.toUpperCase()}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {openPanel === 'layers' && (
          <motion.div key="layers" className="top-controls__panel" {...panelMotion}>
            <LayersPanel
              lang={lang}
              showRain={showRain} setShowRain={setShowRain}
              showTraffic={showTraffic} setShowTraffic={setShowTraffic}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
