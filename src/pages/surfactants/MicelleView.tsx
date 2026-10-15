import { useEffect, useRef } from 'react'
import type { HeadType } from '../../lib/surfactants'
import { onThemeChange, readThemeColors } from '../../lib/themeColors'

// Animated cross-section of a beaker: air above, water below, surfactant at the interface and in the bulk.
// It is a picture of the model, not a simulation: the page passes in how full the interface is (Γ/Γmax), how
// many free monomers to show and how many micelles, and the view eases towards those numbers. Molecules that
// appear or disappear fade in and out, and the bulk ones drift with a slow random walk.
//
// World coordinates are in units of roughly one head-group diameter: x left → right, y top → bottom.

const W = 30
const H = 15
const AIR = 4 // depth of the air layer; the interface is at y = AIR
const WALL = 0.9 // beaker wall inset
const BOTTOM = H - 0.7
const N_SLOTS = 26 // interface positions
const SLOT_W = (W - 2 * WALL - 1) / N_SLOTS
const MAX_MICELLES = 6
const FADE = 2.5 // 1/s

/** Visual counts the page derives from the model. */
export interface MicelleTargets {
  /** Fraction of interface positions occupied, Γ/Γmax (0–1). */
  coverage: number
  /** Free monomers drawn in the bulk. */
  monomers: number
  /** Micelles drawn in the bulk. */
  micelles: number
}

interface Props extends MicelleTargets {
  head: HeadType
  tail: number
  paused: boolean
  label: string
}

interface Mover {
  x: number
  y: number
  angle: number
  alpha: number
  leaving: boolean
  vx: number
  vy: number
  spin: number
}

// Interface positions fill in a fixed scattered order, so a half-full surface looks evenly sprinkled.
const SLOT_ORDER = (() => {
  const order: number[] = []
  let k = 0
  for (let i = 0; i < N_SLOTS; i++) {
    order.push(k)
    k = (k + 11) % N_SLOTS // 11 and 26 are coprime: visits every slot once
  }
  return order
})()

const tailLength = (n: number) => 0.155 * n // world units; C12 ≈ 1.9 head diameters
const headRadius = (h: HeadType) => (h === 'nonionic' ? 0.38 : 0.33) // PEG head of Tween is bulky

