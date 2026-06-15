import { motion, AnimatePresence } from 'framer-motion'
import { t } from '../i18n'

const FunnelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h18l-7 8.5V20l-4 1v-8.5z" />
  </svg>
)

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.97 },
  transition: { type: 'spring', stiffness: 380, damping: 30 },
}

// A single filter button + dropdown (replaces the loose chip row on mobile).
export default function FilterMenu({ types, active, setActive, counts, lang, openPanel, setOpenPanel }) {
  const tr = t[lang]
  const options = [
    { key: 'all', label: tr.all, count: counts.all },
    ...types.map((ty) => ({ key: ty, label: tr.types[ty] ?? ty, count: counts[ty] })),
  ]
  const activeOpt = options.find((o) => o.key === active) ?? options[0]
  const isOpen = openPanel === 'filter'

  return (
    <div className="filter-menu">
      <button
        className={`ctrl-btn ctrl-btn--wide${isOpen ? ' ctrl-btn--active' : ''}`}
        onClick={() => setOpenPanel((p) => (p === 'filter' ? null : 'filter'))}
      >
        <FunnelIcon />
        {activeOpt.label}
        <span className="ctrl-btn__count">{activeOpt.count}</span>
        {active !== 'all' && <span className="ctrl-btn__dot" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="filter-menu__panel" {...panelMotion}>
            {options.map((o) => (
              <button
                key={o.key}
                className={`filter-opt${active === o.key ? ' filter-opt--active' : ''}`}
                onClick={() => { setActive(o.key); setOpenPanel(null) }}
              >
                {o.label}<span>{o.count}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
