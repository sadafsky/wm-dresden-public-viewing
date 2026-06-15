import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Map from './components/Map'
import MatchTicker from './components/MatchTicker'
import RainOverlay from './components/RainOverlay'
import Header from './components/Header'
import TopControls from './components/TopControls'
import FilterChips from './components/FilterChips'
import BottomSheet from './components/BottomSheet'
import BrandMatchesBar from './components/BrandMatchesBar'
import SidePanel from './components/SidePanel'
import VenueDetail from './components/VenueDetail'
import AboutModal from './components/AboutModal'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { useVenues } from './hooks/useVenues'
import { useWeather } from './hooks/useWeather'
import { useMatches } from './hooks/useMatches'
import { useMediaQuery } from './hooks/useMediaQuery'

const RAIL_WIDTH = 408

function AppContent() {
  const { lang, toggleLang } = useLanguage()
  const { venues, geocoding } = useVenues()
  const weather = useWeather()
  const matches = useMatches()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [selectedVenue, setSelectedVenue] = useState(null)
  const [activeType, setActiveType]       = useState('all')
  const [query, setQuery]                 = useState('')
  const [openPanel, setOpenPanel]         = useState(null)
  const [showRain, setShowRain]           = useState(false)
  const [showTraffic, setShowTraffic]     = useState(false)
  const [aboutOpen, setAboutOpen]         = useState(false)
  const [railOpen, setRailOpen]           = useState(true)

  const types = useMemo(
    () => [...new Set(venues.map((v) => v.type).filter(Boolean))],
    [venues]
  )
  const counts = useMemo(() => {
    const c = { all: venues.length }
    for (const ty of types) c[ty] = venues.filter((v) => v.type === ty).length
    return c
  }, [venues, types])

  const visibleVenues = useMemo(() => {
    const q = query.trim().toLowerCase()
    return venues.filter((v) => {
      const typeOk = activeType === 'all' || v.type === activeType
      const queryOk = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q)
      return typeOk && queryOk
    })
  }, [venues, activeType, query])

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue))
  }, [])
  const handleClose = useCallback(() => setSelectedVenue(null), [])

  // Rain overlay: real weather OR manual toggle
  const precipActive = showRain || weather.isRain || weather.isSnow
  const precipType = weather.isSnow ? 'snow' : 'rain'
  const railVisible = isDesktop && railOpen

  return (
    <div
      style={{
        width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
        '--rail-w': railVisible ? `${RAIL_WIDTH}px` : '0px',
      }}
    >
      <Map
        venues={visibleVenues}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={handleVenueSelect}
        showTraffic={showTraffic}
        padRight={railVisible ? RAIL_WIDTH : 0}
      />

      <RainOverlay active={precipActive} type={precipType} />

      <MatchTicker lang={lang} matches={matches} />

      {isDesktop ? (
        <>
          <BrandMatchesBar
            lang={lang}
            weather={weather}
            showRain={showRain} setShowRain={setShowRain}
            showTraffic={showTraffic} setShowTraffic={setShowTraffic}
          />
          <button
            className="rail-toggle"
            onClick={() => setRailOpen((o) => !o)}
            aria-label={railOpen ? 'Panel einklappen' : 'Panel ausklappen'}
            title={railOpen ? 'Einklappen' : 'Ausklappen'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: railOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }}>
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </button>
          <SidePanel
            open={railOpen}
            lang={lang}
            toggleLang={toggleLang}
            venues={visibleVenues}
            selectedId={selectedVenue?.id ?? null}
            onVenueSelect={handleVenueSelect}
            types={types}
            activeType={activeType}
            setActiveType={setActiveType}
            counts={counts}
            query={query}
            setQuery={setQuery}
            matches={matches}
            onAbout={() => setAboutOpen(true)}
          />
        </>
      ) : (
        <>
          <Header lang={lang} />
          <FilterChips types={types} active={activeType} onChange={setActiveType} lang={lang} counts={counts} />
          <TopControls
            lang={lang}
            toggleLang={toggleLang}
            openPanel={openPanel}
            setOpenPanel={setOpenPanel}
            weather={weather}
            showRain={showRain}
            setShowRain={setShowRain}
            showTraffic={showTraffic}
            setShowTraffic={setShowTraffic}
          />
          {openPanel && (
            <div onClick={() => setOpenPanel(null)} style={{ position: 'fixed', inset: 0, zIndex: 25 }} />
          )}
          <AnimatePresence>
            {selectedVenue && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={handleClose}
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(6,6,4,0.55)',
                  backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', zIndex: 18,
                }}
              />
            )}
          </AnimatePresence>
          <BottomSheet
            venues={visibleVenues}
            selectedId={selectedVenue?.id ?? null}
            onVenueSelect={handleVenueSelect}
            lang={lang}
            query={query}
            setQuery={setQuery}
            matches={matches}
            counts={counts}
            onAbout={() => setAboutOpen(true)}
          />
        </>
      )}

      <AnimatePresence>
        {selectedVenue && (
          <VenueDetail
            key={selectedVenue.id}
            venue={selectedVenue}
            venues={visibleVenues}
            lang={lang}
            onClose={handleClose}
            onNavigate={handleVenueSelect}
            floating={isDesktop}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aboutOpen && <AboutModal lang={lang} onClose={() => setAboutOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
