import { useEffect, useRef, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { t } from '../i18n'
import { useGoing } from '../context/GoingContext'

const FlameIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c1 3-1 4-2.5 6C8 10 8 12 9 13c-2 0-3-2-3-2-1 2-1 4 0 6 1.4 2.6 4 3 6 3s4.5-1 5.5-3.5c1.2-3-.5-6-2-7.5-.4 2-1.5 2.5-2.5 2 .8-1.2 1.5-3.5-.5-9z"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>
)

// OSM (English) day codes → localized labels
const DAY_MAP = {
  de: { Mo: 'Mo', Tu: 'Di', We: 'Mi', Th: 'Do', Fr: 'Fr', Sa: 'Sa', Su: 'So', PH: 'Feiertag', SH: 'Ferien' },
  en: { Mo: 'Mon', Tu: 'Tue', We: 'Wed', Th: 'Thu', Fr: 'Fri', Sa: 'Sat', Su: 'Sun', PH: 'Holidays', SH: 'School hols' },
}
// Time keywords (sources may be German or English) → target language
const KW_MAP = {
  de: { ab: 'ab', von: 'ab', from: 'ab', bis: 'bis', till: 'bis', until: 'bis', off: 'geschl.', closed: 'geschl.', geschlossen: 'geschl.' },
  en: { ab: 'from', von: 'from', from: 'from', bis: 'till', till: 'till', until: 'till', off: 'closed', closed: 'closed', geschlossen: 'closed' },
}
// German-only abbreviations → canonical English (so EN can re-localize them)
const DE_TO_CANON = { Di: 'Tu', Mi: 'We', Do: 'Th', So: 'Su' }
// Any day token, EN or DE (used to detect rule boundaries)
const ANY_DAY = 'Mo|Di|Tu|Mi|We|Do|Th|Fr|Sa|So|Su|PH|SH'

function localize(s, lang) {
  const dmap = DAY_MAP[lang] || DAY_MAP.de
  const kmap = KW_MAP[lang] || KW_MAP.de
  return s
    .replace(/\b(Di|Mi|Do|So)\b/g, (k) => DE_TO_CANON[k])
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)\b/g, (k) => dmap[k] || k)
    .replace(/\b(ab|von|from|bis|till|until|off|closed|geschlossen)\b/gi, (k) => kmap[k.toLowerCase()] || k)
    .replace(/24\/7/g, lang === 'en' ? '24/7' : 'täglich 0–24 Uhr')
    .replace(/\s+/g, ' ')
    .trim()
}

// Parse an OSM opening_hours string into readable, localized day/time rows.
// Tolerant of messy data: quotes, comma-separated rules, German free text,
// "ab/from" instead of a start time. Anything unparseable shows as one line.
function parseHours(str, lang) {
  const cleaned = String(str).replace(/["“”'']/g, '').trim()
  // Some entries separate day-rules with a comma instead of ";"
  // (e.g. "Mo-Th 11:00-22:00, Fr,Sa 17:00-24:00"). Make it a real ";" first.
  const normalized = cleaned.replace(
    new RegExp(`(\\d[\\d:+.\\s,\\-]*?)\\s*,\\s*(?=(?:${ANY_DAY})\\b)`, 'g'),
    '$1; ',
  )
  return normalized
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((seg) => {
      // Time part starts at the first digit OR a time keyword (ab/von/from/…)
      const t = seg.match(/\d|\b(?:ab|von|from|bis|till|until|off|closed|geschlossen)\b|24\/7/i)
      if (t && t.index > 0 && /[A-Za-z]/.test(seg.slice(0, t.index))) {
        const daysRaw = seg.slice(0, t.index).trim().replace(/[,\s]+$/, '')
        const timesRaw = seg.slice(t.index).trim().replace(/,(?=\S)/g, ', ')
        return { days: localize(daysRaw, lang), times: localize(timesRaw, lang) }
      }
      return { days: '', times: localize(seg, lang) }
    })
}

// Top-down football pitch — a dark green "photo" with white lines,
// clearly visible in both light and dark themes.
function PitchPattern() {
  const line = 'rgba(255,255,255,0.30)'
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 420 200"
    >
      <defs>
        <linearGradient id="pitch-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a4029"/>
          <stop offset="100%" stopColor="#0e2418"/>
        </linearGradient>
        <radialGradient id="pitch-glow" cx="50%" cy="44%" r="55%">
          <stop offset="0%" stopColor="rgba(242,197,0,0.16)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      <rect width="420" height="200" fill="url(#pitch-bg)"/>
      {/* mowing stripes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 70} y="0" width="35" height="200" fill="rgba(255,255,255,0.025)"/>
      ))}
      <ellipse cx="210" cy="100" rx="175" ry="92" fill="url(#pitch-glow)"/>
      {/* Markings */}
      <rect x="24" y="18" width="372" height="164" stroke={line} strokeWidth="1.4" fill="none" rx="2"/>
      <circle cx="210" cy="100" r="42" stroke={line} strokeWidth="1.4" fill="none"/>
      <circle cx="210" cy="100" r="3" fill={line}/>
      <line x1="210" y1="18" x2="210" y2="182" stroke={line} strokeWidth="1.4"/>
      <rect x="24" y="56" width="72" height="88" stroke={line} strokeWidth="1.4" fill="none"/>
      <rect x="324" y="56" width="72" height="88" stroke={line} strokeWidth="1.4" fill="none"/>
      <rect x="24" y="80" width="14" height="40" stroke={line} strokeWidth="1.4" fill="none"/>
      <rect x="382" y="80" width="14" height="40" stroke={line} strokeWidth="1.4" fill="none"/>
    </svg>
  )
}

function AnimatedNumber({ value }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = animate(0, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) },
    })
    return c.stop
  }, [value])
  return <span ref={ref}>{value}</span>
}

