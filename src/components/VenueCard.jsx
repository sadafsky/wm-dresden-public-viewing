import { t } from '../i18n'

const TYPE_EMOJI = {
  bar: '🍺',
  restaurant: '🍔',
  outdoor: '🌤️',
  other: '⚽',
}

export default function VenueCard({ venue, isSelected, onSelect, lang }) {
  const tr = t[lang]

  return (
    <div
      onClick={onSelect}
      style={{
        width: 140,
        background: '#141f35',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: `1.5px solid ${isSelected ? '#f4a261' : 'transparent'}`,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Icon / photo area */}
      <div
        style={{
          height: 64,
          background: 'linear-gradient(135deg, #1e3a5f, #0f2040)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          overflow: 'hidden',
        }}
      >
        {venue.photo
          ? <img src={venue.photo} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (TYPE_EMOJI[venue.type] ?? '⚽')
        }
      </div>

      {/* Info */}
      <div style={{ padding: '8px 9px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>
          {venue.name}
        </div>
        <div style={{ fontSize: 9, color: '#f4a261' }}>
          {tr.types[venue.type] ?? venue.type} · {tr.screens(venue.screens)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
          {venue.indoor ? `🏠 ${tr.indoor}` : `🌿 ${tr.outdoor}`}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
          ⏰ {venue.hours}
        </div>
      </div>
    </div>
  )
}
