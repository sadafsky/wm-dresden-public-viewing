import { motion } from 'framer-motion'
import { t } from '../i18n'
import { useGoing } from '../context/GoingContext'

const FlameIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c1 3-1 4-2.5 6C8 10 8 12 9 13c-2 0-3-2-3-2-1 2-1 4 0 6 1.4 2.6 4 3 6 3s4.5-1 5.5-3.5c1.2-3-.5-6-2-7.5-.4 2-1.5 2.5-2.5 2 .8-1.2 1.5-3.5-.5-9z"/>
  </svg>
)

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
  const { counts } = useGoing()
  const count = counts[venue.id] || 0

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
            {venue.screens != null && <><span className="venue-card__dot">·</span>{tr.screens(venue.screens)}</>}
            {(venue.hours?.[lang] ?? venue.hours) && <><span className="venue-card__dot">·</span>{venue.hours?.[lang] ?? venue.hours}</>}
            {count > 0 && <span className="venue-card__heat"><FlameIcon />{count}</span>}
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
