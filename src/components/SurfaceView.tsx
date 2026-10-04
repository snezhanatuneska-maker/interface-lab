import { useEffect, useRef } from 'react'

// Animated cross-section of a solid with N_SITES adsorption sites and the gas above it.
// The page computes how many molecules should sit on each site (`targets`); this
// component animates gas molecules landing on / leaving the sites until the picture
// matches, and keeps a slow exchange going so the equilibrium looks alive.
//
// World coordinates are in molecule diameters: x runs left → right, y runs up from
// the surface (y = 0). Layer L (0-based) is centred at y = L + 0.5.

export const N_SITES = 24
// Fixed, scrambled order in which sites get occupied, so molecules appear in a
// natural-looking pattern and stay put as the pressure changes.
export const SITE_ORDER = [7, 18, 2, 13, 21, 9, 0, 15, 5, 11, 23, 3, 17, 8, 20, 1, 12, 22, 6, 14, 4, 19, 10, 16]

/** Molecule colours by layer: layer 1, layer 2, layer 3+. */
export const LAYER_COLORS = ['#1f3a5f', '#3f8f8a', '#f2c14e']
export const GAS_COLOR = '#b4bac6'

const MAX_LAYERS = 8 // layers drawn; taller stacks get a "+n" label
const MARGIN = 0.5
const GUTTER = 2.2 // room on the right for the "monolayer" label
const SOLID = 1.1
const WORLD_W = MARGIN + N_SITES + GUTTER
const R = 0.46 // molecule radius
const GAS_SPEED = 4 // diameters per second
const FLY_SPEED = 12
const GAS_MIN = 2
const GAS_MAX = 36
// Spontaneous desorption rates of the top molecule of a stack, per second.
// Layer 1 is bound to the solid and leaves rarely; upper layers exchange faster.
const K_DES_FIRST = 0.06
const K_DES_UPPER = 0.45

type State = 'gas' | 'landing' | 'leaving'
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  state: State
  site: number // target site while landing
}

interface Sim {
  landed: number[]
  inflight: (Particle | null)[]
  particles: Particle[]
  addBudget: number
  spawnBudget: number
}

const siteX = (site: number) => MARGIN + site + 0.5
const layerColor = (layer: number) => LAYER_COLORS[Math.min(layer, LAYER_COLORS.length - 1)]

function randomGas(x: number, y: number, speed = GAS_SPEED): Particle {
  const a = Math.random() * Math.PI * 2
  const v = speed * (0.6 + 0.8 * Math.random())
  return { x, y, vx: v * Math.cos(a), vy: v * Math.sin(a), state: 'gas', site: -1 }
}

interface Props {
  targets: number[] // molecules per site, length N_SITES
  pressure: number // relative pressure 0..1, sets the gas density
  label: string
}

