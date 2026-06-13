import { motion } from 'framer-motion'
import VenueCard from './VenueCard'
import { t } from '../i18n'

const COLLAPSED_OFFSET = 160
const FULL_HEIGHT = 340

export default function BottomSheet({ venues, selectedId, onVenueSelect, lang }) {
  const tr = t[lang]

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: FULL_HEIGHT - COLLAPSED_OFFSET }}
      dragElastic={0.05}
      initial={{ y: FULL_HEIGHT - COLLAPSED_OFFSET }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: FULL_HEIGHT,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
        padding: '10px 16px 16px',
        zIndex: 10,
        boxShadow: 'var(--shadow-sheet)',
        touchAction: 'none',
      }}
    >
      {/* Drag handle — visual indicator that you can pull the sheet up */}
      <div
        style={{
          width: 32,
          height: 3,
          background: 'var(--border-muted)',
          borderRadius: 2,
          margin: '0 auto 14px',
        }}
      />

      {/* Venue count label */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--accent)',
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {tr.venueCount(venues.length)}
      </div>

      {/* Horizontally scrollable row of venue cards */}
      <div className="cards-row">
        {venues.map((venue, i) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            style={{ flexShrink: 0 }}
          >
            <VenueCard
              venue={venue}
              isSelected={venue.id === selectedId}
              onSelect={() => onVenueSelect(venue)}
              lang={lang}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
