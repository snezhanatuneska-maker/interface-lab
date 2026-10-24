import { useMemo, useState, type ReactNode } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import { Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  barrierHom,
  deltaG,
  GAMMA_DEFAULT,
  GAMMA_RANGE,
  K_B,
  LOG10_J0,
  log10Rate,
  S_DEFAULT,
  S_RANGE,
  shapeFactor,
  solve,
  T_DEFAULT,
  T_RANGE,
  THETA_DEFAULT,
  type Nucleus,
} from '../lib/nucleation'
import CapSketch from './nucleation/CapSketch'
import Equations from './nucleation/Equations'
import { CepRelation, Concept, WhatToNotice } from './nucleation/Theory'
import Quiz from './nucleation/Quiz'

const N_POINTS = 300
const LOG_S: [number, number] = [Math.log(S_RANGE[0]), Math.log(S_RANGE[1])]
const RATE_FLOOR = -10 // log₁₀ J axis bottom; lower values are clamped just below it, off the plot

/** Smallest 1, 2, 2.5 or 5 × 10ⁿ at or above x, so the axes only jump between round values. */
function niceCeil(x: number): number {
  const p = 10 ** Math.floor(Math.log10(x))
  return [1, 2, 2.5, 5, 10].find((m) => m * p >= x * (1 - 1e-9))! * p
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (e: number) => String(e).replace(/\d/g, (c) => SUP[Number(c)])

/** Readable number: large barriers (high γ, S near 1) switch to a power of ten. */
function fmt(v: number): string {
  if (v >= 1e4) {
    const e = Math.floor(Math.log10(v))
    return `${(v / 10 ** e).toFixed(1)} × 10${sup(e)}`
  }
  if (v >= 100) return v.toFixed(0)
  if (v >= 10) return v.toFixed(1)
  if (v >= 0.1 || v === 0) return v.toFixed(2)
  return v.toPrecision(2)
}

/** S slider position is ln S, so the low end (where things change fastest) gets room. */
const sFromPos = (p: number) => {
  const s = Math.exp(p)
  return Math.min(Math.max(s < 10 ? Math.round(s * 100) / 100 : Math.round(s * 10) / 10, S_RANGE[0]), S_RANGE[1])
}

/** J_het/J_hom as a readable number, or as a power of ten once it is huge. */
function ratioText(log10Ratio: number): ReactNode {
  if (log10Ratio < 3) return `${(10 ** log10Ratio).toPrecision(3)}×`
  return (
    <>
      10<sup>{Math.round(log10Ratio)}</sup>×
    </>
  )
}

function insight(n: Nucleus | null, theta: number): string {
  if (!n) return 'No stable nucleus (S ≤ 1): every cluster dissolves.'
  if (theta >= 175) return 'At θ ≈ 180° the nucleus does not wet the surface: f ≈ 1, exactly like homogeneous nucleation.'
  if (theta <= 5) return 'Near complete wetting f → 0: almost no barrier, the new phase just spreads over the surface.'
  const hom = log10Rate(n.homKT)
  const het = log10Rate(n.hetKT)
  if (hom < 0 && het >= 0)
    return `The bulk barrier (${fmt(n.homKT)} kT) is too high to cross, but the surface lowers it to ${fmt(n.hetKT)} kT: nucleation happens on the surface.`
  if (het < 0) return 'Even on the surface the barrier is too high: raise S or lower γ or θ to switch nucleation on.'
  return 'Both barriers are low enough here; the surface still wins by a factor J_het/J_hom.'
}

export default function NucleationPage() {
  const [S, setS] = useState(S_DEFAULT)
  const [gamma, setGamma] = useState(GAMMA_DEFAULT)
  const [theta, setTheta] = useState(THETA_DEFAULT)
  const [T, setT] = useState(T_DEFAULT)
  const theme = useThemeColors()
  const COLORS = { hom: theme.data1, het: theme.data2, muted: theme.muted, ink: theme.text }

  const n = solve(S, gamma, theta, T)
  const f = shapeFactor(theta)

  const reset = () => {
    setS(S_DEFAULT)
    setGamma(GAMMA_DEFAULT)
    setTheta(THETA_DEFAULT)
    setT(T_DEFAULT)
  }

  // ---------- Figure 1A: ΔG(d) ----------
  // The axes are rounded up to 1/2/2.5/5 × 10ⁿ, so small slider moves visibly shift d* and the peaks.
  const xMax = n ? niceCeil(2 * n.dStar) : 1
  const yTop = n ? niceCeil(1.15 * n.homKT) : 1
  const dgCurves = (() => {
    if (!n) return null
    const ds: number[] = []
    for (let i = 0; i <= N_POINTS; i++) ds.push((i / N_POINTS) * xMax)
    if (!ds.includes(n.dStar)) ds.push(n.dStar)
    ds.sort((a, b) => a - b)
    const hom = ds.map((d) => deltaG(d * 1e-9, S, gamma, T) / (K_B * T))
    return { ds, hom, het: hom.map((g) => g * n.f) }
  })()

  // ---------- Figure 1B: f(θ) ----------
  const fCurve = useMemo(() => {
    const th: number[] = []
    const fs: number[] = []
    for (let i = 0; i <= 180; i += 2) {
      th.push(i)
      fs.push(shapeFactor(i))
    }
    return { th, fs }
  }, [])

  // ---------- Figure 1C: log₁₀ J vs S ----------
  const rateCurves = useMemo(() => {
    const ss: number[] = []
    const hom: number[] = []
    const het: number[] = []
    const lo = Math.log(1.005)
    for (let i = 0; i <= N_POINTS; i++) {
      const s = Math.exp(lo + (i / N_POINTS) * (LOG_S[1] - lo))
      const g = barrierHom(s, gamma, T)! / (K_B * T)
      ss.push(s)
      hom.push(Math.max(log10Rate(g), RATE_FLOOR - 1))
      het.push(Math.max(log10Rate(f * g), RATE_FLOOR - 1))
    }
    return { ss, hom, het }
  }, [gamma, T, f])

  const layout = baseLayout(theme)
  const dot = (color: string) => ({ size: 11, color, line: { color: theme.plotBg, width: 2 } })

  const dgData: Data[] =
    n && dgCurves
      ? [
          { x: dgCurves.ds, y: dgCurves.hom, type: 'scatter', mode: 'lines', line: { color: COLORS.hom, width: 3 } },
          { x: dgCurves.ds, y: dgCurves.het, type: 'scatter', mode: 'lines', line: { color: COLORS.het, width: 3 } },
          { x: [n.dStar], y: [n.homKT], type: 'scatter', mode: 'markers', marker: dot(COLORS.hom) },
          { x: [n.dStar], y: [n.hetKT], type: 'scatter', mode: 'markers', marker: dot(COLORS.het) },
        ]
      : []

  const guide = (x0: number, x1: number, y0: number, y1: number, color: string): Partial<Shape> => ({
    type: 'line',
    x0,
    x1,
    y0,
    y1,
    line: { color, width: 1.2, dash: 'dash' },
  })
  const dgShapes: Partial<Shape>[] = n
    ? [
        { type: 'rect', xref: 'x', yref: 'paper', x0: 0, x1: n.dStar, y0: 0, y1: 1, layer: 'below', fillcolor: theme.accentSoft, line: { width: 0 } },
        { ...guide(n.dStar, n.dStar, 0, 1, COLORS.muted), yref: 'paper' },
        guide(0, n.dStar, n.homKT, n.homKT, COLORS.hom),
        guide(0, n.dStar, n.hetKT, n.hetKT, COLORS.het),
        { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.axis, width: 1 } },
      ]
    : []
  const dgAnnotations: Partial<Annotation>[] = n
    ? [
        { xref: 'x', yref: 'paper', x: n.dStar / 2, y: 0.02, yanchor: 'bottom', text: 'subcritical:<br>dissolves', showarrow: false, font: { size: 12, color: COLORS.muted } },
        { xref: 'x', yref: 'paper', x: xMax, y: 0.98, xanchor: 'right', yanchor: 'top', xshift: -4, text: 'supercritical:<br>grows', showarrow: false, font: { size: 12, color: COLORS.muted } },
        { xref: 'x', yref: 'paper', x: n.dStar, y: 1, xanchor: 'left', yanchor: 'top', xshift: 3, text: `d* = ${fmt(n.dStar)} nm`, showarrow: false, font: { size: 12, color: COLORS.ink } },
        { x: 0, y: n.homKT, xanchor: 'left', yanchor: 'bottom', xshift: 4, text: `ΔG*<sub>hom</sub> = ${fmt(n.homKT)} kT`, showarrow: false, font: { size: 12, color: COLORS.hom } },
        { x: 0, y: n.hetKT, xanchor: 'left', yanchor: n.homKT - n.hetKT < 0.12 * yTop ? 'top' : 'bottom', xshift: 4, text: `ΔG*<sub>het</sub> = ${fmt(n.hetKT)} kT`, showarrow: false, font: { size: 12, color: COLORS.het } },
      ]
    : []

  const fData: Data[] = [
    { x: fCurve.th, y: fCurve.fs, type: 'scatter', mode: 'lines', line: { color: COLORS.het, width: 2.5 } },
    { x: [theta], y: [f], type: 'scatter', mode: 'markers', marker: dot(COLORS.het) },
  ]

  const rateData: Data[] = [
    { x: rateCurves.ss, y: rateCurves.hom, type: 'scatter', mode: 'lines', line: { color: COLORS.hom, width: 3 } },
    { x: rateCurves.ss, y: rateCurves.het, type: 'scatter', mode: 'lines', line: { color: COLORS.het, width: 3 } },
    ...(n
      ? ([
          { x: [S], y: [log10Rate(n.homKT)], type: 'scatter', mode: 'markers', marker: dot(COLORS.hom) },
          { x: [S], y: [log10Rate(n.hetKT)], type: 'scatter', mode: 'markers', marker: dot(COLORS.het) },
        ] as Data[])
      : []),
  ]

  const dgLabel = n
    ? `Free energy against cluster diameter, in units of kT. Both curves peak at d* = ${fmt(n.dStar)} nm: homogeneous at ${fmt(n.homKT)} kT, heterogeneous at ${fmt(n.hetKT)} kT.`
    : 'No stable nucleus (S ≤ 1).'
  const fLabel = `Shape factor f against contact angle, rising from 0 at 0° to 1 at 180°. Current: θ = ${theta}°, f = ${f.toFixed(3)}.`
  const rateLabel = n
    ? `Log of nucleation rate against supersaturation, log scale. At S = ${S}: homogeneous ${log10Rate(n.homKT).toFixed(1)}, heterogeneous ${log10Rate(n.hetKT).toFixed(1)}.`
    : 'Nucleation rate against supersaturation.'

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Classical Nucleation Theory: Homogeneous vs Heterogeneous</h1>
        <p className="lede">
          Why does a surface lower the nucleation barrier, and by how much? Change the supersaturation, the surface
          tension and the contact angle, and watch the barrier and the rate.
        </p>
      </header>

      <Concept />
      <Equations />

      {/* ---------- Simulation ---------- */}
      <section className="section" aria-labelledby="sim-title">
        <h2 id="sim-title" className="section-title">
          Interactive simulation
        </h2>
        <figure id="sim-figure" className="figure hero" aria-label="Nucleation barrier, shape factor and rate">
          <div className="hero-head">
            <div className="coverage">
              <span className="coverage-label">
                Heterogeneous barrier ΔG*<sub>het</sub>
              </span>
              <span className="coverage-value het">{n ? `${fmt(n.hetKT)} kT` : '—'}</span>
              <span className="coverage-sub">
                {n ? `homogeneous ${fmt(n.homKT)} kT × f(θ) = ${f.toFixed(3)}` : 'No stable nucleus (S ≤ 1)'}
              </span>
            </div>
            <ul className="layer-legend" aria-label="Legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS.hom }} /> homogeneous
              </li>
              <li>
                <span className="key-line" style={{ borderColor: COLORS.het }} /> heterogeneous
              </li>
              <li>
                <span className="dot cnt-dot-sub" /> d &lt; d*
              </li>
            </ul>
          </div>

          <div className="cnt-grid">
            <div className="plot-col">
              {n ? (
                <div role="img" aria-label={dgLabel}>
                  <Plot
                    data={dgData}
                    layout={{
                      ...layout,
                      showlegend: false,
                      xaxis: { ...axis(theme), title: { text: 'Cluster diameter d (nm)' }, range: [0, xMax] },
                      yaxis: { ...axis(theme), title: { text: 'ΔG / kT' }, range: [-0.5 * yTop, yTop] },
                      shapes: dgShapes,
                      annotations: dgAnnotations,
                    }}
                    config={staticConfig}
                    useResizeHandler
                    className="plot"
                  />
                </div>
              ) : (
                <p className="result-warning">No stable nucleus (S ≤ 1): ΔG(d) only rises, so every cluster dissolves.</p>
              )}
            </div>
            <div className="plot-col cnt-side">
              <CapSketch theta={theta} f={f} />
              <div role="img" aria-label={fLabel}>
                <Plot
                  data={fData}
                  layout={{
                    ...layout,
                    margin: { l: 48, r: 12, t: 8, b: 48 },
                    showlegend: false,
                    xaxis: { ...axis(theme), title: { text: 'Contact angle θ (°)' }, range: [0, 180], tickvals: [0, 45, 90, 135, 180] },
                    yaxis: { ...axis(theme), title: { text: 'f(θ)' }, range: [0, 1.05], tickvals: [0, 0.5, 1] },
                    shapes: [
                      { type: 'line', x0: theta, x1: theta, y0: 0, y1: f, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
                    ],
                  }}
                  config={staticConfig}
                  useResizeHandler
                  className="plot cnt-small"
                />
              </div>
            </div>
          </div>

          <div className="cnt-grid cnt-row">
            <div className="plot-col">
              <div role="img" aria-label={rateLabel}>
                <Plot
                  data={rateData}
                  layout={{
                    ...layout,
                    showlegend: false,
                    xaxis: {
                      ...axis(theme),
                      type: 'log',
                      title: { text: 'Supersaturation S' },
                      range: [0, Math.log10(S_RANGE[1])],
                      tickvals: [1, 1.5, 2, 3, 5, 10, 20],
                    },
                    yaxis: { ...axis(theme), title: { text: 'log₁₀ J' }, range: [RATE_FLOOR, LOG10_J0 + 3] },
                    shapes: [
                      { type: 'line', x0: S, x1: S, yref: 'paper', y0: 0, y1: 1, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
                      { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: COLORS.muted, width: 1, dash: 'dot' } },
                    ],
                    annotations: [
                      { xref: 'paper', x: 1, y: 0, xanchor: 'right', yanchor: 'bottom', text: 'J = 1', showarrow: false, font: { size: 12, color: COLORS.muted } },
                      { xref: 'paper', x: 1, y: LOG10_J0, xanchor: 'right', yanchor: 'bottom', text: 'J₀ (no barrier)', showarrow: false, font: { size: 12, color: COLORS.muted } },
                    ],
                  }}
                  config={staticConfig}
                  useResizeHandler
                  className="plot"
                />
              </div>
            </div>
            <dl className="results cnt-results" aria-live="polite">
              <div>
                <dt>Critical diameter d*</dt>
                <dd>{n ? `${fmt(n.dStar)} nm` : '—'}</dd>
              </div>
              <div>
                <dt>ΔG*<sub>hom</sub></dt>
                <dd className="hom-ink">{n ? `${fmt(n.homKT)} kT` : '—'}</dd>
              </div>
              <div>
                <dt>ΔG*<sub>het</sub></dt>
                <dd className="het-ink">{n ? `${fmt(n.hetKT)} kT` : '—'}</dd>
              </div>
              <div>
                <dt>Shape factor f(θ)</dt>
                <dd>{f.toFixed(3)}</dd>
              </div>
              <div className="result-main">
                <dt>
                  J<sub>het</sub> / J<sub>hom</sub>
                </dt>
                <dd>{n ? ratioText(n.log10Ratio) : '—'}</dd>
              </div>
              {!n && <p className="result-warning">No stable nucleus (S ≤ 1)</p>}
            </dl>
          </div>

          <div className="figure-controls hero-controls">
            <Slider
              id="S"
              label={<>Supersaturation <em>S</em></>}
              value={S.toFixed(2)}
              min={LOG_S[0]}
              max={LOG_S[1]}
              step={(LOG_S[1] - LOG_S[0]) / 400}
              pos={Math.log(S)}
              onChange={(p) => setS(sFromPos(p))}
              hint="S = p/p_sat; log scale"
            />
            <Slider
              id="gamma"
              label={<>Surface tension <em>γ</em></>}
              value={`${gamma.toFixed(2)} J/m²`}
              min={GAMMA_RANGE[0]}
              max={GAMMA_RANGE[1]}
              step={0.01}
              pos={gamma}
              onChange={(v) => setGamma(Math.round(v * 100) / 100)}
              hint="ΔG* ∝ γ³"
            />
            <Slider
              id="theta"
              label={<>Contact angle <em>θ</em></>}
              value={`${theta}°`}
              min={0}
              max={180}
              step={1}
              pos={theta}
              onChange={setTheta}
              hint="through the nucleus; 180° = no help"
            />
            <Slider
              id="T"
              label={<>Temperature <em>T</em></>}
              value={`${T} K`}
              min={T_RANGE[0]}
              max={T_RANGE[1]}
              step={1}
              pos={T}
              onChange={setT}
              hint="sets kT"
            />
            <div className="sim-buttons">
              <button type="button" className="button" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
          <p className="insight" aria-live="polite">
            {insight(n, theta)}
          </p>
          <figcaption>
            <span className="figure-label">Figure 1.</span> Top left: ΔG of a cluster against its diameter, in units of
            kT; dots mark the barriers at d*. Top right: the nucleus as a spherical cap on the substrate (dashed: the
            full sphere) and the shape factor f(θ). Bottom: log₁₀ of the nucleation rate against S (log scale), with
            the same illustrative prefactor J₀ = 10³⁰ for both cases, so only the exponential term is compared. Fixed:
            V<sub>m</sub> = 3 × 10⁻²⁹ m³. For the cap, d is the diameter of the sphere it is cut from.
          </figcaption>
        </figure>
      </section>

      <WhatToNotice />
      <CepRelation />
      <Quiz />
    </article>
  )
}
