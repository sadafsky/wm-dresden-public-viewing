import WeatherChip from './WeatherChip'
import { t } from '../i18n'

const RainIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 15"/>
    <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>
  </svg>
)
const TrafficIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="13" height="10" rx="2"/><path d="M15 10h4l3 4v3h-7V10z"/>
    <circle cx="5.5" cy="19.5" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="14.5" cy="19.5" r="1.4" fill="currentColor" stroke="none"/>
  </svg>
)

// Weather temperature + the two map toggles (rain, traffic) grouped together.
export default function WeatherControls({
  weather, lang, showRain, setShowRain, showTraffic, setShowTraffic, compact = false,
}) {
  const tr = t[lang]
  return (
    <div className="weather-controls">
      <WeatherChip weather={weather} lang={lang} compact={compact} />
      <button
        className={`cond-btn${showRain ? ' cond-btn--on' : ''}`}
        onClick={() => setShowRain((v) => !v)}
        title={tr.rain}
        aria-label={tr.rain}
      >
        <RainIcon />
      </button>
      <button
        className={`cond-btn${showTraffic ? ' cond-btn--on' : ''}`}
        onClick={() => setShowTraffic((v) => !v)}
        title={tr.traffic}
        aria-label={tr.traffic}
      >
        <TrafficIcon />
      </button>
    </div>
  )
}
