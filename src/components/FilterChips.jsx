import { motion } from 'framer-motion'
import { t } from '../i18n'

// Horizontal, scrollable row of type filters. "Alle" + one chip per type present.
export default function FilterChips({ types, active, onChange, lang, counts, hidden, inline }) {
  const tr = t[lang]
  const chips = [{ key: 'all', label: tr.all }, ...types.map((ty) => ({ key: ty, label: tr[ty] ?? ty }))]

  return (
    <div className={`filter-chips${inline ? ' filter-chips--inline' : ''}${hidden ? ' ui-hidden' : ''}`}>
      {chips.map((chip) => {
        const isActive = active === chip.key
        const count = chip.key === 'all' ? counts.all : counts[chip.key]
        return (
          <motion.button
            key={chip.key}
            onClick={() => onChange(chip.key)}
            whileTap={{ scale: 0.94 }}
            className={`chip${isActive ? ' chip--active' : ''}`}
          >
            {chip.label}
            <span className="chip__count">{count}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
