import { motion } from 'framer-motion'
import { t } from '../i18n'

// Shared brand lockup. The title is a pun: DD = Dresden, woven into
// "WeltmeisterschafDD 2026" (de) / "WorlDD Cup 2026" (en).
export default function Wordmark({ lang = 'de' }) {
  return (
    <div className="app-header__bug">
      <div className="app-header__bar" />
      <div className="app-header__lockup">
        <div className="app-header__live">
          <motion.span
            className="app-header__live-dot"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          Live
        </div>
        <div className="app-header__title">
          {lang === 'de' ? (
            <>Weltmeisterschaf<span className="app-header__dd">DD</span> 2026</>
          ) : (
            <>Worl<span className="app-header__dd">DD</span> Cup 2026</>
          )}
        </div>
        <div className="app-header__sub">{t[lang].tagline}</div>
      </div>
    </div>
  )
}
