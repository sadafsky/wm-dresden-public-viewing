import { t } from '../i18n'

// Brand lockup. Title is a pun: DD = Dresden.
// Full pun on wide screens, compact "WM 2026" on phones.
export default function Wordmark({ lang = 'de' }) {
  return (
    <div className="app-header__bug">
      <div className="app-header__bar" />
      <div className="app-header__lockup">
        <div className="app-header__title">
          <span className="ttl-full">
            {lang === 'de' ? (
              <>Weltmeisterschaf<span className="app-header__dd">DD</span> 2026</>
            ) : (
              <>Worl<span className="app-header__dd">DD</span> Cup 2026</>
            )}
          </span>
          <span className="ttl-short">WM <span className="app-header__dd">2026</span></span>
        </div>
        <div className="app-header__sub">{t[lang].tagline}</div>
      </div>
    </div>
  )
}
