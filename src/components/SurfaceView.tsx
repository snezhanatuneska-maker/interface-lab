import { useEffect, useRef } from 'react'
import { C_BET, K_LANGMUIR, type Model } from '../lib/adsorption'

// Animated cross-section of a solid with N_SITES adsorption sites and the gas above it.
// Kinetic model: gas molecules fly in straight lines with Maxwell–Boltzmann speeds and
// bounce elastically off the walls; the top edge opens to a gas reservoir at pressure P. A molecule hitting a free site (or, for BET, the top
// of a stack) sticks with probability STICK; adsorbed molecules desorb at random with a
// rate set by their binding. Rates are calibrated so the steady state follows the
// Langmuir / BET isotherms at the current pressure.
//
// World coordinates are in molecule diameters: x runs left → right, y runs up from
// the surface (y = 0). Layer L (0-based) is centred at y = L + 0.5.

export const N_SITES = 24

/** Molecule colours by layer: layer 1, layer 2, layer 3+. */
export const LAYER_COLORS = ['#1f3a5f', '#3f8f8a', '#f2c14e']
export const GAS_COLOR = '#b4bac6'

const MAX_LAYERS = 8 // layers drawn; taller stacks get a "+n" label
const MARGIN = 0.5
const GUTTER = 2.2 // room on the right for the "monolayer" label
const SOLID = 1.1
const HEADROOM = 5
const TOP = MAX_LAYERS + HEADROOM // ceiling of the gas region (world units)
const BOX_W = MARGIN + N_SITES + MARGIN
const WORLD_W = BOX_W + GUTTER
const R = 0.46 // molecule radius

// Speed and density set the wall flux, and with it every adsorption/desorption rate:
// RATE ≈ 1.6 /s.
const MEAN_SPEED = 10 // diameters per second
const SIGMA = MEAN_SPEED / Math.sqrt(Math.PI / 2) // 2D Maxwell–Boltzmann (Rayleigh) scale
const GAS_DENSITY = 0.5 // molecules per unit area at P/P₀ = 1
const STICK = 1 // sticking probability per hit
const MAX_SUBSTEP = 1 / 125 // s; keeps fast molecules from skipping over a stack in one step
// Adsorption rate per site per unit P/P₀: sticking × wall flux (2D: n·<v>/π).
const RATE = (STICK * GAS_DENSITY * MEAN_SPEED) / Math.PI
// Desorption rates (per second) of the top molecule of a stack. Upper layers are
// liquid-like (P₀ is where adsorption onto them balances desorption); the first layer
// binds more strongly by a factor K (Langmuir) or c (BET).
const K_DES_UPPER = RATE
const kDesFirst = (mode: Model) => RATE / (mode === 'langmuir' ? K_LANGMUIR : C_BET)
// A spot vacated by desorption is empty of gas until molecules fly in, so its next adsorption comes
// on average a short delay (~π/2v̄) later than 1/(RATE·P). That delay is measured per layer while the
// simulation runs (forgetting window DELAY_TAU, prior below) and desorption is slowed by the same
// factor, which keeps detailed balance, and the steady state, on the isotherm.
const DELAY_PRIOR = Math.PI / (2 * MEAN_SPEED)
const DELAY_PRIOR_HITS = 20
const DELAY_TAU = 120 // s

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

export interface SurfaceStats {
  occupied: number // sites with at least one molecule
  total: number // adsorbed molecules
  tallest: number
  avgLoading: number // time-averaged θ or n/nm
}

const siteX = (site: number) => MARGIN + site + 0.5
const layerColor = (layer: number) => LAYER_COLORS[Math.min(layer, LAYER_COLORS.length - 1)]

function randomGas(x: number, y: number): Particle {
  const a = Math.random() * Math.PI * 2
  const v = SIGMA * Math.sqrt(-2 * Math.log(1 - Math.random()))
  return { x, y, vx: v * Math.cos(a), vy: v * Math.sin(a) }
}

const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())

/** Molecule entering from a wall (dir = 1 up, -1 down): flux-weighted speed and cosine-law angle. */
function wallGas(x: number, y: number, dir: 1 | -1): Particle {
  const v = SIGMA * Math.hypot(gauss(), gauss(), gauss())
  const a = Math.asin(2 * Math.random() - 1)
  return { x, y, vx: v * Math.sin(a), vy: dir * v * Math.cos(a) }
}

interface Props {
  mode: Model
  pressure: number // relative pressure 0..1, sets the gas density
  label: string
  onStats?: (s: SurfaceStats) => void
}

