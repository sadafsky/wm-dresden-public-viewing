import { useEffect, useRef } from 'react'

// Full-screen canvas precipitation. Looks like real rain/snow, not radar blobs.
export default function RainOverlay({ active, type = 'rain' }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w, h, dpr
    const drops = []

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const isSnow = type === 'snow'
    const count = isSnow ? 110 : Math.round(w / 3.5) // denser so it reads clearly
    for (let i = 0; i < count; i++) {
      drops.push(
        isSnow
          ? { x: Math.random() * w, y: Math.random() * h, r: 1.2 + Math.random() * 2.8, spd: 0.5 + Math.random() * 1.1, drift: Math.random() * 0.6 - 0.3, ph: Math.random() * 6 }
          : { x: Math.random() * w, y: Math.random() * h, len: 16 + Math.random() * 22, spd: 9 + Math.random() * 11, op: 0.35 + Math.random() * 0.35 }
      )
    }

    function frame() {
      ctx.clearRect(0, 0, w, h)
      // Subtle atmospheric wash so precipitation reads on bright/day maps too
      ctx.fillStyle = isSnow ? 'rgba(225,235,255,0.05)' : 'rgba(28,38,66,0.10)'
      ctx.fillRect(0, 0, w, h)

      if (isSnow) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        for (const d of drops) {
          d.y += d.spd
          d.ph += 0.02
          d.x += Math.sin(d.ph) * 0.6 + d.drift
          if (d.y > h) { d.y = -5; d.x = Math.random() * w }
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        ctx.lineCap = 'round'
        ctx.lineWidth = 1.5
        for (const d of drops) {
          d.y += d.spd
          d.x += 1.6 // wind slant
          if (d.y > h) { d.y = -d.len; d.x = Math.random() * w }
          ctx.strokeStyle = `rgba(205,224,255,${d.op})`
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - 2, d.y + d.len)
          ctx.stroke()
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, type])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none' }}
    />
  )
}
