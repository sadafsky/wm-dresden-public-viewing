import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { t } from '../i18n'
import { tickerMatches, matchStatus } from '../utils/matches'

function Segment({ m, lang }) {
  const { state, minute } = matchStatus(m)

  if (state === 'live') {
    return (
      <span className="seg seg--live">
        <span className="seg__live-dot" />
        <b>{m.home.code}</b>
        <span className="seg__score">{m.score ?? '–'}</span>
        <b>{m.away.code}</b>
        <span className="seg__min">{minute}'</span>
      </span>
    )
  }
  if (state === 'finished') {
    return (
      <span className="seg">
        <b>{m.home.code}</b>
        <span className="seg__score seg__score--ft">{m.score ?? '–'}</span>
        <b>{m.away.code}</b>
        <span className="seg__ft">FT</span>
      </span>
    )
  }
  return (
    <span className="seg">
      <b>{m.home.code}</b>
      <span className="seg__vs">vs</span>
      <b>{m.away.code}</b>
      <span className="seg__time">{m.time}</span>
    </span>
  )
}

// One self-contained copy of the feed, repeated enough to exceed the viewport.
const REPEAT = 3
function Copy({ lang, list, innerRef }) {
  return (
    <div className="ticker__content" ref={innerRef}>
      {Array.from({ length: REPEAT }).map((_, r) => (
        <span key={r} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span className="seg seg--brand">WM 2026 · DRESDEN</span>
          <span className="ticker__sep" />
          {list.map((m) => (
            <span key={m.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Segment m={m} lang={lang} />
              <span className="ticker__sep" />
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}

export default function MatchTicker({ lang, matches = [] }) {
  const [, setTick] = useState(0)
  const firstRef = useRef(null)
  const [width, setWidth] = useState(0)

  // Refresh live minutes
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const list = tickerMatches(matches)
  const hasLive = list.some((m) => matchStatus(m).state === 'live')

  // Measure one copy so we can translate by its EXACT pixel width (seamless loop)
  useEffect(() => {
    let cancelled = false
    const measure = () => { if (!cancelled && firstRef.current) setWidth(firstRef.current.offsetWidth) }
    measure()
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => { cancelled = true; window.removeEventListener('resize', measure) }
  }, [lang, list.length])

  const duration = width ? width / 55 : 30 // ~55 px/sec

  return (
    <div className="ticker">
      <div className={`ticker__badge${hasLive ? ' ticker__badge--live' : ''}`}>
        {hasLive ? (<><span className="ticker__badge-dot" />{t[lang].live}</>) : 'WM 26'}
      </div>
      <div className="ticker__viewport">
        <motion.div
          className="ticker__track"
          animate={width ? { x: [0, -width] } : { x: 0 }}
          transition={{ duration, ease: 'linear', repeat: Infinity }}
        >
          <Copy lang={lang} list={list} innerRef={firstRef} />
          <Copy lang={lang} list={list} />
        </motion.div>
      </div>
    </div>
  )
}
