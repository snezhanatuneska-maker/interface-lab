import { useMemo, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  C0_DEFAULT,
  C0_RANGE,
  DELTA_DEFAULT,
  DELTA_RANGE,
  EPS_STERN,
  ionRatios,
  potentialAt,
  PSI0_DEFAULT,
  PSI0_MAX,
  solve,
  sternCapacitance,
  toMicroCcm2,
  toMicroFcm2,
  Z_DEFAULT,
  type Model,
} from '../lib/edl'
import Schematic from './edl/Schematic'
import { insight } from './edl/insight'
import { Seeing, Stern, WhyItMatters } from './edl/Theory'
import Equations from './edl/Equations'

const N_POINTS = 300
const N_CAP = 101

const fmt = (v: number, digits = 2) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(digits))

export default function EdlPage() {
  const [model, setModel] = useState<Model>('gcs')
  const [c0, setC0] = useState(C0_DEFAULT)
  const [z, setZ] = useState(Z_DEFAULT)
  const [psi0, setPsi0] = useState(PSI0_DEFAULT)
  const [delta, setDelta] = useState(DELTA_DEFAULT)
  const theme = useThemeColors()
  const COLORS = { gc: theme.data3, gcs: theme.accent, anion: theme.data2, cation: theme.data1, muted: theme.muted }
  const stern = model === 'gcs'

  const s = useMemo(() => solve(model, psi0, c0, z, delta), [model, psi0, c0, z, delta])
  const start = stern ? delta : 0 // where the diffuse layer begins
  const xMax = Math.max(5, 5 * s.debye) + start

  const reset = () => {
    setModel('gcs')
    setC0(C0_DEFAULT)
    setZ(Z_DEFAULT)
    setPsi0(PSI0_DEFAULT)
    setDelta(DELTA_DEFAULT)
  }

  // ---------- Profiles ----------
  const profiles = useMemo(() => {
    const xs: number[] = []
    for (let i = 0; i <= N_POINTS; i++) xs.push((i / N_POINTS) * xMax)
    if (stern && !xs.includes(start)) xs.push(start)
    xs.sort((a, b) => a - b)
    const psi = xs.map((x) => potentialAt(x, model, psi0, s.psiD, c0, z, delta))
    // Ions live in the diffuse layer only; the Stern layer is charge-free.
    const ionX = xs.filter((x) => x >= start)
    const ions = ionX.map((x) => ionRatios(potentialAt(x, model, psi0, s.psiD, c0, z, delta), z))
    return { xs, psi, ionX, anion: ions.map((r) => r.anion), cation: ions.map((r) => r.cation) }
  }, [model, psi0, c0, z, delta, s.psiD, xMax, start, stern])

  // ---------- Capacitance vs ψ₀ ----------
  const capCurves = useMemo(() => {
    const ps: number[] = []
    const gc: number[] = []
    const gcs: number[] = []
    for (let i = 0; i < N_CAP; i++) {
      const p = (i / (N_CAP - 1)) * PSI0_MAX
      ps.push(p)
      gc.push(toMicroFcm2(solve('gc', p, c0, z, delta).cTotal))
      gcs.push(toMicroFcm2(solve('gcs', p, c0, z, delta).cTotal))
    }
    return { ps, gc, gcs }
  }, [c0, z, delta])

  const sternShapes: Partial<Shape>[] = stern
    ? [
        { type: 'rect', xref: 'x', yref: 'paper', x0: 0, x1: delta, y0: 0, y1: 1, layer: 'below', fillcolor: theme.accentSoft, line: { width: 0 } },
        { type: 'line', xref: 'x', yref: 'paper', x0: delta, x1: delta, y0: 0, y1: 1, line: { color: COLORS.gcs, width: 1.2, dash: 'dash' } },
      ]
    : []
  const debyeShape: Partial<Shape> = {
    type: 'line',
    xref: 'x',
    yref: 'paper',
    x0: start + s.debye,
    x1: start + s.debye,
    y0: 0,
    y1: 1,
    line: { color: COLORS.muted, width: 1.2, dash: 'dash' },
  }
  const sternLabels: Partial<Annotation>[] = stern
    ? [{ xref: 'x', yref: 'paper', x: delta, y: 1, xanchor: 'left', yanchor: 'top', xshift: 3, text: 'OHP', showarrow: false, font: { size: 12, color: COLORS.gcs } }]
    : []
  const debyeLabel: Partial<Annotation> = {
    xref: 'x',
    yref: 'paper',
    x: start + s.debye,
    y: 0.82,
    xanchor: 'left',
    xshift: 3,
    text: 'κ⁻¹',
    showarrow: false,
    font: { size: 12, color: COLORS.muted },
  }

  const psiData: Data[] = [
    { x: profiles.xs, y: profiles.psi, type: 'scatter', mode: 'lines', line: { color: COLORS[model], width: 3 } },
    ...(stern
      ? [{ x: [delta], y: [s.psiD], type: 'scatter', mode: 'markers', marker: { size: 10, color: COLORS.gcs, line: { color: theme.plotBg, width: 2 } } } as Data]
      : []),
  ]

  const ionData: Data[] = [
    { x: profiles.ionX, y: profiles.anion, type: 'scatter', mode: 'lines', line: { color: COLORS.anion, width: 3 } },
    { x: profiles.ionX, y: profiles.cation, type: 'scatter', mode: 'lines', line: { color: COLORS.cation, width: 3 } },
  ]

  const capData: Data[] = [
    { x: capCurves.ps, y: capCurves.gc, type: 'scatter', mode: 'lines', line: { color: COLORS.gc, width: stern ? 1.75 : 3 }, opacity: stern ? 0.7 : 1 },
    { x: capCurves.ps, y: capCurves.gcs, type: 'scatter', mode: 'lines', line: { color: COLORS.gcs, width: stern ? 3 : 1.75 }, opacity: stern ? 1 : 0.7 },
    {
      x: [psi0],
      y: [toMicroFcm2(s.cTotal)],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, color: COLORS[model], line: { color: theme.plotBg, width: 2 } },
    },
  ]
  const cSternMicro = toMicroFcm2(sternCapacitance(delta))

  const layout = baseLayout(theme)
  const xAxis = { ...axis(theme), title: { text: 'Distance from surface x (nm)' }, range: [0, xMax] }

  const psiLabel =
    `Potential against distance, 0 to ${xMax.toFixed(1)} nm. ψ₀ ${psi0} mV` +
    (stern ? `, dropping linearly to ψd ${s.psiD.toFixed(1)} mV at the OHP (${delta} nm), then decaying.` : ', decaying.') +
    ` Debye length ${s.debye.toFixed(2)} nm.`
  const ionLabel = `Ion concentrations relative to bulk, log scale. Anions (counter-ions) reach ${fmt(profiles.anion[0])} times bulk at the ${stern ? 'OHP' : 'surface'}; cations drop to ${profiles.cation[0].toPrecision(2)}. Both return to 1 far away.`
  const capLabel = `Capacitance against surface potential, log scale. Gouy–Chapman rises to ${fmt(capCurves.gc[N_CAP - 1])} µF/cm² at 200 mV; Gouy–Chapman–Stern stays below C_Stern ${fmt(cSternMicro)} µF/cm².`

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Electrical Double Layer: Gouy–Chapman–Stern</h1>
        <p className="lede">
          A charged surface in salt water gathers a cloud of ions. Change the salt and see how far the potential
          reaches, then add a Stern layer and see what it does to the capacitance.
        </p>
      </header>

      {/* ---------- Hero: schematic + potential ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Double-layer schematic and potential profile">
        <div className="hero-head">
          <div className="coverage">
            <span className="coverage-label">
              Debye length κ<sup>−1</sup>
            </span>
            <span className={`coverage-value ${model}`}>{fmt(s.debye)} nm</span>
            <span className="coverage-sub">
              I = {fmt(c0 * z * z)} mM · {z}:{z} salt
            </span>
          </div>
          <ul className="layer-legend" aria-label="Legend">
            <li>
              <span className="dot" style={{ background: 'var(--data-2)' }} /> anion (counter-ion)
            </li>
            <li>
              <span className="dot" style={{ background: 'var(--data-1)' }} /> cation (co-ion)
            </li>
            {stern && (
              <li>
                <span className="dot edl-dot-stern" /> Stern layer
              </li>
            )}
          </ul>
        </div>

        <div className="sim-grid">
          <Schematic model={model} debye={s.debye} />
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS[model] }} /> ψ(x), {stern ? 'Gouy–Chapman–Stern' : 'Gouy–Chapman'}
              </li>
              <li>
                <span className="dash" /> κ⁻¹{stern ? ' from the OHP' : ''}
              </li>
            </ul>
            <div role="img" aria-label={psiLabel}>
              <Plot
                data={psiData}
                layout={{
                  ...layout,
                  showlegend: false,
                  xaxis: xAxis,
                  yaxis: { ...axis(theme), title: { text: 'ψ (mV)' }, range: [0, Math.max(psi0, 10) * 1.08] },
                  shapes: [...sternShapes, debyeShape],
                  annotations: [...sternLabels, debyeLabel],
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
        </div>

        <div className="figure-controls hero-controls">
          <div className="edl-toggles">
          <div className="model-control">
            <span className="control-label">Model</span>
            <Segmented
              label="Model"
              value={model}
              onChange={setModel}
              options={[
                { value: 'gc', label: <><span className="long">Gouy–Chapman</span><span className="short">GC</span></>, activeClass: 'gc' },
                { value: 'gcs', label: <><span className="long">Gouy–Chapman–Stern</span><span className="short">GCS</span></>, activeClass: 'gcs' },
              ]}
            />
          </div>
          <div className="model-control">
            <span className="control-label">Valency z</span>
            <Segmented
              label="Ion valency"
              value={String(z)}
              onChange={(v) => setZ(Number(v))}
              options={[1, 2, 3].map((v) => ({ value: String(v), label: `${v}:${v}` }))}
            />
          </div>
          </div>
          <LogSlider
            id="c0"
            label={<>Concentration <em>c</em>₀ (mM)</>}
            range={C0_RANGE}
            value={c0}
            onChange={setC0}
            hint="log scale"
          />
          <Slider
            id="psi0"
            label={<>Surface potential <em>ψ</em>₀</>}
            value={`${psi0} mV`}
            min={0}
            max={PSI0_MAX}
            step={1}
            pos={psi0}
            onChange={setPsi0}
          />
          <Slider
            id="delta"
            label={<>Stern thickness <em>δ</em></>}
            value={`${delta.toFixed(2)} nm`}
            min={DELTA_RANGE[0]}
            max={DELTA_RANGE[1]}
            step={0.05}
            pos={delta}
            onChange={setDelta}
            className={stern ? undefined : 'inactive'}
            hint={stern ? `ε_S = ${EPS_STERN}` : 'sets the faded Stern curve in Figure 2'}
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        <dl className="results edl-results">
          <div>
            <dt>ψd at {stern ? 'OHP' : 'surface'}</dt>
            <dd>{s.psiD.toFixed(1)} mV</dd>
          </div>
          <div>
            <dt>Surface charge σ</dt>
            <dd>{toMicroCcm2(s.sigma).toFixed(2)} µC/cm²</dd>
          </div>
          <div>
            <dt>C_Stern</dt>
            <dd>{stern ? `${fmt(toMicroFcm2(s.cStern))} µF/cm²` : '— (no Stern layer)'}</dd>
          </div>
          <div>
            <dt>C_diffuse</dt>
            <dd>{fmt(toMicroFcm2(s.cDiffuse))} µF/cm²</dd>
          </div>
          <div className="result-main">
            <dt>C_tot</dt>
            <dd className={`${model}-ink`}>{fmt(toMicroFcm2(s.cTotal))} µF/cm²</dd>
          </div>
        </dl>

        <p className="insight" aria-live="polite">
          {insight(model, psi0, s)}
        </p>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: a positive surface and its ion cloud (not to scale; the
          cloud widens with κ⁻¹). Right: the potential. {stern ? 'Shaded: the Stern layer, where ψ falls linearly to ψd at the OHP. ' : ''}
          Dashed: one Debye length into the diffuse layer. T = 298 K, ε<sub>r</sub> = 78.5.
        </figcaption>
      </figure>

      {/* ---------- Ions + capacitance ---------- */}
      <figure className="figure edl-second" aria-label="Ion profiles and capacitance">
        <div className="sim-grid">
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Ion plot legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS.anion }} /> c₋/c₀ (counter-ions)
              </li>
              <li>
                <span className="key-line" style={{ borderColor: COLORS.cation }} /> c₊/c₀ (co-ions)
              </li>
            </ul>
            <div role="img" aria-label={ionLabel}>
              <Plot
                data={ionData}
                layout={{
                  ...layout,
                  showlegend: false,
                  xaxis: xAxis,
                  yaxis: { ...axis(theme), type: 'log', title: { text: 'c/c₀' }, exponentformat: 'power' },
                  shapes: [
                    ...sternShapes,
                    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: COLORS.muted, width: 1.2, dash: 'dot' } },
                  ],
                  annotations: sternLabels,
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Capacitance plot legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS.gc }} /> Gouy–Chapman
              </li>
              <li>
                <span className="key-line" style={{ borderColor: COLORS.gcs }} /> Gouy–Chapman–Stern
              </li>
              <li>
                <span className="dash" /> C_Stern
              </li>
            </ul>
            <div role="img" aria-label={capLabel}>
              <Plot
                data={capData}
                layout={{
                  ...layout,
                  showlegend: false,
                  xaxis: { ...axis(theme), title: { text: 'Surface potential ψ₀ (mV)' }, range: [0, PSI0_MAX] },
                  yaxis: { ...axis(theme), type: 'log', title: { text: 'C (µF/cm²)' }, exponentformat: 'power' },
                  shapes: [
                    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: cSternMicro, y1: cSternMicro, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
                  ],
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 2.</span> Left: ion concentrations relative to the bulk (log scale);
          counter-ions are enriched, co-ions depleted, and both return to 1. Right: total capacitance against ψ₀ for
          both models at the current salt; the dot is the current setting.
        </figcaption>
      </figure>

      <Seeing />
      <Stern />
      <Equations model={model} />
      <WhyItMatters />
    </article>
  )
}
