import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const DRESDEN_CENTER = [13.7372, 51.0504]

export default function Map({ venues, selectedId, onVenueSelect }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // Create map once on mount
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DRESDEN_CENTER,
      zoom: 13,
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Re-render markers whenever venues list or selected venue changes
  useEffect(() => {
    if (!mapRef.current) return

    const addMarkers = () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      venues.forEach((venue) => {
        const el = document.createElement('div')
        el.className = 'map-pin'
        if (venue.id === selectedId) el.classList.add('map-pin--active')
        el.addEventListener('click', () => onVenueSelect(venue))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(venue.coordinates)
          .addTo(mapRef.current)

        markersRef.current.push(marker)
      })
    }

    if (mapRef.current.loaded()) {
      addMarkers()
    } else {
      mapRef.current.once('load', addMarkers)
    }
  }, [venues, selectedId, onVenueSelect])

  // Fly to selected venue
  useEffect(() => {
    if (!mapRef.current || !selectedId) return
    const venue = venues.find((v) => v.id === selectedId)
    if (!venue) return

    const fly = () =>
      mapRef.current.flyTo({
        center: venue.coordinates,
        zoom: 15,
        duration: 800,
        curve: 1.5,
      })

    if (mapRef.current.loaded()) {
      fly()
    } else {
      mapRef.current.once('load', fly)
    }
  }, [selectedId, venues])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  )
}
