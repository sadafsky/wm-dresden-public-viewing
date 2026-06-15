import { t } from '../i18n'

const icons = {
  clear: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>
    </svg>
  ),
  cloud: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 19z"/>
    </svg>
  ),
  rain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 15"/>
      <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>
    </svg>
  ),
  snow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 15"/>
      <path d="M8 19h.01M12 20h.01M16 19h.01"/>
    </svg>
  ),
  fog: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 9h16M4 13h16M6 17h12"/>
    </svg>
  ),
}

export default function WeatherChip({ weather, lang, compact = false }) {
  if (weather.loading || weather.temp == null) return null
  const tr = t[lang]
  return (
    <div className="weather-chip" title={tr.weatherLabels[weather.category]}>
      <span className="weather-chip__icon">{icons[weather.category] ?? icons.clear}</span>
      <span className="weather-chip__temp">{weather.temp}°</span>
      {!compact && (
        <>
          <span className="weather-chip__sep" />
          <span className="weather-chip__cond">{tr.weatherLabels[weather.category]}</span>
        </>
      )}
    </div>
  )
}
