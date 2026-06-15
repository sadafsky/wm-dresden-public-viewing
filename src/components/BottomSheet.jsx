import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import VenueCard from './VenueCard'
import { t } from '../i18n'

const PEEK = 76 // px visible when collapsed

const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export default function BottomSheet({
  venues, geocoding, selectedId, onVenueSelect, lang, query, setQuery,
}) {
  const tr = t[lang]
  const sheetRef = useRef(null)
  const y = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(500)

  useEffect(() => {
    if (!sheetRef.current) return
    const h = sheetRef.current.offsetHeight
    setSheetHeight(h)
    if (!isOpen) y.set(h - PEEK)
  }, [venues.length, isOpen])

  function snapOpen() {
    animate(y, 0, { type: 'spring', stiffness: 380, damping: 40 })
    setIsOpen(true)
  }
  function snapClose() {
    animate(y, sheetHeight - PEEK, { type: 'spring', stiffness: 380, damping: 40 })
    setIsOpen(false)
  }
  function handleDragEnd(_, info) {
    if (info.velocity.y > 150 || info.offset.y > sheetHeight * 0.25) snapClose()
    else snapOpen()
  }

  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: sheetHeight - PEEK }}
      dragElastic={0.06}
      onDragEnd={handleDragEnd}
      style={{ y, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, touchAction: 'none' }}
      className="bottom-sheet"
    >
      {/* Header — always visible in peek mode */}
      <div
        onClick={() => (isOpen ? snapClose() : snapOpen())}
        style={{ padding: '10px 20px 12px', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{
          width: 32, height: 3, background: 'rgba(255,255,255,0.18)',
          borderRadius: 2, margin: '0 auto 12px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
              letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase',
            }}>
              {tr.venueCount(venues.length)}
            </span>
            {geocoding && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-dim)' }}
              >
                · {tr.loading}
              </motion.span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isOpen && (
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.12em',
                  color: 'var(--text-dim)', textTransform: 'uppercase',
                }}
              >
                {tr.all}
              </motion.span>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ color: isOpen ? 'var(--accent)' : 'var(--text-dim)' }}
            >
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 6l5-5 5 5"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div
        className="sheet-search"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); if (!isOpen) snapOpen() }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (!isOpen) snapOpen() }}
          placeholder={tr.search}
          spellCheck={false}
        />
        {query && (
          <button className="sheet-search__clear" onClick={() => setQuery('')} aria-label="clear">
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9"/>
            </svg>
          </button>
        )}
      </div>

      {/* Venue list */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        style={{ paddingBottom: 40, minHeight: 60 }}
      >
        {venues.length === 0 ? (
          <div className="sheet-empty">{tr.noResults}</div>
        ) : (
          venues.map((venue, i) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              index={i + 1}
              isSelected={venue.id === selectedId}
              onSelect={() => { onVenueSelect(venue); snapClose() }}
              lang={lang}
              showDivider={i < venues.length - 1}
            />
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
