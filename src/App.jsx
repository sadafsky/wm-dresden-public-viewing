import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Map from './components/Map'
import BottomSheet from './components/BottomSheet'
import VenueDetail from './components/VenueDetail'
import LanguageToggle from './components/LanguageToggle'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import venues from './data/venues.json'

function AppContent() {
  const [selectedVenue, setSelectedVenue] = useState(null)
  const { lang } = useLanguage()

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue((prev) => (prev?.id === venue.id ? null : venue))
  }, [])

  const handleClose = useCallback(() => setSelectedVenue(null), [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Map
        venues={venues}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={handleVenueSelect}
      />

      <LanguageToggle />

      <BottomSheet
        venues={venues}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={handleVenueSelect}
        lang={lang}
      />

      {/* AnimatePresence lets VenueDetail play its exit animation before unmounting */}
      <AnimatePresence>
        {selectedVenue && (
          <VenueDetail
            key={selectedVenue.id}
            venue={selectedVenue}
            lang={lang}
            onClose={handleClose}
          />
        )}
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
