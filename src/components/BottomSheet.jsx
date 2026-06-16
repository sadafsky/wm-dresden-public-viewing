import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import VenueCard from './VenueCard'
import MatchesPanel from './MatchesPanel'
import AddSpotCta from './AddSpotCta'
import { t } from '../i18n'

const PEEK = 88 // px visible when collapsed

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
)

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }

export default function BottomSheet({
  venues, selectedId, onVenueSelect, lang, query, setQuery, matches, counts, onAbout, onOpenChange, onAddSpot,
}) {
  const tr = t[lang]
  const sheetRef = useRef(null)
  const y = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState('places')
  const [sheetHeight, setSheetHeight] = useState(500)

  useEffect(() => {
    if (!sheetRef.current) return
    const h = sheetRef.current.offsetHeight
    setSheetHeight(h)
    if (!isOpen) y.set(h - PEEK)
  }, [venues.length, isOpen, tab])

  function snapOpen() { animate(y, 0, { type: 'spring', stiffness: 380, damping: 40 }); setIsOpen(true); onOpenChange?.(true) }
  function snapClose() { animate(y, sheetHeight - PEEK, { type: 'spring', stiffness: 380, damping: 40 }); setIsOpen(false); onOpenChange?.(false) }
  function handleDragEnd(_, info) {
    if (info.velocity.y > 150 || info.offset.y > sheetHeight * 0.25) snapClose()
    else snapOpen()
  }
  const stop = (e) => e.stopPropagation()
  function openTab(name) { setTab(name); if (!isOpen) snapOpen() }

  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: sheetHeight - PEEK }}
      dragElastic={0.06}
      onDragEnd={handleDragEnd}
      style={{ y, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, touchAction: 'none', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
      className="bottom-sheet"
    >
      {/* Header / drag area */}
      <div className="sheet-head" onClick={() => (isOpen ? snapClose() : snapOpen())}>
        <div className="sheet-handle" />
        <div className="sheet-head__row">
          <div className="rail-tabs" onPointerDown={stop}>
            <button
              className={`rail-tab${tab === 'places' ? ' rail-tab--active' : ''}`}
              onClick={(e) => { stop(e); openTab('places') }}
            >
              {tr.places}<span className="rail-tab__count">{counts.all}</span>
            </button>
            <button
              className={`rail-tab${tab === 'matches' ? ' rail-tab--active' : ''}`}
              onClick={(e) => { stop(e); openTab('matches') }}
            >
              {tr.matches}
            </button>
          </div>
          <button
            className="ctrl-btn sheet-info-btn"
            onPointerDown={stop}
            onClick={(e) => { stop(e); onAbout() }}
            aria-label={tr.about}
          >
            <InfoIcon />
          </button>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ color: isOpen ? 'var(--accent)' : 'var(--text-dim)', flexShrink: 0 }}
          >
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 6l5-5 5 5"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="sheet-body" onPointerDown={stop}>
        {tab === 'places' ? (
          <>
            <div className="sheet-search">
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
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
                </button>
              )}
            </div>

            <motion.div variants={listVariants} initial="hidden" animate="visible" key="places" style={{ paddingBottom: 8 }}>
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
              <AddSpotCta lang={lang} onClick={onAddSpot} />
            </motion.div>
          </>
        ) : (
          <div key="matches" style={{ padding: '4px 16px 8px' }}>
            <MatchesPanel lang={lang} matches={matches} bare />
          </div>
        )}
      </div>
    </motion.div>
  )
}
