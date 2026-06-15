import { motion } from 'framer-motion'
import { t } from '../i18n'

export const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
}

export default function VenueCard({ venue, index, isSelected, onSelect, lang, showDivider }) {
  const tr = t[lang]

  return (
    <>
      <motion.div
        variants={cardVariants}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.985 }}
        onClick={onSelect}
        className={`venue-card${isSelected ? ' venue-card--active' : ''}`}
      >
        {/* Squad-number style index */}
        <div className="venue-card__num">{String(index).padStart(2, '0')}</div>

        <div className="venue-card__body">
          <div className="venue-card__name">{venue.name}</div>
          <div className="venue-card__meta">
            <span className="venue-card__tag">{tr.types[venue.type] ?? venue.type}</span>
            <span className="venue-card__dot">·</span>
            {tr.screens(venue.screens)}
            <span className="venue-card__dot">·</span>
            {venue.hours?.[lang] ?? venue.hours}
          </div>
        </div>

        <div className="venue-card__chevron">
          <svg width="8" height="13" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l5 5-5 5"/>
          </svg>
        </div>
      </motion.div>

      {showDivider && <div className="venue-card__divider" />}
    </>
  )
}
