import { useMemo, useRef, useState, type PointerEvent } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../../components/Plot'
import { Slider } from '../../components/Controls'
import type { ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { binodal, chi, g2, gMix, region, spinodal, T_DEFAULT, T_RANGE, X_DEFAULT, type Region } from '../../lib/phase'

const [T_MIN, T_MAX] = T_RANGE
const X_LIM: [number, number] = [0.01, 0.99]
const N_DOME = 120
const N_G = 400
// Fixed margins, so a pointer position on the phase diagram can be turned into (x, T/Tc).
const MARGIN = { l: 62, r: 12, t: 12, b: 48 }

export const REGION_NAME: Record<Region, string> = { stable: 'Stable', metastable: 'Metastable', unstable: 'Unstable' }

const MEANING: Record<Region, string> = {
  stable: 'Outside the binodal: the mixture stays mixed.',
  metastable:
    'd²G/dx² > 0 → small fluctuations decay; an energy barrier must be crossed → needs a trigger (nucleation).',
  unstable: 'd²G/dx² < 0 → any small fluctuation lowers G → spontaneous spinodal decomposition, no barrier.',
}

// Label position for the metastable bands: halfway between binodal and spinodal, low down where the band is widest.
const META_T = 0.56
const META_X = (binodal(chi(META_T))![0] + spinodal(chi(META_T))![0]) / 2

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

/** Binodal and spinodal domes, sampled densely near Tc where they close. */
function domes() {
  const t: number[] = []
  const b1: number[] = []
  const s1: number[] = []
  for (let i = N_DOME; i >= 0; i--) {
    const u = i / N_DOME
    const ti = 1 - (1 - T_MIN) * u * u
    const c = chi(ti)
    t.push(ti)
    b1.push(i === 0 ? 0.5 : binodal(c)![0])
    s1.push(i === 0 ? 0.5 : spinodal(c)![0])
  }
  return { t, b1, s1 }
}

export default function PhaseDiagram({ theme, narrow }: { theme: ThemeColors; narrow: boolean }) {
  const [x0, setX0] = useState(X_DEFAULT)
  const [T, setT] = useState(T_DEFAULT)
  const dragging = useRef(false)

  const c = chi(T)
  const bin = binodal(c)
  const sp = spinodal(c)
  const reg = region(x0, T)
  const curv = g2(x0, c)
  const COLOR: Record<Region, string> = { stable: theme.accent, metastable: theme.data1, unstable: theme.data2 }

  // ---------- Phase diagram ----------
  const dome = useMemo(domes, [])
  const mirror = (a: number[]) => a.map((v) => 1 - v)
  const rev = <T,>(a: T[]) => [...a].reverse()

  const pdData: Data[] = [
    // Metastable bands: binodal up to Tc, then back down the spinodal (left and right).
    {
      x: [...dome.b1, ...rev(dome.s1)],
      y: [...dome.t, ...rev(dome.t)],
      type: 'scatter',
      mode: 'lines',
      fill: 'toself',
      fillcolor: theme.data1Soft,
      line: { width: 0 },
    },
    {
      x: [...mirror(dome.b1), ...rev(mirror(dome.s1))],
      y: [...dome.t, ...rev(dome.t)],
      type: 'scatter',
      mode: 'lines',
      fill: 'toself',
      fillcolor: theme.data1Soft,
      line: { width: 0 },
    },
    // Unstable: inside the spinodal.
    {
      x: [...dome.s1, ...rev(mirror(dome.s1))],
      y: [...dome.t, ...rev(dome.t)],
      type: 'scatter',
      mode: 'lines',
      fill: 'toself',
      fillcolor: theme.data2Soft,
      line: { width: 0 },
    },
    { x: [...dome.b1, ...rev(mirror(dome.b1))], y: [...dome.t, ...rev(dome.t)], type: 'scatter', mode: 'lines', line: { color: theme.data1, width: 2.5 } },
    { x: [...dome.s1, ...rev(mirror(dome.s1))], y: [...dome.t, ...rev(dome.t)], type: 'scatter', mode: 'lines', line: { color: theme.data2, width: 2, dash: 'dash' } },
    // Current T: tie line between the binodal compositions.
    {
      x: bin ? [bin[0], bin[1]] : [],
      y: bin ? [T, T] : [],
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: theme.muted, width: 1, dash: 'dot' },
      marker: { size: 6, color: theme.data1 },
    },
    { x: [0.5], y: [1], type: 'scatter', mode: 'markers', marker: { size: 7, color: theme.text, symbol: 'diamond' } },
    {
      x: [x0],
      y: [T],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 14, color: COLOR[reg], line: { color: theme.plotBg, width: 2 } },
    },
  ]

  const label = (x: number, y: number, text: string, color: string, extra: Partial<Annotation> = {}): Partial<Annotation> => ({
    x,
    y,
    text,
    showarrow: false,
    font: { size: 12, color },
    ...extra,
  })

  const pdAnnotations: Partial<Annotation>[] = [
    label(0.03, 1.06, '1 phase (stable)', theme.accent, { xanchor: 'left' }),
    label(0.5, 0.62, narrow ? 'unstable' : 'unstable<br>(inside spinodal)', theme.data2),
    label(META_X, META_T, 'metastable', theme.data1, { textangle: -90, font: { size: narrow ? 10 : 12, color: theme.data1 } }),
    label(1 - META_X, META_T, 'metastable', theme.data1, { textangle: -90, font: { size: narrow ? 10 : 12, color: theme.data1 } }),
    label(0.5, 1, 'T<sub>c</sub>', theme.text, { xanchor: 'left', xshift: 6, yshift: 8 }),
  ]

  // Pointer → data coordinates, from the fixed margins and the plot's size.
  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - r.left - MARGIN.l) / (r.width - MARGIN.l - MARGIN.r)
    const fy = (e.clientY - r.top - MARGIN.t) / (r.height - MARGIN.t - MARGIN.b)
    setX0(Number(clamp(fx, X_LIM[0], X_LIM[1]).toFixed(2)))
    setT(Number(clamp(T_MAX - fy * (T_MAX - T_MIN), T_MIN, T_MAX).toFixed(2)))
  }

  // ---------- Free-energy curve ----------
  const gCurve = useMemo(() => {
    const xs: number[] = []
    const gs: number[] = []
    for (let i = 1; i < N_G; i++) {
      const xi = i / N_G
      xs.push(xi)
      gs.push(gMix(xi, c))
    }
    return { xs, gs }
  }, [c])

  const gData: Data[] = [
    { x: gCurve.xs, y: gCurve.gs, type: 'scatter', mode: 'lines', line: { color: theme.text, width: 2.5 } },
    // Common tangent (horizontal in the symmetric model), extended a little past x₁ and x₂.
    {
      x: bin ? [Math.max(bin[0] - 0.08, 0), Math.min(bin[1] + 0.08, 1)] : [],
      y: bin ? [gMix(bin[0], c), gMix(bin[0], c)] : [],
      type: 'scatter',
      mode: 'lines',
      line: { color: theme.data1, width: 1.75 },
    },
    {
      x: bin ?? [],
      y: bin ? bin.map((v) => gMix(v, c)) : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 9, color: theme.data1, line: { color: theme.plotBg, width: 1.5 } },
    },
    {
      x: sp ?? [],
      y: sp ? sp.map((v) => gMix(v, c)) : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10, symbol: 'diamond', color: theme.data2, line: { color: theme.plotBg, width: 1.5 } },
    },
    {
      x: [x0],
      y: [gMix(x0, c)],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 13, color: COLOR[reg], line: { color: theme.plotBg, width: 2 } },
    },
  ]

  // The same three regions as bands behind G(x), so the two panels read together.
  const band = (a: number, b: number, fill: string): Partial<Shape> => ({
    type: 'rect',
    xref: 'x',
    yref: 'paper',
    x0: a,
    x1: b,
    y0: 0,
    y1: 1,
    layer: 'below',
    fillcolor: fill,
    line: { width: 0 },
  })
  const gShapes: Partial<Shape>[] =
    bin && sp
      ? [band(bin[0], sp[0], theme.data1Soft), band(sp[0], sp[1], theme.data2Soft), band(sp[1], bin[1], theme.data1Soft)]
      : []

  const gAnnotations: Partial<Annotation>[] = bin
    ? [
        label(bin[0], gMix(bin[0], c), 'x₁', theme.data1, { yshift: -14 }),
        label(bin[1], gMix(bin[1], c), 'x₂', theme.data1, { yshift: -14 }),
      ]
    : [label(0.5, 1, 'T ≥ T<sub>c</sub>: G is convex, no tangent', theme.muted, { yref: 'paper', yanchor: 'top' })]

  const reset = () => {
    setX0(X_DEFAULT)
    setT(T_DEFAULT)
  }

  const layout = { ...baseLayout(theme), margin: MARGIN, showlegend: false }
  const tc = T >= 1

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Phase diagram and free-energy curve">
      <div className="hero-head">
        <div className="coverage">
          <span className="coverage-label">Region at the selected point</span>
          <span className={`coverage-value phase-${reg}`}>{REGION_NAME[reg]}</span>
          <span className="coverage-sub">
            x₀ = {x0.toFixed(2)} · T/T<sub>c</sub> = {T.toFixed(2)} · χ = {c.toFixed(2)}
          </span>
        </div>
        <ul className="layer-legend" aria-label="Legend">
          <li>
            <span className="key-line" style={{ borderColor: theme.data1 }} /> binodal
          </li>
          <li>
            <span className="dash phase-spinodal-key" /> spinodal
          </li>
          <li>
            <span className="dot" style={{ background: theme.data1Soft }} /> metastable
          </li>
          <li>
            <span className="dot" style={{ background: theme.data2Soft }} /> unstable
          </li>
        </ul>
      </div>

      <div className="sim-grid">
        <div className="plot-col">
          <p className="plot-legend phase-plot-title">Phase diagram: drag the point</p>
          <div
            className="phase-drag"
            role="img"
            aria-label={`Phase diagram, composition x from 0 to 1 against T over Tc from ${T_MIN} to ${T_MAX}. Selected point x0 ${x0.toFixed(2)}, T/Tc ${T.toFixed(2)}: ${REGION_NAME[reg]}.`}
            onPointerDown={(e) => {
              dragging.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              pick(e)
            }}
            onPointerMove={(e) => dragging.current && pick(e)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <Plot
              data={pdData}
              layout={{
                ...layout,
                xaxis: { ...axis(theme), title: { text: 'Composition x' }, range: [0, 1] },
                yaxis: { ...axis(theme), title: { text: 'T/T<sub>c</sub>' }, range: [T_MIN, T_MAX] },
                annotations: pdAnnotations,
              }}
              config={staticConfig}
              useResizeHandler
              className="plot"
            />
          </div>
        </div>
        <div className="plot-col">
          <ul className="plot-legend" aria-label="Free-energy plot legend">
            <li>
              <span className="key-line" style={{ borderColor: theme.data1 }} /> common tangent (x₁, x₂)
            </li>
            <li>
              <span className="key-mark" style={{ color: theme.data2 }}>◆</span> inflection (spinodal)
            </li>
          </ul>
          <div
            role="img"
            aria-label={
              `Free energy of mixing G over kT against x at T/Tc ${T.toFixed(2)}.` +
              (bin && sp
                ? ` Common tangent at x1 ${bin[0].toFixed(3)} and x2 ${bin[1].toFixed(3)}; inflection points at ${sp[0].toFixed(3)} and ${sp[1].toFixed(3)}.`
                : ' Convex everywhere.')
            }
          >
            <Plot
              data={gData}
              layout={{
                ...layout,
                xaxis: { ...axis(theme), title: { text: 'Composition x' }, range: [0, 1] },
                yaxis: { ...axis(theme), title: { text: 'G<sub>mix</sub>/kT' } },
                shapes: gShapes,
                annotations: gAnnotations,
              }}
              config={staticConfig}
              useResizeHandler
              className="plot"
            />
          </div>
        </div>
      </div>

      <div className="figure-controls hero-controls">
        <Slider
          id="x0"
          label={<>Composition x₀</>}
          value={x0.toFixed(2)}
          min={X_LIM[0]}
          max={X_LIM[1]}
          step={0.01}
          pos={x0}
          onChange={setX0}
          hint="mole fraction of component 2"
        />
        <Slider
          id="T"
          label={<>Temperature T/T<sub>c</sub></>}
          value={T.toFixed(2)}
          min={T_MIN}
          max={T_MAX}
          step={0.01}
          pos={T}
          onChange={setT}
          hint={<>χ = 2·T<sub>c</sub>/T</>}
        />
        <div className="sim-buttons">
          <button type="button" className="button" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div className={`insight phase-status ${reg}`} aria-live="polite">
        <strong className={`phase-${reg}`}>{REGION_NAME[reg]}:</strong> {MEANING[reg]}{' '}
        {!tc && (
          <span className="phase-curv">
            (d²G/dx² = {curv >= 0 ? '+' : '−'}
            {Math.abs(curv).toFixed(2)} at x₀)
          </span>
        )}
      </div>
      <figcaption>
        <span className="figure-label">Figure 1.</span> Left: regular-solution phase diagram; solid line binodal,
        dashed line spinodal, diamond the critical point. Right: G(x) at the selected T. The common tangent touches the
        binodal compositions x₁ and x₂; the diamonds are the inflection points.
      </figcaption>
    </figure>
  )
}
