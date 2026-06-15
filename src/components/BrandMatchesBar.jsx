import { motion } from 'framer-motion'
import Wordmark from './Wordmark'
import WeatherControls from './WeatherControls'

export default function BrandMatchesBar({ lang, weather, showRain, setShowRain, showTraffic, setShowTraffic }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="brand-bar"
    >
      <Wordmark lang={lang} />

      <div className="brand-bar__strip">
        <WeatherControls
          weather={weather}
          lang={lang}
          showRain={showRain} setShowRain={setShowRain}
          showTraffic={showTraffic} setShowTraffic={setShowTraffic}
        />
      </div>
    </motion.div>
  )
}
