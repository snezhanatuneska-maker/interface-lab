import { useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import { Slider } from '../components/Controls'
import { useThemeColors, type ThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  areaPerMolecule,
  C_RANGE,
  concentrationGrid,
  conductivity,
  counterionBinding,
  diffusionRel,
  freeMonomer,
  isIonic,
  makeSystem,
  osmoticRel,
  PRESETS,
  SALT_MAX,
  surfaceExcess,
  surfaceTension,
  TAIL_RANGE,
  turbidityRel,
  type HeadType,
  type SurfactantId,
  type System,
} from '../lib/surfactants'
import MicelleView from './surfactants/MicelleView'
import Theory from './surfactants/Theory'
import Equations from './surfactants/Equations'
import TryThis, { type Preset } from './surfactants/TryThis'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEFAULT = { surf: 'sds' as SurfactantId, head: 'anionic' as HeadType, tail: 12, saltMM: 0, logC: -3 }
const [LOG_MIN, LOG_MAX] = C_RANGE.map(Math.log10)

const HEAD_LABEL: Record<HeadType, string> = {
  anionic: 'Anionic (−)',
  cationic: 'Cationic (+)',
  nonionic: 'Non-ionic',
  zwitterionic: 'Zwitterionic (+/−)',
}

/** Concentration with a sensible unit: 0.82 µM, 8.2 mM, 0.10 M. */
function fmtC(c: number): string {
  if (c >= 0.1) return `${c.toPrecision(2)} M`
  if (c >= 1e-4) return `${Number((c * 1e3).toPrecision(2))} mM`
  return `${Number((c * 1e6).toPrecision(2))} µM`
}

/** c/CMC as 0.012, 1.5, 47 or 3200. */
const fmtRatio = (r: number) => (r >= 100 ? String(Math.round(r)) : String(Number(r.toPrecision(2))))

// ---------- Plots ----------

// The x axis is the same on every plot: c in mM on a log scale, ticks at each decade.
const TICKS = [1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100, 1000]
const TICK_TEXT = ['10⁻⁴', '10⁻³', '0.01', '0.1', '1', '10', '100', '1000']
const xAxis = (t: ThemeColors, title: string) => ({
  ...axis(t),
  type: 'log' as const,
  range: [LOG_MIN + 3, LOG_MAX + 3],
  tickvals: TICKS,
  ticktext: TICK_TEXT,
  title: { text: title },
})

interface PropertyPlotProps {
  sys: System
  c: number
  f: (sys: System, c: number) => number
  yRange: [number, number]
  yTitle: string
  color: string
  theme: ThemeColors
  small?: boolean
  label: string
}

/** One property against log c, with the CMC line, the micelle region shaded and the current point marked. */
function PropertyPlot({ sys, c, f, yRange, yTitle, color, theme, small, label }: PropertyPlotProps) {
  const xs = concentrationGrid(sys.cmc)
  const y = f(sys, c)
  const off = y > yRange[1]
  const data: Data[] = [
    { x: xs.map((v) => v * 1e3), y: xs.map((v) => f(sys, v)), type: 'scatter', mode: 'lines', line: { color, width: small ? 2 : 3 } },
    {
      x: [c * 1e3],
      y: [Math.min(y, yRange[1])],
      type: 'scatter',
      mode: 'markers',
      cliponaxis: false, // keeps the ▲ visible when it is pinned to the top edge
      marker: { size: small ? 9 : 12, color, symbol: off ? 'triangle-up' : 'circle', line: { color: theme.plotBg, width: 2 } },
    },
  ]
  const cmcX = sys.cmc * 1e3
  const shapes: Partial<Shape>[] = [
    { type: 'rect', xref: 'x', yref: 'paper', x0: cmcX, x1: 10 ** (LOG_MAX + 3), y0: 0, y1: 1, layer: 'below', fillcolor: theme.data2Soft, line: { width: 0 } },
    { type: 'line', xref: 'x', yref: 'paper', x0: cmcX, x1: cmcX, y0: 0, y1: 1, line: { color: theme.text, width: 1.3, dash: 'dash' } },
  ]
  const annotations: Partial<Annotation>[] = [
    {
      xref: 'x',
      yref: 'paper',
      x: Math.log10(cmcX),
      y: 1,
      xanchor: 'left',
      yanchor: 'top',
      xshift: 3,
      text: 'CMC',
      showarrow: false,
      font: { size: small ? 11 : 12, color: theme.text },
    },
  ]
  const base = baseLayout(theme)
  return (
    <div role="img" aria-label={label}>
      <Plot
        data={data}
        layout={{
          ...base,
          showlegend: false,
          margin: small ? { l: 48, r: 8, t: 8, b: 36 } : base.margin,
          font: small ? { ...base.font, size: 12 } : base.font,
          xaxis: xAxis(theme, small ? 'c (mM)' : 'Surfactant concentration c (mM, log scale)'),
          yaxis: { ...axis(theme), title: { text: yTitle }, range: yRange },
          shapes,
          annotations,
        }}
        config={staticConfig}
        useResizeHandler
        className={small ? 'plot plot-small' : 'plot'}
      />
    </div>
  )
}

// ---------- Explanation under the controls ----------

function insight(sys: System, c: number): string {
  const ratio = c / sys.cmc
  if (ratio < 0.05)
    return 'Very dilute: only a few molecules sit at the surface, so γ is still close to pure water.'
  if (ratio < 1)
    return 'Below the CMC: each added molecule goes to the surface or stays a free monomer. γ keeps falling as the surface fills.'
  if (ratio < 1.5)
    return 'At the CMC: the surface is (nearly) full and the free monomer concentration has reached its limit, so the first micelles form.'
  return `Above the CMC: free monomers stay at the CMC, and everything you add (${fmtC(c - sys.cmc)} here) goes into micelles. γ no longer changes.`
}

export default function SurfactantPage() {
  const [surf, setSurf] = useState<SurfactantId>(DEFAULT.surf)
  const [customHead, setCustomHead] = useState<HeadType>(DEFAULT.head)
  const [customTail, setCustomTail] = useState(DEFAULT.tail)
  const [saltMM, setSaltMM] = useState(DEFAULT.saltMM)
  const [logC, setLogC] = useState(DEFAULT.logC)
  const [paused, setPaused] = useState(prefersReducedMotion)
  const theme = useThemeColors()

  const preset = PRESETS.find((p) => p.id === surf)
  const head = preset?.head ?? customHead
  const tail = preset?.tail ?? customTail
  const ionic = isIonic(head)
  const sys = makeSystem(head, tail, saltMM / 1e3)
  const c = 10 ** logC
  const above = c > sys.cmc
  const gamma = surfaceTension(sys, c)
  const Gamma = surfaceExcess(sys, c)
  const beta = counterionBinding(head)

  // What the molecular view draws. Monomer and micelle counts are on a compressed (square-root / log) scale,
  // since the real numbers span many decades.
  const coverage = Gamma / sys.gammaMax
  const monomers = Math.round(12 * Math.sqrt(freeMonomer(c, sys.cmc) / sys.cmc))
  const micelles = above ? Math.min(12, Math.ceil(5 * Math.log10(c / sys.cmc))) : 0

  const setC = (v: number) => setLogC(Math.min(LOG_MAX, Math.max(LOG_MIN, Math.round(Math.log10(v) * 100) / 100)))

  const reset = () => {
    setSurf(DEFAULT.surf)
    setCustomHead(DEFAULT.head)
    setCustomTail(DEFAULT.tail)
    setSaltMM(DEFAULT.saltMM)
    setLogC(DEFAULT.logC)
  }

  const applyPreset = (p: Preset) => {
    setSurf(p.surf)
    if (p.head) setCustomHead(p.head)
    if (p.tail !== undefined) setCustomTail(p.tail)
    setSaltMM(p.saltMM ?? 0)
    setLogC(p.logC)
    setPaused(false)
    requestAnimationFrame(() => document.getElementById('sim-figure')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  // Fixed y ranges per system: wide enough to show the change of slope at the CMC clearly.
  const condMax = Math.max(conductivity(sys, sys.cmc * 10), 1e-6) * 1.1
  const name = preset?.name ?? `Custom C${tail} ${head}`
  const state = above ? 'above the CMC' : 'below the CMC'

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Surfactants &amp; Micelle Formation</h1>
        <p className="lede">
          Add surfactant to water. First it crowds onto the surface and lowers the surface tension; once the surface is
          full, the extra molecules hide their tails in micelles. That switch happens at the critical micelle
          concentration, the CMC.
        </p>
      </header>

      {/* ---------- Hero: controls | molecular view + surface tension ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Surfactant simulator">
        <div className="cmc-layout">
          <div className="cmc-controls">
            <div className="select">
              <label className="control-label" htmlFor="surf">
                Surfactant
              </label>
              <select id="surf" value={surf} onChange={(e) => setSurf(e.target.value as SurfactantId)}>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({HEAD_LABEL[p.head].replace(/ \(.*\)/, '').toLowerCase()})
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
              <small className="control-note">{preset ? preset.chem : 'Choose the head type and tail length below.'}</small>
            </div>

            <div className={`select${preset ? ' inactive' : ''}`}>
              <label className="control-label" htmlFor="head">
                Head type
              </label>
              <select id="head" value={head} disabled={!!preset} onChange={(e) => setCustomHead(e.target.value as HeadType)}>
                {(Object.keys(HEAD_LABEL) as HeadType[]).map((h) => (
                  <option key={h} value={h}>
                    {HEAD_LABEL[h]}
                  </option>
                ))}
              </select>
            </div>

            <Slider
              id="tail"
              label={<>Tail length <em>n</em></>}
              value={`C${tail}`}
              min={TAIL_RANGE[0]}
              max={TAIL_RANGE[1]}
              step={1}
              pos={tail}
              onChange={setCustomTail}
              disabled={!!preset}
              className={preset ? 'inactive' : undefined}
              hint={preset ? 'Pick “Custom” to change' : 'carbons in the hydrophobic tail'}
            />

            <Slider
              id="salt"
              label={<>Added NaCl</>}
              value={ionic ? `${saltMM} mM` : '—'}
              min={0}
              max={SALT_MAX * 1e3}
              step={1}
              pos={ionic ? saltMM : 0}
              onChange={setSaltMM}
              disabled={!ionic}
              className={ionic ? undefined : 'inactive'}
              hint={ionic ? 'screens head-group repulsion' : 'only affects ionic surfactants'}
            />

            <Slider
              id="conc"
              label={<>Concentration <em>c</em></>}
              value={fmtC(c)}
              min={LOG_MIN}
              max={LOG_MAX}
              step={0.01}
              pos={logC}
              onChange={setLogC}
              hint="log scale"
            />
            <div className="sim-buttons">
              <button type="button" className="button" onClick={() => setC(sys.cmc / 10)}>
                CMC/10
              </button>
              <button type="button" className="button" onClick={() => setC(sys.cmc)}>
                CMC
              </button>
              <button type="button" className="button" onClick={() => setC(sys.cmc * 10)}>
                10×CMC
              </button>
            </div>

            <dl className="results cmc-results" aria-live="polite">
              <div className="result-main">
                <dt>CMC ({name})</dt>
                <dd>{fmtC(sys.cmc)}</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>
                  <span className={`state-badge${above ? ' above' : ''}`}>{state}</span>
                </dd>
              </div>
              <div>
                <dt>Free monomer</dt>
                <dd>{fmtC(freeMonomer(c, sys.cmc))}</dd>
              </div>
              <div>
                <dt>
                  Surface excess <em>Γ</em>
                </dt>
                <dd>{(Gamma * 1e6).toFixed(2)} µmol/m²</dd>
              </div>
              <div>
                <dt>Area per molecule (at Γ)</dt>
                <dd>{Gamma > sys.gammaMax * 1e-3 ? `${areaPerMolecule(Gamma).toFixed(2)} nm²` : '—'}</dd>
              </div>
              <div>
                <dt>
                  Minimum area (at Γ<sub>max</sub>)
                </dt>
                <dd>{areaPerMolecule(sys.gammaMax).toFixed(2)} nm²</dd>
              </div>
              {beta !== null && (
                <div>
                  <dt>Counterion binding β</dt>
                  <dd>{beta.toFixed(2)}</dd>
                </div>
              )}
            </dl>
            <div className="sim-buttons">
              <button type="button" className="button" onClick={() => setPaused((p) => !p)}>
                {paused ? 'Play' : 'Pause'}
              </button>
              <button type="button" className="button" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <div className="cmc-main">
            <div className="hero-head">
              <div className="coverage">
                <span className="coverage-label">
                  Surface tension <em>γ</em>
                </span>
                <span className="coverage-value surfactant">{(gamma * 1e3).toFixed(1)} mN/m</span>
                <span className="coverage-sub">
                  {fmtC(c)} · {fmtRatio(c / sys.cmc)} × CMC
                </span>
              </div>
              <ul className="layer-legend" aria-label="Legend">
                <li>
                  <span className="dot" style={{ background: headColor(head) }} /> head ({HEAD_LABEL[head].toLowerCase()})
                </li>
                <li>
                  <span className="tail-key" /> hydrophobic tail
                </li>
              </ul>
            </div>
            <MicelleView
              coverage={coverage}
              monomers={monomers}
              micelles={micelles}
              head={head}
              tail={tail}
              paused={paused}
              label={
                `Beaker with ${name} at ${fmtC(c)}, ${state}. The surface is ${Math.round(coverage * 100)} % full` +
                (micelles ? `, with micelles in the water.` : ', and there are no micelles.')
              }
            />
            <PropertyPlot
              sys={sys}
              c={c}
              f={(s, v) => surfaceTension(s, v) * 1e3}
              yRange={[20, 75]}
              yTitle="γ (mN/m)"
              color={theme.data1}
              theme={theme}
              label={`Surface tension against log concentration. CMC ${fmtC(sys.cmc)}. At ${fmtC(c)}: ${(gamma * 1e3).toFixed(1)} mN/m.`}
            />
          </div>
        </div>

        <p className="insight" aria-live="polite">
          {insight(sys, c)}
        </p>

        <div className="multiples">
          <div className={`multiple${ionic ? '' : ' disabled'}`}>
            <h3>
              Conductivity <em>κ</em> {beta !== null && <span className="multiple-note">β = {beta.toFixed(2)}</span>}
            </h3>
            {ionic ? (
              <PropertyPlot
                small
                sys={sys}
                c={c}
                f={conductivity}
                yRange={[0, condMax]}
                yTitle="κ (mS/cm)"
                color={theme.data2}
                theme={theme}
                label={`Conductivity: two straight lines meeting at the CMC; the slope drops above it. β = ${beta?.toFixed(2)}.`}
              />
            ) : (
              <p className="multiple-empty">
                {head === 'nonionic' ? 'Non-ionic' : 'Zwitterionic'} surfactants carry no net charge and release no
                counterions, so they barely change the conductivity: there is no CMC break to see here.
              </p>
            )}
          </div>
          <div className="multiple">
            <h3>
              Osmotic pressure <span className="tag">qualitative</span>
            </h3>
            <PropertyPlot
              small
              sys={sys}
              c={c}
              f={osmoticRel}
              yRange={[0, 2]}
              yTitle="Π / Π<sub>CMC</sub>"
              color={theme.data2}
              theme={theme}
              label="Osmotic pressure rises with concentration, then nearly levels off above the CMC."
            />
          </div>
          <div className="multiple">
            <h3>
              Turbidity <span className="tag">qualitative</span>
            </h3>
            <PropertyPlot
              small
              sys={sys}
              c={c}
              f={turbidityRel}
              yRange={[0, 10]}
              yTitle="τ (rel.)"
              color={theme.data2}
              theme={theme}
              label="Turbidity is zero below the CMC and rises above it."
            />
          </div>
          <div className="multiple">
            <h3>
              Self-diffusion <em>D</em> <span className="tag">qualitative</span>
            </h3>
            <PropertyPlot
              small
              sys={sys}
              c={c}
              f={diffusionRel}
              yRange={[0, 1.1]}
              yTitle="D / D<sub>monomer</sub>"
              color={theme.data2}
              theme={theme}
              label="The average self-diffusion coefficient is constant below the CMC and falls above it."
            />
          </div>
        </div>

        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: controls and results. Right: the beaker (heads in the
          water, tails in the air or hidden in micelles) and the surface tension. Below: four more properties. On every
          plot the dashed line is the CMC, the shaded part is where micelles exist, and the dot is the current
          concentration (▲ if off the top). The beaker draws monomers and micelles on a compressed scale. Osmotic
          pressure, turbidity and D are qualitative shapes; conductivity is the surfactant's own contribution (its two
          straight lines look curved on the log axis; the kink at the CMC is the drop in slope).
        </figcaption>
      </figure>

      <Theory />

      <Equations />

      <TryThis onApply={applyPreset} />
    </article>
  )
}

const headColor = (h: HeadType) =>
  h === 'anionic' ? 'var(--data-2)'
  : h === 'cationic' ? 'var(--data-1)'
  : h === 'nonionic' ? 'var(--layer-2)'
  : 'linear-gradient(90deg, var(--data-1) 50%, var(--data-2) 50%)'
