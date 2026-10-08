import { betLoading, langmuirTheta } from '../../lib/adsorption'

// Schematic IUPAC isotherm types, drawn as small SVG sketches (shape only, no scale).
const W = 120
const H = 84
const PAD = 8

function path(f: (x: number) => number, yMax: number, x0 = 0, x1 = 0.97): string {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const x = x0 + ((x1 - x0) * i) / 60
    const y = Math.min(f(x), yMax)
    pts.push(`${(PAD + x * (W - 2 * PAD)).toFixed(1)},${(H - PAD - (y / yMax) * (H - 2 * PAD)).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

const step = (x: number, at: number) => 1 / (1 + Math.exp(-(x - at) / 0.025))
// Type IV: BET-like film plus a capillary-condensation step; desorption steps down at lower pressure.
const typeIV = (at: number) => (x: number) => Math.min(betLoading(x, 80), 2.2) * 0.6 + 2.2 * step(x, at)

const TYPES = [
  {
    name: 'Type I',
    curves: [path((x) => langmuirTheta(x, 60), 1.15)],
    text: 'Micropores (< 2 nm): zeolites, MOFs, carbons. Pores fill early; looks like Langmuir.',
  },
  {
    name: 'Type II',
    curves: [path((x) => betLoading(x, 100), 5)],
    text: 'Non-porous solids: Pt black, carbon black. Classic BET: knee, then a steep rise.',
  },
  {
    name: 'Type III',
    curves: [path((x) => betLoading(x, 0.7), 5)],
    text: 'Weak binding (C < 2): no knee; molecules cluster.',
  },
  {
    name: 'Type IV',
    curves: [path(typeIV(0.72), 4), path(typeIV(0.55), 4, 0.4)],
    text: 'Mesopores (2–50 nm): pores fill by capillary condensation and empty later (dashed), giving a hysteresis loop.',
  },
]

export default function BeyondBet() {
  return (
    <section className="section" aria-labelledby="beyond-title">
      <h2 id="beyond-title" className="section-title">
        Isotherm types
      </h2>
      <p className="prose">
        The shape of an isotherm tells you the kind of surface. The simulation shows types I (Langmuir), II (BET,
        C &gt; 2) and III (BET, C &lt; 2).
      </p>
      <ul className="type-grid">
        {TYPES.map((t) => (
          <li key={t.name} className="card type-card">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.name} isotherm sketch`} className="type-svg">
              <path d={`M${PAD} ${PAD} V${H - PAD} H${W - PAD}`} className="type-axes" />
              {t.curves.map((d, i) => (
                <path key={i} d={d} className={i ? 'type-curve desorb' : 'type-curve'} />
              ))}
              <text x={W - PAD} y={H - 1} textAnchor="end" className="type-label">
                p/p₀
              </text>
              <text x={PAD + 3} y={PAD + 6} className="type-label">
                V
              </text>
            </svg>
            <h3>{t.name}</h3>
            <p>{t.text}</p>
          </li>
        ))}
      </ul>
      <p className="prose">
        Only types II and IV give a true BET area. For type I it is only an “apparent” area, fine for comparing.
      </p>
    </section>
  )
}
