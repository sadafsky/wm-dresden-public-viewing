import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const DRESDEN_CENTER = [13.755, 51.043]
const MAP_STYLE = 'mapbox://styles/mapbox/standard'

function lightPreset() {
  const h = new Date().getHours()
  if (h >= 5 && h < 8)  return 'dawn'
  if (h >= 8 && h < 18) return 'day'
  if (h >= 18 && h < 21) return 'dusk'
  return 'night'
}

// ── Traffic ─────────────────────────────────────────────────────
function addTrafficToMap(map) {
  if (map.getSource('mapbox-traffic')) return
  map.addSource('mapbox-traffic', { type: 'vector', url: 'mapbox://mapbox.mapbox-traffic-v1' })
  map.addLayer({
    id: 'traffic-layer',
    type: 'line',
    source: 'mapbox-traffic',
    'source-layer': 'traffic',
    slot: 'middle',
    minzoom: 5,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 2, 12, 6, 16, 11],
      'line-color': [
        'match', ['get', 'congestion'],
        'low', '#22c55e', 'moderate', '#f59e0b', 'heavy', '#f97316', 'severe', '#ef4444', '#22c55e',
      ],
      'line-opacity': 0.9,
    },
  })
}
function removeTrafficFromMap(map) {
  if (map.getLayer('traffic-layer'))   map.removeLayer('traffic-layer')
  if (map.getSource('mapbox-traffic')) map.removeSource('mapbox-traffic')
}

export default function Map({ venues, selectedId, onVenueSelect, showTraffic, padRight = 0 }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const mapLoadedRef = useRef(false)
  const firstLoadRef = useRef(true)

  const venuesRef        = useRef(venues)
  const selectedIdRef    = useRef(selectedId)
  const onVenueSelectRef = useRef(onVenueSelect)
  const showTrafficRef   = useRef(showTraffic)
  const padRightRef      = useRef(padRight)
  venuesRef.current        = venues
  selectedIdRef.current    = selectedId
  onVenueSelectRef.current = onVenueSelect
  showTrafficRef.current   = showTraffic
  padRightRef.current      = padRight

  const fitAll = useRef((duration = 0) => {
    const map = mapRef.current
    if (!map) return
    const coords = venuesRef.current.filter((v) => Array.isArray(v.coordinates)).map((v) => v.coordinates)
    if (coords.length < 2) return
    const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]))
    map.fitBounds(bounds, { padding: { top: 150, bottom: 90, left: 70, right: 70 + padRightRef.current }, maxZoom: 12.5, duration })
  }).current

  const refreshMarkers = useRef(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    venuesRef.current
      .filter((v) => Array.isArray(v.coordinates) && v.coordinates.length === 2)
      .forEach((venue) => {
        const wrapper = document.createElement('div')
        const pin = document.createElement('div')
        pin.className = `map-pin map-pin--${venue.type || 'other'}${venue.id === selectedIdRef.current ? ' map-pin--active' : ''}`
        wrapper.appendChild(pin)
        wrapper.addEventListener('click', () => onVenueSelectRef.current(venue))
        const marker = new mapboxgl.Marker({ element: wrapper }).setLngLat(venue.coordinates).addTo(map)
        markersRef.current.push(marker)
      })
  }).current

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DRESDEN_CENTER,
      zoom: 11, pitch: 50, bearing: -12, antialias: true,
    })
    mapRef.current = map

    map.on('style.load', () => {
      try { map.setConfigProperty('basemap', 'lightPreset', lightPreset()) } catch (_) {}
      try { map.setConfigProperty('basemap', 'showPointOfInterestLabels', false) } catch (_) {}
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 })
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 })

      if (firstLoadRef.current) {
        firstLoadRef.current = false
        map.resize()
        fitAll(0)
      }
      mapLoadedRef.current = true
      refreshMarkers()
      if (showTrafficRef.current) addTrafficToMap(map)
    })

    return () => {
      map.remove(); mapRef.current = null; mapLoadedRef.current = false; firstLoadRef.current = true
    }
  }, [refreshMarkers, fitAll])

  // ── Traffic toggle ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    if (showTraffic) addTrafficToMap(map)
    else removeTrafficFromMap(map)
  }, [showTraffic])

  // ── Markers refresh ─────────────────────────────────────────
  useEffect(() => { refreshMarkers() }, [venues, selectedId, refreshMarkers])

  // ── Fly to selected ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current || !selectedId) return
    const venue = venues.find((v) => v.id === selectedId)
    if (!venue?.coordinates) return
    map.flyTo({
      center: venue.coordinates,
      zoom: 15, pitch: 55, duration: 1100, curve: 1.4,
      offset: [-(padRightRef.current / 2), 0],
    })
  }, [selectedId, venues])

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />
  )
}