export default function MicelleView({ coverage, monomers, micelles, head, tail, paused, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ coverage, monomers, micelles, head, tail, paused })
  propsRef.current = { coverage, monomers, micelles, head, tail, paused }

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let theme = readThemeColors()
    const offTheme = onThemeChange(() => (theme = readThemeColors()))

    let scale = 1
    let cssW = 0
    let cssH = 0
    const resize = () => {
      cssW = wrap.clientWidth
      scale = cssW / W
      cssH = Math.round(H * scale)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // Interface occupancy: one alpha per slot, eased towards 0 or 1.
    const slotAlpha = new Float64Array(N_SLOTS)
    const monos: Mover[] = []
    const mics: (Mover & { r: number })[] = []

    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const bulkTop = AIR + 1.2
    const randomMover = (margin: number): Mover => ({
      x: rand(WALL + margin, W - WALL - margin),
      y: rand(bulkTop + margin, BOTTOM - margin),
      angle: rand(0, Math.PI * 2),
      alpha: reduceMotion ? 1 : 0,
      leaving: false,
      vx: 0,
      vy: 0,
      spin: rand(-0.4, 0.4),
    })

    /** A micelle placed clear of the others (best of a few tries). */
    const newMicelle = (r: number) => {
      let best = randomMover(r + 0.3)
      let bestGap = -Infinity
      for (let t = 0; t < 25; t++) {
        const m = randomMover(r + 0.3)
        const gap = Math.min(Infinity, ...mics.filter((o) => !o.leaving).map((o) => Math.hypot(o.x - m.x, o.y - m.y) - o.r - r))
        if (gap > bestGap) {
          best = m
          bestGap = gap
        }
        if (gap > 0.6) break
      }
      return { ...best, r }
    }

    /** Add or retire bulk objects so the live count matches the target. Newest leave first. */
    const reconcile = <M extends Mover>(list: M[], target: number, make: () => M) => {
      const live = list.filter((m) => !m.leaving)
      for (let i = live.length; i < target; i++) list.push(make())
      for (let i = live.length - 1; i >= target; i--) live[i].leaving = true
    }

    const step = (dt: number) => {
      const p = propsRef.current
      const fade = reduceMotion ? 1 : Math.min(1, FADE * dt)

      // interface
      const filled = Math.round(Math.min(1, Math.max(0, p.coverage)) * N_SLOTS)
      SLOT_ORDER.forEach((slot, i) => {
        const target = i < filled ? 1 : 0
        slotAlpha[slot] += (target - slotAlpha[slot]) * (reduceMotion ? 1 : Math.min(1, FADE * 1.6 * dt))
      })

      const L = tailLength(p.tail)
      const micR = L + headRadius(p.head) * 0.9
      reconcile(monos, p.monomers, () => randomMover(L + 0.4))
      // Bigger micelles (long tails, bulky heads) leave room for fewer, so the cap scales with their size.
      const fit = Math.floor((0.3 * (W - 2 * WALL) * (BOTTOM - bulkTop)) / (Math.PI * (micR + 0.3) ** 2))
      reconcile(mics, Math.min(MAX_MICELLES, fit, p.micelles), () => newMicelle(micR))

      const moving = !p.paused && !reduceMotion
      for (const list of [monos, mics] as Mover[][]) {
        for (let i = list.length - 1; i >= 0; i--) {
          const m = list[i]
          m.alpha += ((m.leaving ? 0 : 1) - m.alpha) * fade
          if (m.leaving && m.alpha < 0.02) {
            list.splice(i, 1)
            continue
          }
          if (!moving) continue
          // Slow random walk: micelles are bigger, so they wander more slowly (as in the D plot).
          const isMic = list === mics
          const kick = isMic ? 0.35 : 1.4
          m.vx += (Math.random() - 0.5) * kick * dt * 8 - m.vx * dt * 2
          m.vy += (Math.random() - 0.5) * kick * dt * 8 - m.vy * dt * 2
          m.x += m.vx * dt
          m.y += m.vy * dt
          m.angle += m.spin * dt * (isMic ? 0.4 : 1)
          const margin = isMic ? (m as Mover & { r: number }).r + 0.2 : L + 0.4
          if (m.x < WALL + margin) (m.x = WALL + margin), (m.vx = Math.abs(m.vx))
          if (m.x > W - WALL - margin) (m.x = W - WALL - margin), (m.vx = -Math.abs(m.vx))
          if (m.y < bulkTop + margin) (m.y = bulkTop + margin), (m.vy = Math.abs(m.vy))
          if (m.y > BOTTOM - margin) (m.y = BOTTOM - margin), (m.vy = -Math.abs(m.vy))
        }
      }
      // Micelle size follows the tail length (the core radius is about one stretched tail).
      for (const m of mics) m.r = micR
      // Micelles do not overlap: push overlapping pairs apart (gently, so it reads as a nudge).
      const push = reduceMotion ? 1 : Math.min(1, 4 * dt)
      for (let i = 0; i < mics.length; i++)
        for (let j = i + 1; j < mics.length; j++) {
          const a = mics[i]
          const b = mics[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy) || 1e-6
          const overlap = a.r + b.r + 0.2 - d
          if (overlap <= 0) continue
          const k = (overlap / 2) * push
          a.x -= (dx / d) * k
          a.y -= (dy / d) * k
          b.x += (dx / d) * k
          b.y += (dy / d) * k
        }
      for (const m of mics) {
        m.x = Math.min(W - WALL - m.r - 0.2, Math.max(WALL + m.r + 0.2, m.x))
        m.y = Math.min(BOTTOM - m.r - 0.2, Math.max(bulkTop + m.r + 0.2, m.y))
      }
    }

    // ---------- drawing ----------

    const headFill = (h: HeadType): [string, string] =>
      h === 'anionic' ? [theme.data2, theme.data2]
      : h === 'cationic' ? [theme.data1, theme.data1]
      : h === 'nonionic' ? [theme.layer2, theme.layer2]
      : [theme.data1, theme.data2] // zwitterion: both charges on one head

    /** One surfactant: head centred at (x, y), tail pointing along angle `a` (radians, 0 = +x). */
    const molecule = (x: number, y: number, a: number, alpha: number, h: HeadType, n: number) => {
      if (alpha <= 0.01) return
      const s = scale
      const rh = headRadius(h)
      const L = tailLength(n)
      ctx.globalAlpha = alpha
      // tail: zigzag carbon chain
      const ux = Math.cos(a)
      const uy = Math.sin(a)
      const amp = 0.09
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const d = rh + (L * i) / n
        const z = i === 0 ? 0 : (i % 2 ? amp : -amp)
        const px = (x + ux * d - uy * z) * s
        const py = (y + uy * d + ux * z) * s
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.strokeStyle = theme.muted
      ctx.lineWidth = Math.max(1, s * 0.07)
      ctx.lineJoin = 'round'
      ctx.stroke()
      // head
      const [c1, c2] = headFill(h)
      ctx.beginPath()
      ctx.arc(x * s, y * s, rh * s, 0, Math.PI * 2)
      ctx.fillStyle = c1
      ctx.fill()
      if (c1 !== c2) {
        ctx.beginPath()
        ctx.arc(x * s, y * s, rh * s, a + Math.PI / 2, a - Math.PI / 2)
        ctx.closePath()
        ctx.fillStyle = c2
        ctx.fill()
      }
      ctx.lineWidth = 1
      ctx.strokeStyle = theme.plotBg
      ctx.beginPath()
      ctx.arc(x * s, y * s, rh * s, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    let time = 0
    const draw = () => {
      const p = propsRef.current
      const s = scale
      ctx.clearRect(0, 0, cssW, cssH)

      // air and water
      ctx.fillStyle = theme.plotBg
      ctx.fillRect(0, 0, cssW, cssH)
      ctx.fillStyle = theme.data1
      ctx.globalAlpha = 0.1
      ctx.fillRect(WALL * s, AIR * s, (W - 2 * WALL) * s, (BOTTOM - AIR) * s)
      ctx.globalAlpha = 1

      // interface line
      ctx.strokeStyle = theme.data1
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(WALL * s, AIR * s)
      ctx.lineTo((W - WALL) * s, AIR * s)
      ctx.stroke()

      // beaker
      ctx.strokeStyle = theme.axis
      ctx.lineWidth = Math.max(2, s * 0.12)
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(WALL * s, 0.6 * s)
      ctx.lineTo(WALL * s, BOTTOM * s)
      ctx.lineTo((W - WALL) * s, BOTTOM * s)
      ctx.lineTo((W - WALL) * s, 0.6 * s)
      ctx.stroke()

      // labels
      const fontPx = Math.max(10, Math.min(13, s * 0.5))
      ctx.font = `600 ${fontPx}px "Source Sans 3", Helvetica, Arial, sans-serif`
      ctx.fillStyle = theme.muted
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      ctx.fillText('AIR', (WALL + 0.4) * s, 0.7 * s)
      ctx.textBaseline = 'bottom'
      ctx.fillText('WATER', (WALL + 0.4) * s, (BOTTOM - 0.25) * s)

      // interface molecules: head just below the surface, tail up into the air. A sparse surface lets the
      // tails lie over; a packed one makes them stand up.
      const tilt = (1 - Math.min(1, p.coverage)) * 0.75
      for (let i = 0; i < N_SLOTS; i++) {
        const a = slotAlpha[i]
        if (a < 0.01) continue
        const x = WALL + 0.5 + SLOT_W * (i + 0.5)
        const wob = reduceMotion ? 0 : 0.08 * Math.sin(time * 1.3 + i * 2.1)
        const lean = tilt * (0.7 + 0.3 * Math.sin(i * 1.7)) + wob // all lean the same way, like grass in a breeze
        molecule(x, AIR + headRadius(p.head) * 0.55, -Math.PI / 2 + lean, a, p.head, p.tail)
      }

      // free monomers
      for (const m of monos) molecule(m.x, m.y, m.angle, m.alpha, p.head, p.tail)

      // micelles: heads on the outside facing water, tails meeting in the core
      for (const m of mics) {
        const rh = headRadius(p.head)
        const count = Math.max(8, Math.round((2 * Math.PI * m.r) / (rh * 2.15)))
        for (let k = 0; k < count; k++) {
          const a = m.angle + (k * 2 * Math.PI) / count
          const hx = m.x + Math.cos(a) * m.r
          const hy = m.y + Math.sin(a) * m.r
          molecule(hx, hy, a + Math.PI, m.alpha, p.head, p.tail)
        }
      }
    }

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!propsRef.current.paused) time += dt
      step(dt)
      draw()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      offTheme()
    }
  }, [])

  return (
    <div ref={wrapRef} className="surface-wrap">
      <canvas ref={canvasRef} className="surface-canvas" role="img" aria-label={label} />
    </div>
  )
}
