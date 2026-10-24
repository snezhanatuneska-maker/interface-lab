import { useCallback, useEffect, useRef, useState } from 'react'
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas'
import type { ThemeColors } from '../../lib/themeColors'
import {
  cahnHilliardStep,
  CH_DT,
  nucleationProfile,
  PHI0_NUCLEATION,
  PHI0_SPINODAL,
  PROFILE_N,
  PROFILE_T_END,
  spinodalStart,
  toComposition,
} from '../../lib/phase'

const W = 420
const H = 210
const PAD = { l: 34, r: 10, t: 12, b: 34 }
const STRIP = 12 // composition strip under the profile
const SPEED = 12 // simulated time units per second
const MAX_STEPS = 60 // per frame, so a slow frame cannot run away

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Mixes two #rrggbb colors; f = 0 gives a, f = 1 gives b. */
function mix(a: string, b: string, f: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16)
  const ch = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * f)
  return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`
}

function draw(canvas: HTMLCanvasElement | null, phi: Float64Array, phi0: number, color: string, theme: ThemeColors) {
  if (!canvas) return
  const ctx = setupCanvas(canvas, W, H)
  if (!ctx) return
  const pw = W - PAD.l - PAD.r
  const ph = H - PAD.t - PAD.b - STRIP - 6
  const yOf = (p: number) => PAD.t + ph * (1 - (p + 1.15) / 2.3)
  const xOf = (i: number) => PAD.l + (i / (PROFILE_N - 1)) * pw

  ctx.fillStyle = theme.plotBg
  ctx.fillRect(0, 0, W, H)

  // Reference levels: x₁ and x₂ (dotted), x₀ (dashed).
  ctx.lineWidth = 1
  ctx.strokeStyle = theme.grid
  ctx.setLineDash([2, 3])
  for (const p of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(PAD.l, yOf(p))
    ctx.lineTo(PAD.l + pw, yOf(p))
    ctx.stroke()
  }
  ctx.strokeStyle = theme.muted
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(PAD.l, yOf(phi0))
  ctx.lineTo(PAD.l + pw, yOf(phi0))
  ctx.stroke()
  ctx.setLineDash([])

  // Axes and labels.
  ctx.strokeStyle = theme.axis
  ctx.beginPath()
  ctx.moveTo(PAD.l, PAD.t)
  ctx.lineTo(PAD.l, PAD.t + ph)
  ctx.lineTo(PAD.l + pw, PAD.t + ph)
  ctx.stroke()
  ctx.font = `13px ${CANVAS_FONT}`
  ctx.fillStyle = theme.text
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('x₂', PAD.l - 6, yOf(1))
  ctx.fillText('x₁', PAD.l - 6, yOf(-1))
  ctx.fillStyle = theme.muted
  ctx.fillText('x₀', PAD.l - 6, yOf(phi0))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('position →', PAD.l + pw / 2, H - 16)

  // Profile.
  ctx.strokeStyle = color
  ctx.lineWidth = 2.25
  ctx.lineJoin = 'round'
  ctx.beginPath()
  for (let i = 0; i < PROFILE_N; i++) {
    const y = yOf(Math.max(-1.15, Math.min(1.15, phi[i])))
    if (i === 0) ctx.moveTo(xOf(i), y)
    else ctx.lineTo(xOf(i), y)
  }
  ctx.stroke()

  // Composition strip: x₁-rich pale, x₂-rich dark (layer colors swap in the dark theme).
  const sy = PAD.t + ph + 6
  const cw = pw / PROFILE_N
  for (let i = 0; i < PROFILE_N; i++) {
    ctx.fillStyle = mix(theme.layer3, theme.layer1, Math.max(0, Math.min(1, (phi[i] + 1) / 2)))
    ctx.fillRect(PAD.l + i * cw, sy, cw + 0.5, STRIP)
  }
}

export default function ProfileAnimation({ theme }: { theme: ThemeColors }) {
  const nucRef = useRef<HTMLCanvasElement>(null)
  const spinRef = useRef<HTMLCanvasElement>(null)
  const seed = useRef(1)
  const sim = useRef({ t: 0, phi: spinodalStart(1) })
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)

  const render = useCallback(() => {
    const { t, phi } = sim.current
    draw(nucRef.current, nucleationProfile(t), PHI0_NUCLEATION, theme.data1, theme)
    draw(spinRef.current, phi, PHI0_SPINODAL, theme.data2, theme)
  }, [theme])

  useEffect(render, [render])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const mu = new Float64Array(PROFILE_N)
    const frame = (now: number) => {
      const s = sim.current
      const dtWall = Math.min((now - last) / 1000, 0.1)
      last = now
      const steps = Math.min(Math.round((dtWall * SPEED) / CH_DT), MAX_STEPS)
      for (let k = 0; k < steps && s.t < PROFILE_T_END; k++) {
        cahnHilliardStep(s.phi, CH_DT, mu)
        s.t += CH_DT
      }
      render()
      setT(s.t)
      if (s.t >= PROFILE_T_END) setPlaying(false)
      else raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [playing, render])

  const reset = () => {
    setPlaying(false)
    seed.current += 1
    sim.current = { t: 0, phi: spinodalStart(seed.current) }
    setT(0)
    render()
  }

  const done = t >= PROFILE_T_END
  const play = () => {
    if (done) reset()
    // Reduced motion: jump straight to the end state instead of animating.
    if (prefersReducedMotion()) {
      const s = sim.current
      const mu = new Float64Array(PROFILE_N)
      while (s.t < PROFILE_T_END) {
        cahnHilliardStep(s.phi, CH_DT, mu)
        s.t += CH_DT
      }
      setT(s.t)
      render()
      return
    }
    setPlaying((p) => !p)
  }

  return (
    <figure id="anim-figure" className="figure" aria-label="Concentration profiles of the two mechanisms">
      <div className="sim-grid phase-anim">
        <div className="plot-col">
          <h3 className="phase-anim-title nuc">Nucleation &amp; growth</h3>
          <p className="phase-anim-sub">x₀ in the metastable region</p>
          <canvas
            ref={nucRef}
            className="sim-canvas"
            role="img"
            aria-label="Nucleation and growth: a few nuclei jump sharply to x2, each with a depleted zone around it, and widen over time."
          />
        </div>
        <div className="plot-col">
          <h3 className="phase-anim-title spin">Spinodal decomposition</h3>
          <p className="phase-anim-sub">x₀ inside the spinodal</p>
          <canvas
            ref={spinRef}
            className="sim-canvas"
            role="img"
            aria-label="Spinodal decomposition: small fluctuations everywhere grow smoothly at a fixed wavelength until they reach x1 and x2."
          />
        </div>
      </div>
      <div className="figure-controls phase-anim-controls">
        <div className="sim-buttons">
          <button type="button" className="button primary" onClick={play}>
            {playing ? 'Pause' : done ? 'Replay' : 'Play'}
          </button>
          <button type="button" className="button" onClick={reset}>
            Reset
          </button>
        </div>
        <span className="phase-time" aria-live="off">
          t = {t.toFixed(0)} / {PROFILE_T_END}
        </span>
      </div>
      <figcaption>
        <span className="figure-label">Figure 2.</span> Concentration against position. Left: scripted nuclei.
        Right: 1D Cahn–Hilliard simulation. The strip under each profile shows the structure (dark = x₂-rich). Here x₁ ={' '}
        {toComposition(-1).toFixed(2)}, x₂ = {toComposition(1).toFixed(2)}.
      </figcaption>
    </figure>
  )
}
