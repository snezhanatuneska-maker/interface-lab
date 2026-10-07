import Tex from '../../components/Tex'
import { betLoading, kelvinRadius, langmuirTheta } from '../../lib/adsorption'

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
    text: 'Micropores (< 2 nm): zeolites, MOFs, activated carbons. Pores fill at low p/p₀; the plateau looks like Langmuir but is pore filling. Typical of H₂ and CO₂ sorbents.',
  },
  {
    name: 'Type II',
    curves: [path((x) => betLoading(x, 100), 5)],
    text: 'Non-porous or macroporous solids: Pt black, carbon blacks. The classic BET case: knee at B, steep rise near p₀.',
  },
  {
    name: 'Type III',
    curves: [path((x) => betLoading(x, 0.7), 5)],
    text: 'Weak gas–solid attraction (C < 2): no knee, molecules cluster instead of forming a monolayer first.',
  },
  {
    name: 'Type IV',
    curves: [path(typeIV(0.72), 4), path(typeIV(0.55), 4, 0.4)],
    text: 'Mesopores (2–50 nm): catalyst layers, mesoporous carbons and oxides. Capillary condensation adds a step, and desorption (dashed) runs below adsorption: a hysteresis loop.',
  },
]

export default function BeyondBet({ x }: { x: number }) {
  const rK = x > 0 ? kelvinRadius(x) : 0
  return (
    <section className="section" aria-labelledby="beyond-title">
      <h2 id="beyond-title" className="section-title">
        Beyond BET: pores, capillary condensation and hysteresis
      </h2>
      <p className="prose">
        Real catalyst powders and electrodes are porous, and pores change the isotherm. IUPAC sorts the shapes into
        types; the BET simulation above shows types II and III.
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

      <h3>Capillary condensation: smallest pores fill first</h3>
      <div className="prose">
        <p>
          Inside a narrow pore the liquid surface is curved, and a curved (concave) meniscus is stable below the
          normal saturation pressure. The Kelvin equation gives the meniscus radius r<sub>K</sub> at which N₂
          condenses:
        </p>
      </div>
      <div className="formula">
        <div className="formula-body">
          <Tex
            display
            tex={String.raw`\ln\frac{p}{p_0} = -\frac{2\,\gamma\,V_L}{r_K\,R\,T}`}
            fallback={<>ln(p/p₀) = −2γV<sub>L</sub> / (r<sub>K</sub>RT)</>}
          />
        </div>
        <span className="formula-number">(5)</span>
      </div>
      <p className="callout live-note" aria-live="polite">
        {x <= 0 ? (
          <>Raise p/p₀ in the simulation above to see which pores are filled.</>
        ) : rK < 1 ? (
          <>
            At the current p/p₀ = {x.toFixed(2)}, r<sub>K</sub> ≈ {rK.toFixed(2)} nm, about the size of a few
            molecules. Here the Kelvin equation no longer applies: micropores fill by enhanced adsorption, not by a
            meniscus.
          </>
        ) : (
          <>
            At the current p/p₀ = {x.toFixed(2)}, N₂ has condensed in every pore with r<sub>K</sub> below about{' '}
            <strong>{rK.toFixed(1)} nm</strong> (the pore radius is this plus the adsorbed film on the wall). Raise
            the pressure and wider pores fill.
          </>
        )}
      </p>
      <p className="prose">
        <strong>Hysteresis.</strong> On the way up, a pore fills only once the film on its walls is thick enough to
        bridge it. On the way down it empties from a meniscus already in place, at a lower pressure; narrow-necked
        “ink-bottle” pores stay full until the neck empties. So the desorption branch lies below the adsorption
        branch, and the shape of the loop tells you about the pore network.
      </p>
      <p className="prose">
        <strong>Mercury intrusion porosimetry.</strong> Mercury does not wet most solids (contact angle ≈ 140°), so
        it must be pushed into pores. The Washburn equation, p = −2γ cos θ / r, gives the smallest pore entered at
        each pressure: r ≈ 0.74 µm / p[MPa], so ~400 MPa reaches pores about 2 nm in radius. It covers the larger pores
        that N₂ cannot. For fuel-cell catalyst layers it resolves the primary pores inside carbon agglomerates
        (below ~20 nm) and the secondary pores between them (~20–200 nm), which carry the gas in and the water out.
      </p>
    </section>
  )
}
