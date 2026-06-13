import { motion } from 'framer-motion'
import { t } from '../i18n'

const TYPE_EMOJI = {
  bar: '🍺',
  restaurant: '🍔',
  outdoor: '🌤️',
  other: '⚽',
}

function Tag({ children, muted }) {
  return (
    <span
      style={{
        background: '#141f35',
        border: `1px solid ${muted ? 'transparent' : 'rgba(244,162,97,0.3)'}`,
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 12,
        color: muted ? 'var(--text-secondary)' : 'var(--accent)',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

export default function VenueDetail({ venue, lang, onClose }) {
  const tr = t[lang]
  const isDesktop = window.innerWidth >= 768

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80) onClose()
      }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: isDesktop ? 'auto' : 0,
        right: 0,
        width: isDesktop ? 400 : '100%',
        top: isDesktop ? 0 : 'auto',
        zIndex: 20,
        background: 'var(--bg-card)',
        borderRadius: isDesktop ? 0 : '20px 20px 0 0',
        maxHeight: isDesktop ? '100vh' : '88vh',
        overflowY: 'auto',
        touchAction: 'none',
      }}
    >
      {/* Photo / icon area */}
      <div
        style={{
          height: 200,
          background: 'linear-gradient(135deg, #1e3a5f, #0f2040)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 72,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {venue.photo ? (
          <img
            src={venue.photo}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          TYPE_EMOJI[venue.type] ?? '⚽'
        )}

        {/* Venue type badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(244,162,97,0.2)',
            border: '1px solid rgba(244,162,97,0.4)',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 10,
            color: 'var(--accent)',
            fontWeight: 700,
          }}
        >
          {tr.types[venue.type] ?? venue.type}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(10,10,20,0.75)',
            border: 'none',
            color: 'white',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 40px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
          {venue.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          📍 {venue.address}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <Tag>{venue.indoor ? `🏠 ${tr.indoor}` : `🌿 ${tr.outdoor}`}</Tag>
          <Tag>{`📺 ${tr.screens(venue.screens)}`}</Tag>
          <Tag muted>{`⏰ ${venue.hours}`}</Tag>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, marginBottom: 22 }}>
          {venue.description[lang]}
        </p>

        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: 'var(--accent)',
              color: '#0a0a14',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            {tr.visitWebsite}
          </a>
        )}
      </div>
    </motion.div>
  )
}
