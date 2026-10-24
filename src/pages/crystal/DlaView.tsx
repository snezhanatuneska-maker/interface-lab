import { useEffect, useRef } from 'react'
import { onThemeChange, readThemeColors } from '../../lib/themeColors'
import { stickProbability } from '../../lib/crystal'

// On-lattice diffusion-limited growth with a sticking probability (a simple kinetic Monte Carlo).
// One random walker at a time leaves a circle just outside the crystal and walks on the square lattice.
// At a kink (two or more crystal neighbours) it always sticks; touching by a single bond it sticks with
// probability p(S), otherwise it keeps walking. p = 1 is classic DLA: tips catch the walkers first and the
// crystal branches. Small p means growth mostly at kinks, as in surface-reaction control: compact.
//
// Stirring (thin diffusion layer): the solution is well mixed up to DELTA cells from the crystal, so walkers
// start anywhere in that thin layer, and one that wanders for MIX_STEPS is mixed back into it.

const N = 181 // lattice cells per side
const C = (N - 1) / 2
const MAX_PARTICLES = 3500
const STEPS_PER_FRAME = 40000 // walker steps per frame: bounded work, smooth on a phone
const LAUNCH_GAP = 5
const KILL_GAP = 25
const DELTA = 3
const MIX_STEPS = 60
const BAND = 350 // particles per colour band (growth history)
const REPORT_EVERY = 150 // ms

export interface DlaStats {
  count: number
  /** Share of the bounding disc that is filled: about 1 for a compact crystal, low for dendrites. */
  compactness: number
  done: boolean
}

interface Props {
  S: number
  stirring: boolean
  paused: boolean
  onStats: (s: DlaStats) => void
  label: string
}

export default function DlaView({ S, stirring, paused, onStats, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const props = useRef({ S, stirring, paused, onStats })
  props.current = { S, stirring, paused, onStats }

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let theme = readThemeColors()

    const grid = new Uint8Array(N * N)
    const inLayer = new Uint8Array(N * N)
    const layer: number[] = [] // empty cells within DELTA of the crystal (lazily cleaned)
    const cells: number[] = [] // attached cells in order
    let rMax = 0
    let full = false

    // ---------- drawing (incremental: each new cell is painted once) ----------
    let css = 0
    let cell = 1
    let painted = 0
    const paint = (from: number) => {
      for (let i = from; i < cells.length; i++) {
        const k = cells[i]
        ctx.fillStyle = i === 0 ? theme.data2 : Math.floor(i / BAND) % 2 ? theme.layer2 : theme.layer1
        ctx.fillRect((k % N) * cell, Math.floor(k / N) * cell, cell + 0.35, cell + 0.35)
      }
      painted = cells.length
    }
    const repaint = () => {
      ctx.fillStyle = theme.plotBg
      ctx.fillRect(0, 0, css, css)
      paint(0)
    }
    const resize = () => {
      css = Math.min(wrap.clientWidth, 420)
      cell = css / N
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(css * dpr)
      canvas.height = Math.round(css * dpr)
      canvas.style.width = `${css}px`
      canvas.style.height = `${css}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      repaint()
    }
    const offTheme = onThemeChange(() => {
      theme = readThemeColors()
      repaint()
    })

    // ---------- growth ----------
    const attach = (k: number) => {
      grid[k] = 1
      cells.push(k)
      const x = k % N
      const y = (k - x) / N
      rMax = Math.max(rMax, Math.hypot(x - C, y - C))
      for (let dy = -DELTA; dy <= DELTA; dy++)
        for (let dx = -DELTA; dx <= DELTA; dx++) {
          if (dx * dx + dy * dy > DELTA * DELTA) continue
          const xx = x + dx
          const yy = y + dy
          if (xx < 1 || yy < 1 || xx >= N - 1 || yy >= N - 1) continue
          const j = yy * N + xx
          if (!grid[j] && !inLayer[j]) {
            inLayer[j] = 1
            layer.push(j)
          }
        }
      if (cells.length >= MAX_PARTICLES || rMax + LAUNCH_GAP + 2 >= C) full = true
    }
    attach(C * N + C)

    let wx = 0
    let wy = 0
    let walking = false
    let walked = 0

    const launch = () => {
      walked = 0
      walking = true
      if (props.current.stirring) {
        // a random empty cell of the thin, well-mixed layer
        for (;;) {
          const i = Math.floor(Math.random() * layer.length)
          const k = layer[i]
          if (!grid[k]) {
            wx = k % N
            wy = (k - wx) / N
            return
          }
          layer[i] = layer[layer.length - 1]
          layer.pop()
        }
      }
      const a = Math.random() * Math.PI * 2
      const r = rMax + LAUNCH_GAP
      wx = Math.round(C + r * Math.cos(a))
      wy = Math.round(C + r * Math.sin(a))
    }

    const bonds = (k: number) => grid[k - 1] + grid[k + 1] + grid[k - N] + grid[k + N]

    const grow = () => {
      const p = stickProbability(props.current.S)
      const stir = props.current.stirring
      const kill2 = (rMax + KILL_GAP) ** 2
      for (let s = 0; s < STEPS_PER_FRAME && !full; s++) {
        if (!walking) launch()
        const k = wy * N + wx
        const n = bonds(k)
        if (n >= 2 || (n === 1 && Math.random() < p)) {
          attach(k)
          walking = false
          continue
        }
        const dir = (Math.random() * 4) | 0
        const nx = wx + (dir === 0 ? 1 : dir === 1 ? -1 : 0)
        const ny = wy + (dir === 2 ? 1 : dir === 3 ? -1 : 0)
        if (!grid[ny * N + nx]) {
          wx = nx
          wy = ny
        }
        walked++
        const dx = wx - C
        const dy = wy - C
        if (dx * dx + dy * dy > kill2 || wx < 1 || wy < 1 || wx >= N - 1 || wy >= N - 1 || (stir && walked > MIX_STEPS))
          walking = false
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    let lastReport = 0
    const frame = (now: number) => {
      if (!props.current.paused) grow()
      if (cells.length > painted) paint(painted)
      if (now - lastReport > REPORT_EVERY) {
        lastReport = now
        const disc = Math.PI * (rMax + 0.5) ** 2
        props.current.onStats({ count: cells.length, compactness: Math.min(1, cells.length / disc), done: full })
      }
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
    <div ref={wrapRef} className="crystal-wrap">
      <canvas ref={canvasRef} className="crystal-canvas" role="img" aria-label={label} />
    </div>
  )
}
