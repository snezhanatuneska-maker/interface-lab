import React, { useState } from 'react'

interface Material {
  name: string
  eps: number // static dielectric constant
  n: number // refractive index (visible)
}

// Approximate textbook values (Israelachvili, Intermolecular and Surface Forces)
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
  { name: 'Titania (TiO₂)', eps: 100, n: 2.6 },
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

const W = 600
const H = 300
const M = { l: 62, r: 16, t: 14, b: 40 }

interface PlotProps {
  fn: (x: number) => number
  xMin: number
  xMax: number
  yAbs: number
  yLabel: string
  mark: { x: number; label: string }
  ariaLabel: string
}

const Plot: React.FC<PlotProps> = ({ fn, xMin, xMax, yAbs, yLabel, mark, ariaLabel }) => {
  const pw = W - M.l - M.r
  const ph = H - M.t - M.b
  const yMax = yAbs
  const yMin = -yAbs
  const X = (x: number) => M.l + ((x - xMin) / (xMax - xMin)) * pw
  const Y = (v: number) => M.t + ((yMax - v) / (yMax - yMin)) * ph

  let d = ''
  let pen = false
  for (let i = 0; i <= 300; i++) {
    const x = xMin + ((xMax - xMin) * i) / 300
    const v = fn(x)
    if (v > yMax || v < yMin) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(v).toFixed(1)} `
    pen = true
  }

  const xTicks = [0, 1, 2, 3, 4].map((i) => xMin + ((xMax - xMin) * i) / 4)
  const yTicks = [-1, -0.5, 0, 0.5, 1].map((f) => f * yAbs)
  const muted = 'var(--muted, #6b6b66)'
  const line = 'var(--border, #e3e3de)'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lj-plot" role="img" aria-label={ariaLabel} style={{ width: '100%', height: 'auto' }}>
      {yTicks.map((v, i) => (
        <g key={`y${i}`}>
          <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={line} />
          <text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={muted}>
            {tick(v)}
          </text>
        </g>
      ))}
      {xTicks.map((x, i) => (
        <text key={`x${i}`} x={X(x)} y={H - 20} textAnchor="middle" fontSize="11" fill={muted}>
          {x.toFixed(1)}
        </text>
      ))}
      <text x={M.l + pw / 2} y={H - 4} textAnchor="middle" fontSize="12" fill={muted}>
        Separation D (nm)
      </text>
      <text x={14} y={M.t + ph / 2} textAnchor="middle" fontSize="12" fill={muted} transform={`rotate(-90 14 ${M.t + ph / 2})`}>
        {yLabel}
      </text>
      <line x1={M.l} x2={W - M.r} y1={Y(0)} y2={Y(0)} stroke={muted} strokeWidth="1.5" />
      <path d={d} fill="none" stroke="var(--accent-color, #2563eb)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx={X(mark.x)} cy={Y(fn(mark.x))} r="6" fill="#dc2626" />
      <text x={X(mark.x) + 10} y={Y(fn(mark.x)) - 8} fontSize="11" fill="var(--text, #1d1d1b)">
        {mark.label}
      </text>
    </svg>
  )
}

const find = (name: string) => MATERIALS.findIndex((m) => m.name === name)

export const HamakerPage: React.FC = () => {
  const [i1, setI1] = useState<number>(find('Silica (SiO₂)'))
  const [i3, setI3] = useState<number>(find('Water'))
  const [i2, setI2] = useState<number>(find('Silica (SiO₂)'))
  const [geometry, setGeometry] = useState<'sphere' | 'plane'>('sphere')
  const [radiusNm, setRadiusNm] = useState<number>(1000)

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
    <div className="container wide page">
      <header className="page-header">
        <h1>Hamaker & Lifshitz: vdW Between Surfaces</h1>
        <p className="subtitle">Pick two materials and a medium: attraction or repulsion?</p>
      </header>

      <div className="grid two-column">
        <div className="card controls-card">
          <h2>Materials</h2>
          <div className="control-group">
            <label htmlFor="h-m1">Material 1</label>
            <select id="h-m1" value={i1} onChange={(e) => setI1(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="h-m3">Medium between them (3)</label>
            <select id="h-m3" value={i3} onChange={(e) => setI3(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="h-m2">Material 2</label>
            <select id="h-m2" value={i2} onChange={(e) => setI2(parseInt(e.target.value, 10))}>
              {MATERIALS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="h-geo">Geometry</label>
            <select id="h-geo" value={geometry} onChange={(e) => setGeometry(e.target.value as 'sphere' | 'plane')}>
              <option value="sphere">Sphere–plane</option>
              <option value="plane">Plane–plane</option>
            </select>
          </div>
          {geometry === 'sphere' && (
            <div className="control-group">
              <label htmlFor="h-r">
                Sphere radius R: <strong>{radiusNm >= 1000 ? `${(radiusNm / 1000).toFixed(1)} µm` : `${radiusNm} nm`}</strong>
              </label>
              <input id="h-r" type="range" min="100" max="10000" step="100" value={radiusNm} onChange={(e) => setRadiusNm(parseInt(e.target.value, 10))} />
            </div>
          )}
          <div className="control-group">
            <button
              type="button"
              onClick={() => {
                setI1(find('Vacuum / air'))
                setI3(find('Hexane'))
                setI2(find('Silica (SiO₂)'))
              }}
            >
              Show a repulsive case (liquid film on silica)
            </button>
          </div>

          <div className="stats-box">
            <h3>Result</h3>
            <p>
              <strong>{verdict.text}</strong>: {verdict.note}
            </p>
            <p>
              <strong>Hamaker constant A<sub>132</sub>:</strong> {a20.toFixed(3)} × 10<sup>−20</sup> J ({(A.total / KT).toFixed(2)} kT)
            </p>
            <p>
              Static (dielectric) term: {(A.stat / 1e-20).toFixed(3)} × 10<sup>−20</sup> J
            </p>
            <p>
              Dispersion (refractive index) term: {(A.disp / 1e-20).toFixed(3)} × 10<sup>−20</sup> J
            </p>
            <p>
              <strong>Refractive indices:</strong> n<sub>1</sub> = {m1.n}, n<sub>3</sub> = {m3.n}, n<sub>2</sub> = {m2.n}
            </p>
            <p>
              <strong>Energy at D = 1 nm:</strong> {tick(e1)} {unit}
            </p>
          </div>
        </div>

        <div className="card plot-card">
          <h2>Interaction energy W(D)</h2>
          <Plot
            fn={energy}
            xMin={0.5}
            xMax={10}
            yAbs={yAbs}
            yLabel={`W (${unit})`}
            mark={{ x: 1, label: 'D = 1 nm' }}
            ariaLabel="van der Waals interaction energy against separation"
          />
          <p className="caption">
            {geometry === 'sphere'
              ? 'Sphere–plane: W = −A₁₃₂R / 6D, so the energy falls as 1/D.'
              : 'Plane–plane: W = −A₁₃₂ / 12πD² per unit area, so the energy falls as 1/D².'}{' '}
            Negative energy means attraction, positive means repulsion.
          </p>
          <div className="stats-box">
            <h3>Clean energy link</h3>
            <p>
              Particle adhesion in electrode slurries and coatings: if A<sub>132</sub> is large and positive in the solvent,
              particles stick together (agglomerate) and coatings become uneven. Choosing a solvent whose refractive index is
              close to the particles makes A<sub>132</sub> small and keeps the slurry dispersed.
            </p>
            <p>
              Values are approximate (Lifshitz theory with a single absorption frequency, no retardation). Real
              interactions beyond about 5 nm are weaker.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
