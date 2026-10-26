import { useMemo, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import Tex from '../components/Tex'
import { Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  ALPHA_RANGE,
  C_UNIT,
  coefficients,
  dominant,
  I_RANGE,
  K_B,
  MOLECULE_DEFAULT,
  MOLECULES,
  MU_RANGE,
  phi,
  R_DEFAULT,
  R_RANGE,
  shares,
  T_DEFAULT,
  T_RANGE,
  TERM_NAMES,
  thermalDistance,
  ZJ,
  type Term,
} from '../lib/vdw'
import Theory from './vdw/Theory'

const TERMS: Term[] = ['keesom', 'debye', 'london']
const N_POINTS = 200
const CUSTOM = 'custom'

const fmtC = (C: number) => {
  const v = C / C_UNIT
  return v === 0 ? '0' : v < 10 ? v.toFixed(1) : v.toFixed(0)
}

export default function VdwPage() {
  const start = MOLECULES.find((m) => m.id === MOLECULE_DEFAULT)!
  const [molId, setMolId] = useState(MOLECULE_DEFAULT)
  const [mu, setMu] = useState(start.mu)
  const [alpha, setAlpha] = useState(start.alpha)
  const [I, setI] = useState(start.I)
  const [T, setT] = useState(T_DEFAULT)
  const [r, setR] = useState(R_DEFAULT)
  const theme = useThemeColors()
  const COLORS: Record<Term | 'total', string> = {
    keesom: theme.data1,
    debye: theme.data2,
    london: theme.data3,
    total: theme.text,
  }

  const custom = molId === CUSTOM
  const mol = MOLECULES.find((m) => m.id === molId)
  const name = mol ? mol.name : 'your molecule'

  const pick = (id: string) => {
    setMolId(id)
    const m = MOLECULES.find((x) => x.id === id)
    if (m) {
      setMu(m.mu)
      setAlpha(m.alpha)
      setI(m.I)
    }
  }

  const loadH2 = () => {
    pick('H2')
    setT(T_DEFAULT)
    requestAnimationFrame(() => document.getElementById('sim-figure')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const reset = () => {
    pick(MOLECULE_DEFAULT)
    setT(T_DEFAULT)
    setR(R_DEFAULT)
  }

  const C = coefficients(mu, alpha, I, T)
  const pct = shares(C)
  const kT = K_B * T
  const kTzJ = kT / ZJ
  const rStar = thermalDistance(C.total, T)
  const phiR = phi(C.total, r)
  const ratio = -phiR / kT

  // ---------- φ(r) plot ----------
  const curves = useMemo(() => {
    const rs: number[] = []
    for (let i = 0; i <= N_POINTS; i++) rs.push(R_RANGE[0] + ((R_RANGE[1] - R_RANGE[0]) * i) / N_POINTS)
    const of = (c: number) => rs.map((x) => phi(c, x) / ZJ)
    return { rs, keesom: of(C.keesom), debye: of(C.debye), london: of(C.london), total: of(C.total) }
  }, [C.keesom, C.debye, C.london, C.total])

  const yLo = -1.08 * Math.max(-curves.total[0], 2 * kTzJ)
  const yRange: [number, number] = [yLo, -0.06 * yLo]

  const phiData: Data[] = [
    ...TERMS.filter((t) => C[t] > 0).map(
      (t): Data => ({
        x: curves.rs,
        y: curves[t],
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS[t], width: 2, dash: 'dash' },
      }),
    ),
    { x: curves.rs, y: curves.total, type: 'scatter', mode: 'lines', line: { color: COLORS.total, width: 3 } },
    {
      x: [r],
      y: [Math.max(phiR / ZJ, yLo)],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 11, color: COLORS.total, line: { color: theme.plotBg, width: 2 } },
    },
  ]

  const thermalFrom = Math.max(rStar, R_RANGE[0])
  const phiShapes: Partial<Shape>[] = [
    ...(rStar < R_RANGE[1]
      ? [
          {
            type: 'rect' as const,
            xref: 'x' as const,
            yref: 'paper' as const,
            x0: thermalFrom,
            x1: R_RANGE[1],
            y0: 0,
            y1: 1,
            layer: 'below' as const,
            fillcolor: theme.accentSoft,
            line: { width: 0 },
          },
        ]
      : []),
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.axis, width: 1 } },
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: -kTzJ, y1: -kTzJ, line: { color: theme.muted, width: 1.5, dash: 'dot' } },
  ]

  const phiAnnotations: Partial<Annotation>[] = [
    {
      xref: 'paper',
      x: 0.99,
      y: -kTzJ,
      xanchor: 'right',
      yanchor: 'top',
      yshift: -2,
      text: `−kT (${T} K)`,
      showarrow: false,
      font: { size: 12, color: theme.muted },
    },
    ...(R_RANGE[1] - thermalFrom > 0.12
      ? [
          {
            xref: 'x' as const,
            yref: 'paper' as const,
            x: (thermalFrom + R_RANGE[1]) / 2,
            y: 0.08,
            yanchor: 'bottom' as const,
            text: '|φ| < kT: thermal motion wins',
            showarrow: false,
            font: { size: 12, color: theme.text },
          },
        ]
      : []),
  ]

  // ---------- Share bar ----------
  const barData: Data[] = TERMS.map(
    (t): Data => ({
      x: [pct[t]],
      y: [''],
      type: 'bar',
      orientation: 'h',
      marker: { color: COLORS[t] },
      text: pct[t] >= 6 ? [`${Math.round(pct[t])}%`] : [''],
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: { color: theme.plotBg, size: 13 },
    }),
  )

  const lead = dominant(C)
  const onlyLondon = C.keesom === 0 && C.debye === 0
  const sentence = onlyLondon
    ? `For ${name} only London acts.`
    : `For ${name} at ${T} K, ${TERM_NAMES[lead]} dominates (${Math.round(pct[lead])}%).`
  const thermal =
    ratio >= 1
      ? `At r = ${r.toFixed(2)} nm, |φ| = ${ratio.toFixed(1)} kT: the attraction beats thermal motion.`
      : `At r = ${r.toFixed(2)} nm, |φ| = ${ratio.toFixed(2)} kT: thermal motion wins.`

  const plotLabel =
    `Pair energy against distance, ${R_RANGE[0]} to ${R_RANGE[1]} nm, for ${name}. ` +
    `At r = ${r.toFixed(2)} nm the total is ${(phiR / ZJ).toFixed(2)} zJ; kT is ${kTzJ.toFixed(2)} zJ. ` +
    `Thermal motion wins beyond ${rStar.toFixed(2)} nm.`

  return (
    <article className="page">
      <header className="page-intro">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Van der Waals Forces: Keesom, Debye, London</h1>
        <p className="lede">
          Van der Waals attraction between neutral molecules is the sum of three terms. All three fall off as 1/r⁶, so
          they add into one constant. (Short-range repulsion and Lennard-Jones are a separate topic.)
        </p>
        <div className="formula">
          <div className="formula-body eq-math">
            <Tex display tex={String.raw`\varphi(r) = -\frac{C_\text{vdW}}{r^6}`} />
            <Tex display tex={String.raw`C_\text{vdW} = C_\text{Keesom} + C_\text{Debye} + C_\text{London}`} />
          </div>
        </div>
      </header>

      <Theory />

      {/* ---------- Simulation ---------- */}
      <section className="section" aria-labelledby="sim-title">
        <h2 id="sim-title" className="section-title">
          Simulation
        </h2>
        <figure id="sim-figure" className="figure" aria-label="Van der Waals contributions and pair energy">
          <div className="area-grid vdw-grid">
            <div className="plot-col">
              <ul className="plot-legend" aria-label="Plot legend">
                {TERMS.map((t) => (
                  <li key={t}>
                    <span className="key-line dashed" style={{ borderColor: COLORS[t] }} /> {TERM_NAMES[t]}
                  </li>
                ))}
                <li>
                  <span className="key-line" style={{ borderColor: COLORS.total }} /> total
                </li>
              </ul>
              <div role="img" aria-label={plotLabel}>
                <Plot
                  data={phiData}
                  layout={{
                    ...baseLayout(theme),
                    showlegend: false,
                    xaxis: { ...axis(theme), title: { text: 'Distance r (nm)' }, range: R_RANGE },
                    yaxis: { ...axis(theme), title: { text: 'φ(r)  (zJ = 10⁻²¹ J)' }, range: yRange },
                    shapes: phiShapes,
                    annotations: phiAnnotations,
                  }}
                  config={staticConfig}
                  useResizeHandler
                  className="plot"
                />
              </div>
            </div>
            <div className="vdw-side">
              <h3 className="vdw-side-title">Share of C<sub>vdW</sub></h3>
              <div role="img" aria-label={TERMS.map((t) => `${TERM_NAMES[t]} ${Math.round(pct[t])}%`).join(', ')}>
                <Plot
                  data={barData}
                  layout={{
                    ...baseLayout(theme),
                    showlegend: false,
                    barmode: 'stack',
                    margin: { l: 4, r: 4, t: 4, b: 24 },
                    xaxis: { ...axis(theme), range: [0, 100], ticksuffix: '%', dtick: 25 },
                    yaxis: { visible: false },
                  }}
                  config={staticConfig}
                  useResizeHandler
                  className="plot vdw-bar"
                />
              </div>
              <dl className="results vdw-results">
                {TERMS.map((t) => (
                  <div key={t}>
                    <dt>
                      <span className="dot" style={{ background: COLORS[t] }} /> C<sub>{TERM_NAMES[t]}</sub>
                    </dt>
                    <dd>{fmtC(C[t])}</dd>
                  </div>
                ))}
                <div className="result-main">
                  <dt>
                    C<sub>vdW</sub>
                  </dt>
                  <dd>{fmtC(C.total)}</dd>
                </div>
              </dl>
              <p className="note">C in units of 10⁻⁷⁹ J·m⁶.</p>
            </div>
          </div>

          <p className="insight" aria-live="polite">
            <strong>{sentence}</strong> {thermal}
          </p>

          <div className="figure-controls vdw-controls">
            <label className="select">
              <span className="control-label">Molecule (identical pair)</span>
              <select value={molId} onChange={(e) => pick(e.target.value)}>
                {MOLECULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value={CUSTOM}>Custom</option>
              </select>
            </label>
            <Slider
              id="mu"
              label={<>Dipole moment <em>μ</em></>}
              value={`${mu.toFixed(2)} D`}
              min={MU_RANGE[0]}
              max={MU_RANGE[1]}
              step={0.01}
              pos={mu}
              onChange={setMu}
              disabled={!custom}
              className={custom ? undefined : 'inactive'}
            />
            <Slider
              id="alpha"
              label={<>Polarizability <em>α</em></>}
              value={`${alpha.toFixed(2)} Å³`}
              min={ALPHA_RANGE[0]}
              max={ALPHA_RANGE[1]}
              step={0.01}
              pos={alpha}
              onChange={setAlpha}
              disabled={!custom}
              className={custom ? undefined : 'inactive'}
            />
            <Slider
              id="ion"
              label={<>Ionisation energy <em>I</em></>}
              value={`${I.toFixed(1)} eV`}
              min={I_RANGE[0]}
              max={I_RANGE[1]}
              step={0.1}
              pos={I}
              onChange={setI}
              disabled={!custom}
              className={custom ? undefined : 'inactive'}
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
              hint="changes Keesom and kT only"
            />
            <Slider
              id="r"
              label={<>Distance <em>r</em></>}
              value={`${r.toFixed(2)} nm`}
              min={R_RANGE[0]}
              max={R_RANGE[1]}
              step={0.01}
              pos={r}
              onChange={setR}
            />
            <div className="sim-buttons">
              <button type="button" className="button" onClick={reset}>
                Reset
              </button>
            </div>
            {!custom && <p className="note vdw-hint">Choose “Custom” to change μ, α and I.</p>}
          </div>

          <figcaption>
            <span className="figure-label">Figure 1.</span> Left: pair energy φ(r) of each term (dashed) and the total;
            the dot is the chosen r. Shaded: |φ| &lt; kT, where thermal motion wins. Right: share of each term in C
            <sub>vdW</sub>.
          </figcaption>
        </figure>
      </section>

      <section className="section" aria-labelledby="takeaways-title">
        <h2 id="takeaways-title" className="section-title">
          Key takeaways
        </h2>
        <ul className="why-list">
          <li>All three terms scale as −1/r⁶: halve the distance and the attraction is 64× stronger.</li>
          <li>Only Keesom depends on temperature (∝ 1/T).</li>
          <li>London acts between all molecules and is usually the largest term.</li>
          <li>Water is the exception: its large dipole and small α make Keesom dominate.</li>
        </ul>
      </section>

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <p className="prose">
          <strong>Why hydrogen is hard to store.</strong> H<sub>2</sub> is nonpolar with a tiny polarizability (0.80
          Å³), so only weak London forces act. As a result:
        </p>
        <ul className="why-list">
          <li>
            <strong>Liquid H<sub>2</sub>.</strong> It boils at about 20 K, so liquid storage costs a lot of energy for
            cooling.
          </li>
          <li>
            <strong>Physisorption.</strong> Porous carbons and MOFs reach useful capacities only at cryogenic
            temperatures (~77 K); at room temperature they hold about 1 wt% or less.
          </li>
        </ul>
        <p>
          <button type="button" className="button" onClick={loadH2}>
            Load H₂ in the simulator
          </button>
        </p>
      </section>

    </article>
  )
}