export default function SurfaceView({ targets, pressure, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetsRef = useRef(targets)
  const pressureRef = useRef(pressure)
  targetsRef.current = targets
  pressureRef.current = pressure

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let scale = 1 // CSS px per molecule diameter
    let headroom = 2.5
    let top = MAX_LAYERS + headroom // ceiling of the gas region (world units)
    let cssW = 0
    let cssH = 0

    const resize = () => {
      cssW = wrap.clientWidth
      scale = cssW / WORLD_W
      headroom = cssW < 600 ? 8 : 2.5 // taller gas region on phones so the hero stays readable
      top = MAX_LAYERS + headroom
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

    // Start in equilibrium so the first frame already matches the curve.
    const gasTarget = () => Math.round(GAS_MIN + (GAS_MAX - GAS_MIN) * pressureRef.current)
    const sim: Sim = {
      landed: [...targetsRef.current],
      inflight: new Array(N_SITES).fill(null),
      particles: Array.from({ length: gasTarget() }, () =>
        randomGas(MARGIN + Math.random() * N_SITES, MAX_LAYERS * 0.6 + Math.random() * (top - MAX_LAYERS * 0.6)),
      ),
      addBudget: 0,
      spawnBudget: 0,
    }

    const columnTop = (x: number) => {
      const site = Math.floor(x - MARGIN)
      if (site < 0 || site >= N_SITES) return 0
      return Math.min(sim.landed[site], MAX_LAYERS)
    }

    const desorb = (site: number) => {
      const layer = Math.min(sim.landed[site], MAX_LAYERS) - 1
      sim.landed[site]--
      const p = randomGas(siteX(site), layer + 0.5)
      p.vy = Math.abs(p.vy) + 1.5
      sim.particles.push(p)
    }

    const step = (dt: number) => {
      const targets = targetsRef.current
      const { landed, inflight, particles } = sim

      if (reduceMotion) {
        for (let s = 0; s < N_SITES; s++) landed[s] = targets[s]
      }

      // 1. Too many molecules on a site: call off incoming ones, then desorb from the top.
      let deficit = 0
      for (let s = 0; s < N_SITES; s++) {
        const f = inflight[s]
        if (f && landed[s] + 1 > targets[s]) {
          f.state = 'gas'
          inflight[s] = null
        }
        if (landed[s] > targets[s] && Math.random() < dt * 8) desorb(s)
        deficit += Math.max(0, targets[s] - landed[s] - (inflight[s] ? 1 : 0))
      }

      // 2. Too few: send gas molecules down, one at a time per site so stacks grow bottom-up.
      sim.addBudget = Math.min(sim.addBudget + dt * Math.max(4, deficit * 2.5), N_SITES)
      if (deficit === 0) sim.addBudget = 0
      while (sim.addBudget >= 1) {
        const open: number[] = []
        for (let s = 0; s < N_SITES; s++) if (!inflight[s] && landed[s] < targets[s]) open.push(s)
        if (open.length === 0) break
        const site = open[Math.floor(Math.random() * open.length)]
        sim.addBudget -= 1
        if (landed[site] >= MAX_LAYERS) {
          // Hidden part of a tall stack (shown as "+n"): no flight needed.
          landed[site]++
          continue
        }
        const tx = siteX(site)
        let best: Particle | null = null
        let bestD = Infinity
        for (const p of particles) {
          if (p.state !== 'gas') continue
          const d = Math.abs(p.x - tx) + Math.abs(p.y - landed[site])
          if (d < bestD) {
            bestD = d
            best = p
          }
        }
        if (!best) {
          best = randomGas(tx, top - 0.5)
          particles.push(best)
        }
        best.state = 'landing'
        best.site = site
        inflight[site] = best
      }

      // 3. Dynamic equilibrium: top molecules occasionally desorb and get replaced.
      if (!reduceMotion) {
        for (let s = 0; s < N_SITES; s++) {
          if (landed[s] === 0 || inflight[s]) continue
          const k = landed[s] === 1 ? K_DES_FIRST : K_DES_UPPER
          if (Math.random() < k * dt) desorb(s)
        }
      }

      // 4. Keep the gas density in line with the pressure: extra molecules leave
      // through the top, missing ones arrive from above.
      let gasCount = 0
      for (const p of particles) if (p.state === 'gas') gasCount++
      const want = gasTarget()
      if (gasCount > want) {
        let extra = gasCount - want
        for (const p of particles) {
          if (extra === 0) break
          if (p.state === 'gas' && p.y > MAX_LAYERS * 0.5) {
            p.state = 'leaving'
            p.vy = Math.abs(p.vy) + 1
            extra--
          }
        }
      } else if (gasCount < want) {
        sim.spawnBudget = Math.min(sim.spawnBudget + dt * 25, want - gasCount)
        while (sim.spawnBudget >= 1) {
          const p = randomGas(MARGIN + Math.random() * N_SITES, top - 0.5)
          p.vy = -Math.abs(p.vy)
          particles.push(p)
          sim.spawnBudget -= 1
        }
      }

      // 5. Move everything.
      const left = R
      const right = MARGIN + N_SITES + MARGIN - R
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        if (p.state === 'landing') {
          const layer = Math.min(landed[p.site], MAX_LAYERS - 1)
          const tx = siteX(p.site)
          const ty = layer + 0.5
          const dx = tx - p.x
          const dy = ty - p.y
          const dist = Math.hypot(dx, dy)
          const move = reduceMotion ? Infinity : FLY_SPEED * dt
          if (dist <= move) {
            landed[p.site]++
            inflight[p.site] = null
            particles.splice(i, 1)
          } else {
            p.x += (dx / dist) * move
            p.y += (dy / dist) * move
          }
          continue
        }
        if (reduceMotion) continue
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < left) {
          p.x = left
          p.vx = Math.abs(p.vx)
        } else if (p.x > right) {
          p.x = right
          p.vx = -Math.abs(p.vx)
        }
        const floor = columnTop(p.x) + R
        if (p.y < floor) {
          p.y = floor
          p.vy = Math.abs(p.vy)
        }
        if (p.state === 'leaving') {
          if (p.y > top + 1) particles.splice(i, 1)
        } else if (p.y > top - R) {
          p.y = top - R
          p.vy = -Math.abs(p.vy)
        }
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
      for (let s = 0; s < N_SITES; s++) {
        const h = sim.landed[s]
        for (let layer = 0; layer < Math.min(h, MAX_LAYERS); layer++) circle(siteX(s), layer + 0.5, layerColor(layer), stroke)
        if (h > MAX_LAYERS) {
          const [px, py] = toPx(siteX(s), MAX_LAYERS + 0.45)
          ctx.textAlign = 'center'
          ctx.fillStyle = '#c4552b'
          ctx.font = `700 ${fontPx}px "Source Sans 3", Helvetica, Arial, sans-serif`
          ctx.fillText(`+${h - MAX_LAYERS}`, px, py)
        }
      }

      // gas molecules (including ones on their way to a site)
      for (const p of sim.particles) circle(p.x, p.y, GAS_COLOR, 'rgba(29, 36, 51, 0.25)')
    }

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      step(dt)
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
