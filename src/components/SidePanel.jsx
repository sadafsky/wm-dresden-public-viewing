import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { t } from '../i18n'
import VenueCard from './VenueCard'
import MatchesPanel from './MatchesPanel'
import AddSpotCta from './AddSpotCta'
import ThemeToggle from './ThemeToggle'

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
)

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }

export default function SidePanel({
  open = true,
  lang, toggleLang, venues, selectedId, onVenueSelect,
  types, activeType, setActiveType, counts, query, setQuery, matches, onAbout, onAddSpot,
  theme, onToggleTheme,
}) {
  const tr = t[lang]
  const [tab, setTab] = useState('places') // 'places' | 'matches'
  const chips = [{ key: 'all', label: tr.all }, ...types.map((ty) => ({ key: ty, label: tr[ty] ?? ty }))]

  // Scroll selected venue into view (when picked from the map)
  const listRef = useRef(null)
  useEffect(() => {
    if (tab !== 'places' || !selectedId || !listRef.current) return
    listRef.current.querySelector('.venue-card--active')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId, tab])

  // When a venue is selected on the map, make sure we're on the places tab
  useEffect(() => { if (selectedId) setTab('places') }, [selectedId])

  return (
    <motion.aside
      className="side-panel"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: open ? 0 : '101%' }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
    >
      <div className="side-panel__top">
        <div className="rail-tabs">
          <button
            className={`rail-tab${tab === 'places' ? ' rail-tab--active' : ''}`}
            onClick={() => setTab('places')}
          >
            {tr.places}<span className="rail-tab__count">{counts.all}</span>
          </button>
          <button
            className={`rail-tab${tab === 'matches' ? ' rail-tab--active' : ''}`}
            onClick={() => setTab('matches')}
          >
            {tr.matches}
          </button>
        </div>
        <div className="side-panel__actions">
          <button className="ctrl-btn" onClick={onAbout} data-tip={tr.about} aria-label={tr.about}><InfoIcon /></button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} lang={lang} />
          <button className="ctrl-btn ctrl-btn--lang" onClick={toggleLang}>{lang.toUpperCase()}</button>
        </div>
      </div>

      {tab === 'places' ? (
        <>
          <div className="sheet-search side-panel__search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr.search} spellCheck={false} />
            {query && (
              <button className="sheet-search__clear" onClick={() => setQuery('')} aria-label="clear">
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
              </button>
            )}
          </div>

          <div className="rail-chips">
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setActiveType(chip.key)}
                className={`chip${activeType === chip.key ? ' chip--active' : ''}`}
              >
                {chip.label}
                <span className="chip__count">{chip.key === 'all' ? counts.all : counts[chip.key]}</span>
              </button>
            ))}
          </div>

          <motion.div
            ref={listRef}
            className="side-panel__list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            key={activeType}
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
                  onSelect={() => onVenueSelect(venue)}
                  lang={lang}
                  showDivider={i < venues.length - 1}
                />
              ))
            )}
            <AddSpotCta lang={lang} onClick={onAddSpot} />
          </motion.div>
        </>
      ) : (
        <div className="side-panel__scroll">
          <MatchesPanel lang={lang} matches={matches} bare />
        </div>
      )}
    </motion.aside>
  )
}
