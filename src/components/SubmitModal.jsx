import { useState } from 'react'
import { motion } from 'framer-motion'
import { t } from '../i18n'

// Form-to-email via FormSubmit (no backend). First submission must be
// confirmed once via the activation email FormSubmit sends to the owner.
const ENDPOINT = 'https://formsubmit.co/ajax/contact.sadafsky@gmail.com'

export default function SubmitModal({ lang, onClose }) {
  const tr = t[lang]
  const [form, setForm] = useState({ name: '', address: '', type: 'bar', note: '', email: '' })
  const [status, setStatus] = useState('idle') // idle | sending | ok | err

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim() && form.address.trim()

  async function submit(e) {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Neuer Spot-Vorschlag — wmdd.live',
          Name: form.name,
          Adresse: form.address,
          Typ: tr.types[form.type] ?? form.type,
          Anmerkung: form.note,
          Kontakt: form.email,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('ok')
    } catch (_) {
      setStatus('err')
    }
  }

  return (
    <motion.div
      className="about-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="about-card submit-card"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="about-close" onClick={onClose} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
        </button>

        <div className="about-card__title">{tr.addSpotTitle}</div>

        {status === 'ok' ? (
          <p className="about-card__body" style={{ marginBottom: 4 }}>✓ {tr.sendOk}</p>
        ) : (
          <form onSubmit={submit} className="submit-form">
            <p className="about-card__body" style={{ marginBottom: 16 }}>{tr.addSpotIntro}</p>

            <label className="field">
              <span>{tr.fName} *</span>
              <input value={form.name} onChange={set('name')} required maxLength={80} />
            </label>
            <label className="field">
              <span>{tr.fAddress} *</span>
              <input value={form.address} onChange={set('address')} required maxLength={120} />
            </label>
            <label className="field">
              <span>{tr.fType}</span>
              <select value={form.type} onChange={set('type')}>
                <option value="bar">{tr.types.bar}</option>
                <option value="outdoor">{tr.types.outdoor}</option>
                <option value="restaurant">{tr.types.restaurant}</option>
                <option value="other">{tr.types.other}</option>
              </select>
            </label>
            <label className="field">
              <span>{tr.fNote}</span>
              <textarea value={form.note} onChange={set('note')} rows={2} maxLength={300} />
            </label>
            <label className="field">
              <span>{tr.fEmail}</span>
              <input type="email" value={form.email} onChange={set('email')} maxLength={120} />
            </label>

            {status === 'err' && <div className="submit-err">{tr.sendErr}</div>}

            <button type="submit" className="submit-btn" disabled={!valid || status === 'sending'}>
              {status === 'sending' ? tr.sending : tr.sendSuggestion}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
