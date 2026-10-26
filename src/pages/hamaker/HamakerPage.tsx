import React, { useState } from 'react'
import type { Data, Shape, Annotation } from 'plotly.js'
import PlotlyChart from '../../components/Plot'
import { Slider } from '../../components/Controls'
import Tex from '../../components/Tex'
import { useThemeColors, type ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'

interface Material {
  name: string
  eps: number // static dielectric constant
  n: number // refractive index (visible)
}

// Approximate textbook values (Israelachvili, Intermolecular and Surface Forces). All share one absorption
// frequency ν_e, which suits dielectrics with n ≈ 1.3–1.8; high-index oxides such as TiO₂ absorb much lower in the UV,
// so the single-ν_e formula would overestimate them several times and they are left out.
const MATERIALS: Material[] = [
  { name: 'Vacuum / air', eps: 1.0, n: 1.0 },
  { name: 'Water', eps: 80, n: 1.333 },
  { name: 'Ethanol', eps: 25, n: 1.361 },
  { name: 'NMP (slurry solvent)', eps: 32, n: 1.47 },
  { name: 'Hexane', eps: 1.9, n: 1.375 },
  { name: 'PTFE (Teflon)', eps: 2.1, n: 1.35 },
  { name: 'Polystyrene', eps: 2.55, n: 1.557 },
  { name: 'Silica (SiO₂)', eps: 3.8, n: 1.46 },
  { name: 'Mica', eps: 7.0, n: 1.58 },
  { name: 'Alumina (Al₂O₃)', eps: 10.0, n: 1.75 },
]

const KT = 1.380649e-23 * 298 // J at 298 K
const PLANCK = 6.62607e-34 // J s
const NU_E = 3.0e15 // main electronic absorption frequency, Hz

/** Combined Hamaker constant A132 (J): static + dispersion terms. */
const hamaker = (a: Material, b: Material, m: Material) => {
  const s1 = (a.eps - m.eps) / (a.eps + m.eps)
  const s2 = (b.eps - m.eps) / (b.eps + m.eps)
  const stat = 0.75 * KT * s1 * s2

  const q1 = Math.sqrt(a.n * a.n + m.n * m.n)
  const q2 = Math.sqrt(b.n * b.n + m.n * m.n)
  const num = (a.n * a.n - m.n * m.n) * (b.n * b.n - m.n * m.n)
  const disp = ((3 * PLANCK * NU_E) / (8 * Math.SQRT2)) * (num / (q1 * q2 * (q1 + q2)))
  return { stat, disp, total: stat + disp }
}

const tick = (v: number) => (v === 0 ? '0' : Number(v.toPrecision(2)).toString())

const MARK = '#dc2626'

interface PlotProps {
  fn: (x: number) => number
  xMin: number
  xMax: number
  yAbs: number
  yLabel: string
  mark: { x: number; label: string }
  ariaLabel: string
  theme: ThemeColors
}

const Plot: React.FC<PlotProps> = ({ fn, xMin, xMax, yAbs, yLabel, mark, ariaLabel, theme }) => {
  const yMax = yAbs
  const yMin = -yAbs

  // Sample the curve, leaving a gap where it leaves the plot area
  const xs: number[] = []
  const ys: (number | null)[] = []
  for (let i = 0; i <= 300; i++) {
    const x = xMin + ((xMax - xMin) * i) / 300
    const v = fn(x)
    xs.push(x)
    ys.push(v > yMax || v < yMin ? null : v)
  }

  const xTicks = [0, 1, 2, 3, 4].map((i) => xMin + ((xMax - xMin) * i) / 4)
  const yTicks = [-1, -0.5, 0, 0.5, 1].map((f) => f * yAbs)
  const markY = fn(mark.x)

  const data: Data[] = [
    { x: xs, y: ys, type: 'scatter', mode: 'lines', line: { color: theme.data1, width: 3 } },
    {
      x: [mark.x],
      y: [markY],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, color: MARK, line: { color: theme.plotBg, width: 2 } },
    },
  ]
  // zero line
  const shapes: Partial<Shape>[] = [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.muted, width: 1.5 } }]
  const annotations: Partial<Annotation>[] = [
    { x: mark.x, y: markY, xanchor: 'left', yanchor: 'bottom', xshift: 8, yshift: 4, text: mark.label, showarrow: false, font: { size: 12, color: theme.text } },
  ]

  return (
    <div role="img" aria-label={ariaLabel}>
      <PlotlyChart
        data={data}
        layout={{
          ...baseLayout(theme),
          // Room for the last x tick label, which sits on the right edge
          margin: { ...baseLayout(theme).margin, r: 24 },
          showlegend: false,
          xaxis: {
            ...axis(theme),
            title: { text: 'Separation D (nm)' },
            // A hair of padding: Plotly hides a tick label that sits exactly on the range end.
            range: [xMin - (xMax - xMin) * 1e-6, xMax + (xMax - xMin) * 1e-6],
            tickvals: xTicks,
            ticktext: xTicks.map((x) => x.toFixed(1)),
          },
          yaxis: {
            ...axis(theme),
            title: { text: yLabel },
            range: [yMin, yMax],
            tickvals: yTicks,
            ticktext: yTicks.map(tick),
          },
          shapes,
          annotations,
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}

const find = (name: string) => MATERIALS.findIndex((m) => m.name === name)

export const HamakerPage: React.FC = () => {
  const [i1, setI1] = useState<number>(find('Silica (SiO₂)'))
  const [i3, setI3] = useState<number>(find('Water'))
  const [i2, setI2] = useState<number>(find('Silica (SiO₂)'))
  const [geometry, setGeometry] = useState<'sphere' | 'plane'>('sphere')
  const [radiusNm, setRadiusNm] = useState<number>(1000)
  const theme = useThemeColors()

  const m1 = MATERIALS[i1]
  const m2 = MATERIALS[i2]
  const m3 = MATERIALS[i3]
  const A = hamaker(m1, m2, m3)
  const a20 = A.total / 1e-20 // in units of 10^-20 J

  const verdict =
    a20 > 0.05
      ? { text: 'Attraction', note: 'A₁₃₂ > 0: the two surfaces are pulled together (adhesion).' }
      : a20 < -0.05
        ? { text: 'Repulsion', note: 'A₁₃₂ < 0: the medium is "preferred" between the surfaces, so they are pushed apart.' }
        : { text: 'Almost zero', note: '|A₁₃₂| is tiny: the medium nearly matches the materials, so van der Waals forces nearly cancel.' }

  const R = radiusNm * 1e-9
  // Energy: sphere-plane W = -A R / (6 D) in kT; plane-plane W = -A / (12 pi D^2) in mJ/m^2
  const energy = (dNm: number) => {
    const D = dNm * 1e-9
    return geometry === 'sphere' ? (-A.total * R) / (6 * D) / KT : ((-A.total / (12 * Math.PI * D * D)) * 1e3)
  }
  const unit = geometry === 'sphere' ? 'kT' : 'mJ/m²'
  const e1 = energy(1)
  const yAbs = Math.max(Math.abs(energy(0.5)), 1e-6) * 1.1

  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Hamaker & Lifshitz: vdW Between Surfaces</h1>
        <p className="lede">Pick two materials and a medium: attraction or repulsion?</p>
      </header>

      <figure id="sim-figure" className="figure hero" aria-label="Hamaker constant and interaction energy">
        <div className="sim-grid">
          <div className="plot-col">
            <h2 className="panel-title">Interaction energy W(D)</h2>
            <Plot
              fn={energy}
              xMin={0.5}
              xMax={10}
              yAbs={yAbs}
              yLabel={`W (${unit})`}
              mark={{ x: 1, label: 'D = 1 nm' }}
              ariaLabel="van der Waals interaction energy against separation"
              theme={theme}
            />
          </div>

          <div className="sim-side">
            <h3 className="panel-title">Result</h3>
            <p className="insight" aria-live="polite">
              <strong>{verdict.text}</strong>: {verdict.note}
            </p>
            <dl className="results">
              <div>
                <dt>Hamaker constant A<sub>132</sub>:</dt>{' '}
                <dd>{a20.toFixed(3)} × 10<sup>−20</sup> J ({(A.total / KT).toFixed(2)} kT)</dd>
              </div>
              <div>
                <dt>Static (dielectric) term:</dt>{' '}
                <dd>{(A.stat / 1e-20).toFixed(3)} × 10<sup>−20</sup> J</dd>
              </div>
              <div>
                <dt>Dispersion (refractive index) term:</dt>{' '}
                <dd>{(A.disp / 1e-20).toFixed(3)} × 10<sup>−20</sup> J</dd>
              </div>
              <div>
                <dt>Refractive indices:</dt>{' '}
                <dd>n<sub>1</sub> = {m1.n}, n<sub>3</sub> = {m3.n}, n<sub>2</sub> = {m2.n}</dd>
              </div>
              <div>
                <dt>Energy at D = 1 nm:</dt>{' '}
                <dd>{tick(e1)} {unit}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="figure-controls hero-controls flow-controls select-controls">
          <h2 className="panel-title">Materials</h2>
          <label className="select">
            <span className="control-label">Material 1</span>
            <select id="h-m1" value={i1} onChange={(e) => setI1(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="control-label">Medium between them (3)</span>
            <select id="h-m3" value={i3} onChange={(e) => setI3(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="control-label">Material 2</span>
            <select id="h-m2" value={i2} onChange={(e) => setI2(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="control-label">Geometry</span>
            <select id="h-geo" value={geometry} onChange={(e) => setGeometry(e.target.value as 'sphere' | 'plane')}>
              <option value="sphere">Sphere–plane</option>
              <option value="plane">Plane–plane</option>
            </select>
          </label>
          {geometry === 'sphere' && (
            <Slider
              id="h-r"
              label={<>Sphere radius R:{' '}</>}
              value={radiusNm >= 1000 ? `${(radiusNm / 1000).toFixed(1)} µm` : `${radiusNm} nm`}
              min={100}
              max={10000}
              step={100}
              pos={radiusNm}
              onChange={setRadiusNm}
            />
          )}
          <div className="sim-buttons">
            <button
              type="button"
              className="button"
              onClick={() => {
                setI1(find('Vacuum / air'))
                setI3(find('Hexane'))
                setI2(find('Silica (SiO₂)'))
              }}
            >
              Show a repulsive case (liquid film on silica)
            </button>
          </div>
        </div>

        <figcaption>
          {geometry === 'sphere'
            ? 'Sphere–plane: W = −A₁₃₂R / 6D, so the energy falls as 1/D.'
            : 'Plane–plane: W = −A₁₃₂ / 12πD² per unit area, so the energy falls as 1/D².'}{' '}
          Negative energy means attraction, positive means repulsion.
        </figcaption>
      </figure>

      <section className="section" aria-labelledby="hamaker-eq-title">
        <h2 id="hamaker-eq-title" className="section-title">The equations</h2>
        <p className="prose">
          Lifshitz theory with one main UV absorption frequency ν<sub>e</sub> ≈ 3 × 10¹⁵ Hz for all three media
          (Israelachvili):
        </p>
        <div className="formula">
          <div className="formula-body eq-math">
            <Tex
              display
              tex={String.raw`A_{132} \approx \tfrac34 kT\,\frac{\varepsilon_1-\varepsilon_3}{\varepsilon_1+\varepsilon_3}\,\frac{\varepsilon_2-\varepsilon_3}{\varepsilon_2+\varepsilon_3} + \frac{3h\nu_e}{8\sqrt2}\,\frac{(n_1^2-n_3^2)(n_2^2-n_3^2)}{\sqrt{n_1^2+n_3^2}\,\sqrt{n_2^2+n_3^2}\,\left(\sqrt{n_1^2+n_3^2}+\sqrt{n_2^2+n_3^2}\right)}`}
            />
            <Tex display tex={String.raw`W_\text{sphere–plane} = -\frac{A_{132}R}{6D},\qquad W_\text{plane–plane} = -\frac{A_{132}}{12\pi D^2}`} />
          </div>
        </div>
        <p className="note">
          ε: static dielectric constants; n: refractive indices; 1 and 2 are the materials, 3 the medium. The first
          (static) term is screened by dissolved ions: in salt water it largely disappears and only the dispersion term
          remains.
        </p>
      </section>

      <section className="section" aria-labelledby="hamaker-why-title">
        <h2 id="hamaker-why-title" className="section-title">Clean energy link</h2>
        <p className="prose">
          Particle adhesion in electrode slurries and coatings: if A<sub>132</sub> is large and positive in the solvent,
          particles stick together (agglomerate) and coatings become uneven. For transparent particles a solvent with a
          refractive index close to theirs makes A<sub>132</sub> small. Electrode particles (carbon black, Pt,
          graphite, NMC) absorb light and have large Hamaker constants in any solvent, so their slurries are kept
          dispersed by binders and polymers (steric repulsion) or by surface charge instead.
        </p>
        <p className="note">
          Values are approximate (Lifshitz theory with a single absorption frequency, no retardation). Real
          interactions beyond about 5 nm are weaker.
        </p>
      </section>
    </article>
  )
}
