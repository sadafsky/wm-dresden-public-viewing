import { t } from '../i18n'

export default function AddSpotCta({ lang, onClick }) {
  return (
    <button className="add-spot" onClick={onClick}>
      <span className="add-spot__plus">+</span>
      <span className="add-spot__text">{t[lang].addSpotCta}</span>
    </button>
  )
}