export default function SurfaceView({ mode, pressure, label, onStats }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  const pressureRef = useRef(pressure)
  const onStatsRef = useRef(onStats)
  modeRef.current = mode
  pressureRef.current = pressure
  onStatsRef.current = onStats

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let scale = 1 // CSS px per molecule diameter
    const top = TOP
    let cssW = 0
    let cssH = 0

    const resize = () => {
      cssW = wrap.clientWidth
      scale = cssW / WORLD_W
      cssH = Math.round((top + SOLID) * scale)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const landed: number[] = new Array(N_SITES).fill(0) // clean surface
    const columnTop = (x: number) => {
      const site = Math.floor(x - MARGIN)
      if (site < 0 || site >= N_SITES) return 0
      return Math.min(landed[site], MAX_LAYERS)
    }
    const left = R
    const right = BOX_W - R
    const ceiling = top - R
    // Start with an equilibrium gas: density proportional to pressure.
    const particles: Particle[] = Array.from({ length: Math.round(GAS_DENSITY * pressureRef.current * (right - left) * (ceiling - R)) }, () =>
      randomGas(left + Math.random() * (right - left), R + Math.random() * (ceiling - R)),
    )
    let spawnBudget = 0
    let lastPressure = pressureRef.current
    const waitExcess: number[] = new Array(MAX_LAYERS + 1).fill(0) // Σ (exposed time − 1/(RATE·P) per hit), by layer
    const hits: number[] = new Array(MAX_LAYERS + 1).fill(0)
    let avgLoading = 0
    let statsTimer = 0
    let time = 0

    const step = (dt: number) => {
      const mode = modeRef.current
      time += dt

      // 1. Random desorption of the top molecule of each stack (rate corrected for the refill delay).
      const P = pressureRef.current
      const forget = 1 - dt / DELAY_TAU
      for (let c = 0; c <= MAX_LAYERS; c++) {
        waitExcess[c] *= forget
        hits[c] *= forget
      }
      const kFirst = kDesFirst(mode)
      for (let s = 0; s < N_SITES; s++) {
        const h = landed[s]
        if (P > 0.005 && (mode === 'bet' || h === 0)) waitExcess[Math.min(h, MAX_LAYERS)] += dt
        if (h === 0) continue
        const c = Math.min(h - 1, MAX_LAYERS)
        const delay = Math.max(0, (waitExcess[c] + DELAY_PRIOR * DELAY_PRIOR_HITS) / (hits[c] + DELAY_PRIOR_HITS))
        if (Math.random() >= ((h === 1 ? kFirst : K_DES_UPPER) / (1 + RATE * P * delay)) * dt) continue
        landed[s]--
        particles.push(wallGas(siteX(s), Math.min(h, MAX_LAYERS) - 0.5, 1))
      }

      // 2a. Pressure changed: bring the gas count to the new equilibrium at once. Extra
      // molecules stream in through the open top edge; surplus ones leave through it.
      if (pressureRef.current !== lastPressure) {
        lastPressure = pressureRef.current
        let freeArea = (right - left) * (ceiling - R)
        for (let s = 0; s < N_SITES; s++) freeArea -= Math.min(landed[s], MAX_LAYERS)
        const target = Math.round(GAS_DENSITY * lastPressure * freeArea)
        while (particles.length < target) particles.push(wallGas(left + Math.random() * (right - left), ceiling, -1))
        if (particles.length > target) {
          particles.sort((a, b) => a.y - b.y) // highest last: those nearest the opening exit first
          particles.length = target
        }
      }

      // 2b. Reservoir: molecules enter through the top at the equilibrium flux for pressure P.
      spawnBudget += dt * GAS_DENSITY * pressureRef.current * (MEAN_SPEED / Math.PI) * (right - left)
      while (spawnBudget >= 1) {
        particles.push(wallGas(left + Math.random() * (right - left), ceiling, -1))
        spawnBudget -= 1
      }

      // 3. Straight-line flight with elastic wall collisions; sticking on surface hits.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        const y0 = p.y
        const nx = p.x + p.vx * dt
        // Side of a taller neighbouring stack acts as a wall.
        if (p.y < columnTop(nx) + R && p.y >= columnTop(p.x) + R) p.vx = -p.vx
        else p.x = nx
        p.y += p.vy * dt
        if (p.x < left) {
          p.x = left
          p.vx = Math.abs(p.vx)
        } else if (p.x > right) {
          p.x = right
          p.vx = -Math.abs(p.vx)
        }
        const floor = columnTop(p.x) + R
        if (p.y < floor && p.vy < 0) {
          const site = Math.floor(p.x - MARGIN)
          const free = site >= 0 && site < N_SITES && (mode === 'bet' || landed[site] === 0)
          // Only a molecule arriving from above can stick; one engulfed by a stack that just grew is pushed out.
          if (free && y0 >= floor && Math.random() < STICK) {
            if (P > 0.005) {
              const c = Math.min(landed[site], MAX_LAYERS)
              hits[c]++
              waitExcess[c] -= 1 / (RATE * P)
            }
            landed[site]++
            particles.splice(i, 1)
            continue
          }
          p.y = 2 * floor - p.y
          p.vy = -p.vy
        }
        if (p.y > ceiling) particles.splice(i, 1) // back into the reservoir
      }

      // 4. Report a time-averaged loading (~3 s window) to the page.
      let total = 0
      let occupied = 0
      let tallest = 0
      for (const h of landed) {
        total += h
        if (h > 0) occupied++
        tallest = Math.max(tallest, h)
      }
      avgLoading += ((total / N_SITES - avgLoading) * dt) / 3
      statsTimer += dt
      if (statsTimer > 0.25) {
        statsTimer = 0
        onStatsRef.current?.({ occupied, total, tallest, avgLoading })
      }
    }

    const toPx = (x: number, y: number): [number, number] => [x * scale, (top - y) * scale]

    const circle = (x: number, y: number, fill: string, stroke: string) => {
      const [px, py] = toPx(x, y)
      ctx.beginPath()
      ctx.arc(px, py, R * scale, 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = stroke
      ctx.stroke()
    }

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH)
      const surfaceY = top * scale
      const sitesEnd = (MARGIN + N_SITES) * scale

      // gas region
      const grad = ctx.createLinearGradient(0, 0, 0, surfaceY)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(1, '#f2f4f8')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, cssW, surfaceY)

      // solid with hatching
      ctx.fillStyle = '#ece9e1'
      ctx.fillRect(0, surfaceY, cssW, cssH - surfaceY)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, surfaceY, cssW, cssH - surfaceY)
      ctx.clip()
      ctx.strokeStyle = '#c9c4b6'
      ctx.lineWidth = 1.2
      const hatch = Math.max(6, scale * 0.3)
      ctx.beginPath()
      for (let hx = -cssH; hx < cssW + cssH; hx += hatch) {
        ctx.moveTo(hx, cssH)
        ctx.lineTo(hx + (cssH - surfaceY), surfaceY)
      }
      ctx.stroke()
      ctx.restore()
      ctx.strokeStyle = '#8a8578'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(cssW, surfaceY)
      ctx.stroke()

      // adsorption sites
      ctx.beginPath()
      for (let s = 0; s < N_SITES; s++) {
        const cx = siteX(s) * scale
        ctx.moveTo(cx - 0.32 * scale, surfaceY)
        ctx.quadraticCurveTo(cx, surfaceY + 0.32 * scale, cx + 0.32 * scale, surfaceY)
      }
      ctx.stroke()

      const fontPx = Math.max(10, Math.min(13, scale * 0.42))
      ctx.font = `600 ${fontPx}px "Source Sans 3", Helvetica, Arial, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#5b6475'
      ctx.fillText('SOLID ADSORBENT', (MARGIN + N_SITES / 2) * scale, surfaceY + (cssH - surfaceY) / 2 + 1)

      // monolayer guide
      const mlY = (top - 1) * scale
      ctx.save()
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = '#5b6475'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(MARGIN * scale * 0.5, mlY)
      ctx.lineTo(sitesEnd + 4, mlY)
      ctx.stroke()
      ctx.restore()
      ctx.textAlign = 'left'
      ctx.font = `${fontPx}px "Source Sans 3", Helvetica, Arial, sans-serif`
      ctx.fillText(GUTTER * scale > 64 ? 'monolayer' : 'ML', sitesEnd + 6, mlY)

      // adsorbed molecules
      const stroke = 'rgba(29, 36, 51, 0.35)'
      const amp = reduceMotion ? 0 : 0.05 // small thermal vibration about the binding site
      for (let s = 0; s < N_SITES; s++) {
        const h = landed[s]
        for (let layer = 0; layer < Math.min(h, MAX_LAYERS); layer++) {
          const dx = amp * Math.sin(time * 23 + s * 1.7 + layer * 2.3)
          const dy = amp * Math.sin(time * 19 + s * 2.9 + layer * 1.1)
          circle(siteX(s) + dx, layer + 0.5 + dy, layerColor(layer), stroke)
        }
        if (h > MAX_LAYERS) {
          const [px, py] = toPx(siteX(s), MAX_LAYERS + 0.45)
          ctx.textAlign = 'center'
          ctx.fillStyle = '#c4552b'
          ctx.font = `700 ${fontPx}px "Source Sans 3", Helvetica, Arial, sans-serif`
          ctx.fillText(`+${h - MAX_LAYERS}`, px, py)
        }
      }

      // gas molecules
      for (const p of particles) circle(p.x, p.y, GAS_COLOR, 'rgba(29, 36, 51, 0.25)')
    }

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const n = Math.ceil(dt / MAX_SUBSTEP)
      for (let k = 0; k < n; k++) step(dt / n)
      draw()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className="surface-wrap">
      <canvas ref={canvasRef} className="surface-canvas" role="img" aria-label={label} />
    </div>
  )
}
