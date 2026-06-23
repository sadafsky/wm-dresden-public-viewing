import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import Map from './components/Map'
import MatchTicker from './components/MatchTicker'
import MatchHeatSelector from './components/MatchHeatSelector'
import RainOverlay from './components/RainOverlay'
import Header from './components/Header'
import TopControls from './components/TopControls'
import FilterMenu from './components/FilterMenu'
import BottomSheet from './components/BottomSheet'
import BrandMatchesBar from './components/BrandMatchesBar'
import SidePanel from './components/SidePanel'
import VenueDetail from './components/VenueDetail'
import AboutModal from './components/AboutModal'
import SubmitModal from './components/SubmitModal'
import TrafficLegend from './components/TrafficLegend'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { GoingProvider } from './context/GoingContext'
import { useVenues } from './hooks/useVenues'
import { useWeather } from './hooks/useWeather'
import { useMatches } from './hooks/useMatches'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useTheme } from './hooks/useTheme'

const RAIL_WIDTH = 408

function AppContent() {
  const { lang, toggleLang } = useLanguage()
  const { venues, geocoding } = useVenues()
  const weather = useWeather()
  const matches = useMatches()
  const { theme, toggle: toggleTheme } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [selectedVenue, setSelectedVenue] = useState(null)
  const [activeType, setActiveType]       = useState('all')
  const [query, setQuery]                 = useState('')
  const [openPanel, setOpenPanel]         = useState(null)
  const [showRain, setShowRain]           = useState(true)
  const [showTraffic, setShowTraffic]     = useState(false)
  const [aboutOpen, setAboutOpen]         = useState(false)
  const [submitOpen, setSubmitOpen]       = useState(false)
  const [railOpen, setRailOpen]           = useState(true)
  const [sheetOpen, setSheetOpen]         = useState(false)

  // Filter by indoor / outdoor (instead of venue type)
  const types = useMemo(() => ['indoor', 'outdoor'], [])
  const counts = useMemo(() => ({
    all: venues.length,
    indoor: venues.filter((v) => v.indoor).length,
    outdoor: venues.filter((v) => !v.indoor).length,
  }), [venues])

  const visibleVenues = useMemo(() => {
    const q = query.trim().toLowerCase()
    return venues.filter((v) => {
      const catOk = activeType === 'all' || (activeType === 'indoor' ? v.indoor : !v.indoor)
      const queryOk = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q)
      return catOk && queryOk
    })
  }, [venues, activeType, query])

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue))
  }, [])
  const handleClose = useCallback(() => setSelectedVenue(null), [])

  // Rain overlay: real weather OR manual toggle
  // Rain/snow follows REAL weather; the toggle only lets you hide it.
  // Sunny weather → no precipitation, even with the toggle on.
  const precipActive = showRain && (weather.isRain || weather.isSnow)
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
        isDesktop={isDesktop}
      />

      <RainOverlay active={precipActive} type={precipType} />

      <AnimatePresence>
        {isDesktop && showTraffic && <TrafficLegend lang={lang} />}
      </AnimatePresence>

      <MatchTicker lang={lang} matches={matches} />

      {!isDesktop && !selectedVenue && !sheetOpen && <MatchHeatSelector matches={matches} lang={lang} variant="floating" />}

      {isDesktop ? (
        <>
          <BrandMatchesBar
            lang={lang}
            weather={weather}
            showRain={showRain} setShowRain={setShowRain}
            showTraffic={showTraffic} setShowTraffic={setShowTraffic}
            matches={matches}
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
            onAddSpot={() => setSubmitOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </>
      ) : (
        <>
          <div className={`mobile-top${sheetOpen ? ' ui-hidden' : ''}`}>
            <Header lang={lang} inline />
            <div className="mobile-top__bar">
              <FilterMenu
                types={types}
                active={activeType}
                setActive={setActiveType}
                counts={counts}
                lang={lang}
                openPanel={openPanel}
                setOpenPanel={setOpenPanel}
              />
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
                inline
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </div>
          </div>
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
            onAddSpot={() => setSubmitOpen(true)}
            onOpenChange={setSheetOpen}
          />
        </>
      )}

      <AnimatePresence>
        {selectedVenue && (
          <VenueDetail
            key={selectedVenue.id}
            venue={selectedVenue}
            venues={visibleVenues}
            matches={matches}
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

      <AnimatePresence>
        {submitOpen && <SubmitModal lang={lang} onClose={() => setSubmitOpen(false)} />}
      </AnimatePresence>

      <Analytics />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <GoingProvider>
        <AppContent />
      </GoingProvider>
    </LanguageProvider>
  )
}
