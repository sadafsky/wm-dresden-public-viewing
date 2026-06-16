import { motion } from 'framer-motion'
import { t } from '../i18n'

// Compact traffic colour key, pinned in the map corner while traffic is on.
export default function TrafficLegend({ lang }) {
  const tr = t[lang]
  return (
    <motion.div
      className="map-legend"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="map-legend__title">{tr.traffic}</span>
      <span className="map-legend__item"><i style={{ background: '#22c55e' }} />{tr.legendClear}</span>
      <span className="map-legend__item"><i style={{ background: '#f59e0b' }} />{tr.legendBusy}</span>
      <span className="map-legend__item"><i style={{ background: '#ef4444' }} />{tr.legendJam}</span>
    </motion.div>
  )
}
