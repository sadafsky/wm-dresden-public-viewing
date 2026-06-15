import { motion, AnimatePresence } from 'framer-motion'
import { t } from '../i18n'

export function Switch({ on }) {
  return (
    <span className={`switch${on ? ' switch--on' : ''}`}>
      <span className="switch__knob" />
    </span>
  )
}

export default function LayersPanel({
  lang, showRain, setShowRain, showTraffic, setShowTraffic, bare = false,
}) {
  const tr = t[lang]

  const inner = (
    <>
      <button className="layer-row" onClick={() => setShowRain((v) => !v)}>
        <span className="layer-row__dot" style={{ background: '#60a5fa' }} />
        <span className="layer-row__label">{tr.rain}</span>
        <Switch on={showRain} />
      </button>

      <button className="layer-row" onClick={() => setShowTraffic((v) => !v)}>
        <span className="layer-row__dot" style={{ background: 'var(--accent)' }} />
        <span className="layer-row__label">{tr.traffic}</span>
        <Switch on={showTraffic} />
      </button>

      <AnimatePresence>
        {showTraffic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="traffic-legend"
          >
            <span><i style={{ background: '#22c55e' }} />{tr.legendClear}</span>
            <span><i style={{ background: '#f59e0b' }} />{tr.legendBusy}</span>
            <span><i style={{ background: '#ef4444' }} />{tr.legendJam}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  if (bare) return inner
  return (
    <div className="panel">
      <div className="panel__title">{tr.layers}</div>
      {inner}
    </div>
  )
}
