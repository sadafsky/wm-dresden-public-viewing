import { t } from '../i18n'

// Brand lockup. Title is a pun: DD = Dresden → "WeltmeisterschafDD 2026".
export default function Wordmark({ lang = 'de', hideTagline = false }) {
  return (
    <div className="app-header__bug">
      <div className="app-header__bar" />
      <div className="app-header__lockup">
        <div className="app-header__title">
          {lang === 'de' ? (
            <>Weltmeisterschaf<span className="app-header__dd">DD</span> 2026</>
          ) : (
            <>Worl<span className="app-header__dd">DD</span> Cup 2026</>
          )}
        </div>
        {!hideTagline && <div className="app-header__sub">{t[lang].tagline}</div>}
      </div>
    </div>
  )
}
