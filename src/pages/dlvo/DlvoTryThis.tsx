import { useEffect, useMemo, useRef, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../../components/Plot'
import { LogSlider, Segmented, Slider } from '../../components/Controls'
import { useThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas'
import { debyeLength } from '../../lib/edl'
import { barrier, ccc, HAMAKER_DEFAULT, RADIUS_DEFAULT, STABLE_BARRIER, total, type DlvoParams } from '../../lib/dlvo'

// DLVO energy of two equal spheres (src/lib/dlvo.ts): double-layer repulsion plus van der Waals attraction, in kT.

const W = 220
const H = 220
const SALT_RANGE: [number, number] = [0.1, 1000] // mM
const PSI_DEFAULT = 50 // mV
const N_POINTS = 400

const SALT_NAME: Record<number, string> = { 1: 'NaCl', 2: 'MgSO₄', 3: 'a 3:3 salt' }

export function DlvoTryThis() {
  const [saltConc, setSaltConc] = useState(10) // mM
  const [valency, setValency] = useState(1)
  const [psi0, setPsi0] = useState(PSI_DEFAULT)
  const theme = useThemeColors()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const params: DlvoParams = { c0: saltConc, z: valency, psi0, a: RADIUS_DEFAULT, hamaker: HAMAKER_DEFAULT }
  const debye = debyeLength(saltConc, valency)
  const b = barrier(params)
  const cccValue = useMemo(
    () => ccc({ z: valency, psi0, a: RADIUS_DEFAULT, hamaker: HAMAKER_DEFAULT }),
    [valency, psi0],
  )
  const isStable = b >= STABLE_BARRIER

  // ---------- V(h) ----------
  const hMax = Math.min(100, Math.max(20, 6 * debye))
  const curve = useMemo(() => {
    const p = { c0: saltConc, z: valency, psi0, a: RADIUS_DEFAULT, hamaker: HAMAKER_DEFAULT }
    const hs = Array.from({ length: N_POINTS + 1 }, (_, i) => 0.2 + ((hMax - 0.2) * i) / N_POINTS)
    return { hs, V: hs.map((h) => total(h, p)) }
  }, [saltConc, valency, psi0, hMax])
  // Secondary minimum: the lowest point beyond the barrier (or beyond the first few nm when there is none).
  const peakIndex = curve.V.reduce((best, v, i) => (v > curve.V[best] ? i : best), 0)
  const secondary = Math.min(0, ...curve.V.slice(Math.max(peakIndex, 10)))
  const yTop = Math.max(25, 1.2 * b)
  const yBottom = -Math.max(15, 1.5 * Math.abs(secondary))

  const data: Data[] = [
    {
      x: curve.hs,
      y: curve.V.map((v) => (v < yBottom ? null : v)),
      type: 'scatter',
      mode: 'lines',
      line: { color: theme.data1, width: 3 },
    },
  ]
  const shapes: Partial<Shape>[] = [
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.axis, width: 1 } },
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: STABLE_BARRIER, y1: STABLE_BARRIER, line: { color: theme.muted, width: 1.2, dash: 'dot' } },
  ]
  const annotations: Partial<Annotation>[] = [
    { xref: 'paper', x: 1, y: STABLE_BARRIER, xanchor: 'right', yanchor: 'bottom', text: `${STABLE_BARRIER} kT`, showarrow: false, font: { size: 12, color: theme.muted } },
    { xref: 'paper', yref: 'paper', x: 0.01, y: 0.02, xanchor: 'left', yanchor: 'bottom', text: '↓ primary minimum', showarrow: false, font: { size: 12, color: theme.muted } },
  ]

  // ---------- particles ----------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas, W, H)
    if (!ctx) return
    ctx.fillStyle = theme.plotBg
    ctx.fillRect(0, 0, W, H)
    const centerX = W / 2
    const centerY = H / 2 + 8
    const numParticles = 14
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2
      const r = isStable ? 55 + (i % 2) * 22 : 12 + (i % 4) * 6
      ctx.beginPath()
      ctx.arc(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r, 9, 0, Math.PI * 2)
      ctx.fillStyle = isStable ? theme.data1 : theme.data2
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = theme.plotBg
      ctx.stroke()
    }
    ctx.font = `13px ${CANVAS_FONT}`
    ctx.fillStyle = isStable ? theme.accent : theme.data2
    ctx.fillText(isStable ? 'Stable dispersion' : 'Coagulating', 10, 20)
  }, [isStable, theme])

  return (
    <figure id="sim-figure" className="figure hero" aria-label="DLVO interaction energy simulator">
      <div className="hero-head">
        <div className="coverage">
          <span className="coverage-label">Energy barrier</span>
          <span className="coverage-value colloid">
            {b > 0 ? b.toFixed(0) : 'none'} {b > 0 && <em>kT</em>}
          </span>
          <span className="coverage-sub">{isStable ? `≥ ${STABLE_BARRIER} kT: stable` : `< ${STABLE_BARRIER} kT: coagulating`}</span>
        </div>
      </div>

      <div className="sim-grid">
        <div
          role="img"
          aria-label={`DLVO energy against separation in ${saltConc} mM ${valency}:${valency} salt at ${psi0} mV: barrier ${b.toFixed(0)} kT, ${isStable ? 'stable' : 'coagulating'}.`}
        >
          <Plot
            data={data}
            layout={{
              ...baseLayout(theme),
              showlegend: false,
              xaxis: { ...axis(theme), title: { text: 'Gap between the surfaces h (nm)' }, range: [0, hMax] },
              yaxis: { ...axis(theme), title: { text: 'V / kT' }, range: [yBottom, yTop] },
              shapes,
              annotations,
            }}
            config={staticConfig}
            useResizeHandler
            className="plot"
          />
        </div>
        <div>
          <canvas
            ref={canvasRef}
            className="sim-canvas"
            style={{ maxWidth: W, margin: '0 auto', display: 'block' }}
            role="img"
            aria-label={`Particles: ${isStable ? 'dispersed' : 'coagulated'}`}
          />
          <dl className="results">
            <div>
              <dt>Debye length κ⁻¹</dt>
              <dd>{debye.toPrecision(2)} nm</dd>
            </div>
            <div>
              <dt>Secondary minimum</dt>
              <dd>{secondary < -0.05 ? `${secondary.toFixed(1)} kT` : 'none'}</dd>
            </div>
            <div className="result-main">
              <dt>CCC for z = {valency} at {psi0} mV</dt>
              <dd>{cccValue.toPrecision(2)} mM</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="figure-controls hero-controls">
        <LogSlider
          id="salt"
          label="Salt concentration c₀ (mM)"
          range={SALT_RANGE}
          value={saltConc}
          onChange={setSaltConc}
          hint="log scale"
        />
        <div className="model-control">
          <span className="control-label">Counter-ion valency z</span>
          <Segmented
            label="Counter-ion valency"
            value={String(valency)}
            onChange={(v) => setValency(Number(v))}
            options={[1, 2, 3].map((v) => ({ value: String(v), label: `${v}:${v}` }))}
          />
        </div>
        <Slider
          id="psi0"
          label={<>Surface potential <em>ψ</em>₀</>}
          value={`${psi0} mV`}
          min={10}
          max={100}
          step={5}
          pos={psi0}
          onChange={setPsi0}
        />
      </div>
      <p className="insight" aria-live="polite">
        In {saltConc} mM {SALT_NAME[valency]} the double layer reaches about {debye.toPrecision(2)} nm.{' '}
        {b <= 0
          ? 'There is no barrier: van der Waals attraction wins at every distance and the particles coagulate.'
          : isStable
            ? `A barrier of ${b.toFixed(0)} kT keeps the particles out of the primary minimum.`
            : `The barrier of ${b.toFixed(0)} kT is low enough for thermal motion to cross it: slow coagulation.`}{' '}
        Above the CCC ({cccValue.toPrecision(2)} mM here) the barrier is gone.
      </p>
      <figcaption>
        <span className="figure-label">Figure 1.</span> DLVO energy of two spheres of radius {RADIUS_DEFAULT} nm with
        A = {HAMAKER_DEFAULT / 1e-20} × 10⁻²⁰ J in water at 25 °C (Derjaguin approximation, weak-overlap double-layer
        repulsion, non-retarded van der Waals). The dotted line is the {STABLE_BARRIER} kT rule of thumb for long-term
        stability. The curve falls without limit at contact (primary minimum); in reality short-range repulsion stops
        it.
      </figcaption>
    </figure>
  )
}