export default function VenueDetail({ venue, venues = [], matches = [], lang, onClose, onNavigate, floating }) {
  const tr = t[lang]
  const scrollRef = useRef(null)
  const isDesktop = floating ?? window.innerWidth >= 768
  const idx = venues.findIndex((v) => v.id === venue.id)
  const prevVenue = venues[idx - 1] ?? null
  const nextVenue = venues[idx + 1] ?? null
  const { counts, going, toggleGoing, selectedMatchId } = useGoing()
  const goingCount = counts[venue.id] || 0
  const isGoing = going.has(venue.id)
  const selMatch = matches.find((m) => m.id === selectedMatchId) || null

  // Tags (indoor/outdoor + type + screens) + collapsible opening hours.
  // OSM bars often have long machine-style hours, so they live behind a dropdown.
  const hoursValue = venue.hours?.[lang] ?? venue.hours
  const [hoursOpen, setHoursOpen] = useState(false)

  const mobileStyle = {
    bottom: 0, left: 0, right: 0,
    borderRadius: '22px 22px 0 0',
    maxHeight: '82vh',
  }
  const desktopStyle = {
    bottom: 24, left: 24,
    width: 400,
    borderRadius: 16,
    maxHeight: 'calc(100vh - 48px)',
  }

  return (
    <motion.div
      ref={scrollRef}
      initial={isDesktop ? { opacity: 0, y: 28, scale: 0.97 } : { y: '100%' }}
      animate={isDesktop ? { opacity: 1, y: 0, scale: 1 }  : { y: 0 }}
      exit={isDesktop  ? { opacity: 0, y: 16, scale: 0.97 } : { y: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      drag={isDesktop ? false : 'y'}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
      style={{
        position: 'fixed',
        zIndex: 20,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        overflowY: 'auto',
        touchAction: isDesktop ? 'auto' : 'none',
        ...(isDesktop ? desktopStyle : mobileStyle),
      }}
    >
      {/* ── Hero ── */}
      <motion.div
        className="scanlines"
        style={{
          height: 180,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(145deg, rgba(242,197,0,0.06) 0%, var(--bg) 100%)',
        }}
      >
        {venue.photo
          ? <img src={venue.photo} alt={venue.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <PitchPattern />
        }

        {/* Type badge */}
        <span className="tag" style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
          {tr.types[venue.type] ?? venue.type}
        </span>

        {/* Nav + close row */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          display: 'flex', gap: 6,
        }}>
          {/* Prev */}
          <button
            onClick={() => prevVenue && onNavigate(prevVenue)}
            disabled={!prevVenue}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(10,20,14,0.55)',
              color: prevVenue ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              cursor: prevVenue ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Previous venue"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1L2 6l5 5"/>
            </svg>
          </button>

          {/* Counter */}
          <div style={{
            height: 30, padding: '0 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(10,20,14,0.55)',
            display: 'flex', alignItems: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.5)',
          }}>
            {idx + 1} / {venues.length}
          </div>

          {/* Next */}
          <button
            onClick={() => nextVenue && onNavigate(nextVenue)}
            disabled={!nextVenue}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(10,20,14,0.55)',
              color: nextVenue ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              cursor: nextVenue ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Next venue"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l5 5-5 5"/>
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(10,20,14,0.55)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9"/>
            </svg>
          </button>
        </div>
      </motion.div>

      {/* ── Thin accent line separating hero from content ── */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, rgba(242,197,0,0.5) 0%, rgba(242,197,0,0.05) 80%, transparent 100%)',
      }} />

      {/* ── Content ── */}
      <div style={{ padding: '20px 20px 44px', position: 'relative', zIndex: 2, background: 'var(--surface)' }}>

        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'clamp(22px, 6vw, 30px)',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.01em',
          lineHeight: 1,
          marginBottom: 8,
          overflowWrap: 'anywhere',
          hyphens: 'auto',
        }}>
          {venue.name}
        </div>

        {/* Address */}
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          {venue.address}
        </div>

        {/* ── Tags: indoor/outdoor · type · screens (no Draußen/Open-Air double) ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: hoursValue ? 12 : 20 }}>
          {venue.type === 'outdoor' ? (
            <span className="tag tag--accent">{tr.outdoor}</span>
          ) : (
            <>
              <span className="tag tag--accent">{venue.indoor ? tr.indoor : tr.outdoor}</span>
              <span className="tag">{tr.types[venue.type] ?? venue.type}</span>
            </>
          )}
          {venue.screens != null && <span className="tag">{tr.screens(venue.screens)}</span>}
        </div>

        {/* ── Opening hours: collapsible dropdown (OSM hours can be long) ── */}
        {hoursValue && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setHoursOpen((o) => !o)}
              className={`hours-toggle${hoursOpen ? ' hours-toggle--open' : ''}`}
              aria-expanded={hoursOpen}
            >
              <ClockIcon />
              <span>{tr.statHours}</span>
              <svg className="hours-toggle__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {hoursOpen && (
              <div className="hours-body">
                {parseHours(hoursValue, lang).map((row, i) => (
                  <div className="hours-row" key={i}>
                    {row.days && <span className="hours-row__days">{row.days}</span>}
                    <span className="hours-row__times">{row.times}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--text-mid)',
          lineHeight: 1.75,
          marginBottom: 22,
        }}>
          {venue.description[lang]}
        </p>

        {/* "I'm going" — drives the venue heat, scoped to the selected match */}
        {selMatch && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 8, fontFamily: 'var(--font-body)', fontSize: 11,
            fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}>
            {tr.goingTo}
            <b style={{ color: 'var(--text-mid)' }}>
              {selMatch.home.code}&nbsp;–&nbsp;{selMatch.away.code}
            </b>
            <span style={{ opacity: 0.6 }}>{selMatch.time}</span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => toggleGoing(venue.id)}
          disabled={!selMatch}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 10, padding: '12px 18px', borderRadius: 10,
            cursor: selMatch ? 'pointer' : 'not-allowed', opacity: selMatch ? 1 : 0.5,
            border: isGoing ? '1px solid transparent' : '1px solid var(--border-accent)',
            background: isGoing ? 'var(--accent)' : 'transparent',
            color: isGoing ? 'var(--ink)' : 'var(--accent)',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}
        >
          <FlameIcon />
          {isGoing ? tr.youreGoing : tr.imGoing}
          {goingCount > 0 && <span style={{ opacity: 0.8 }}>· {goingCount}</span>}
        </motion.button>

        {/* CTAs: website (primary) + route (secondary) */}
        <div style={{ display: 'flex', gap: 8 }}>
          {venue.website && (
            <motion.a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRadius: 10, padding: '13px 18px',
                background: 'var(--accent)',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
                color: 'var(--ink)', textDecoration: 'none',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              {tr.visitWebsite}
            </motion.a>
          )}
          <motion.a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: venue.website ? '0 0 auto' : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              borderRadius: 10, padding: '13px 18px',
              background: 'transparent', border: '1px solid var(--border-accent)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
              color: 'var(--accent)', textDecoration: 'none',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
            {tr.route}
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}
