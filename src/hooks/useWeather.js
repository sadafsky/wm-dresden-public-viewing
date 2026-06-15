import { useState, useEffect } from 'react'

// Open-Meteo — free, no API key. Real current weather for Dresden.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=51.05&longitude=13.74' +
  '&current=temperature_2m,precipitation,weather_code,is_day&timezone=auto'

// WMO weather codes → category
function classify(code) {
  if (code == null) return 'clear'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)
  ) return 'rain'
  if ([45, 48].includes(code)) return 'fog'
  if ([1, 2, 3].includes(code)) return 'cloud'
  return 'clear'
}

export function useWeather() {
  const [weather, setWeather] = useState({
    loading: true, temp: null, code: null, isDay: true,
    category: 'clear', isRain: false, isSnow: false, precip: 0,
  })

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch(URL)
        const data = await res.json()
        if (!alive) return
        const c = data.current || {}
        const category = classify(c.weather_code)
        setWeather({
          loading: false,
          temp: Math.round(c.temperature_2m),
          code: c.weather_code,
          isDay: c.is_day === 1,
          precip: c.precipitation ?? 0,
          category,
          isRain: category === 'rain',
          isSnow: category === 'snow',
        })
      } catch (_) {
        if (alive) setWeather((w) => ({ ...w, loading: false }))
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000) // refresh every 10 min
    return () => { alive = false; clearInterval(id) }
  }, [])

  return weather
}
