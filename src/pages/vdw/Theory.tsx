import type { ReactNode } from 'react'
import Tex from '../../components/Tex'

// Small sketches: two molecules side by side. Arrows are dipoles (δ− → δ+ drawn as a charged ellipse).
const W = 160
const H = 70

function Dipole({ x, angle = 0, induced = false }: { x: number; angle?: number; induced?: boolean }) {
  return (
    <g transform={`translate(${x} ${H / 2}) rotate(${angle})`}>
      <ellipse rx="26" ry="16" className={induced ? 'vdw-mol induced' : 'vdw-mol'} />
      <text x="-14" y="5" className="vdw-sign">
        δ−
      </text>
      <text x="14" y="5" className="vdw-sign">
        δ+
      </text>
    </g>
  )
}

const KEESOM = (
  <>
    <Dipole x={42} angle={-15} />
    <Dipole x={118} angle={20} />
    <path d="M14 14 a10 10 0 0 1 14 -6" className="vdw-rot" />
    <path d="M146 14 a10 10 0 0 0 -14 -6" className="vdw-rot" />
  </>
)

const DEBYE = (
  <>
    <Dipole x={42} />
    <Dipole x={118} induced />
  </>
)

const LONDON = (
  <>
    <circle cx="42" cy={H / 2} r="17" className="vdw-cloud" />
    <circle cx="36" cy={H / 2} r="4" className="vdw-nucleus" />
    <circle cx="118" cy={H / 2} r="17" className="vdw-cloud" />
    <circle cx="112" cy={H / 2} r="4" className="vdw-nucleus" />
    <circle cx="48" cy={H / 2} r="22" className="vdw-flicker" />
    <circle cx="124" cy={H / 2} r="22" className="vdw-flicker" />
  </>
)

interface Card {
  cls: string
  title: string
  kind: string
  sketch: ReactNode
  tex: string
  meaning: ReactNode
}

const CARDS: Card[] = [
  {
    cls: 'keesom',
    title: 'Keesom',
    kind: 'permanent dipole – permanent dipole',
    sketch: KEESOM,
    tex: String.raw`\varphi = -\frac{\mu_1^2\,\mu_2^2}{3\,(4\pi\varepsilon_0)^2\,kT\,r^6}`,
    meaning: (
      <>
        Freely rotating dipoles, angle-averaged. Falls as <strong>1/T</strong>: thermal motion spoils the alignment.
        Valid only while the dipole–dipole energy μ₁μ₂/(4πε₀r³) is below kT; closer in (e.g. water at 0.4 nm) the
        dipoles lock together and the formula overestimates.
      </>
    ),
  },
  {
    cls: 'debye',
    title: 'Debye',
    kind: 'permanent dipole – induced dipole',
    sketch: DEBYE,
    tex: String.raw`\varphi = -\frac{2\,\mu^2\,\alpha_0}{(4\pi\varepsilon_0)^2\,r^6}`,
    meaning: (
      <>
        A dipole polarizes its neighbour. The induced dipole follows it, so it is <strong>temperature-independent</strong>.
        For two identical molecules each polarizes the other, hence the 2 (in general μ₁²α₀₂ + μ₂²α₀₁).
      </>
    ),
  },
  {
    cls: 'london',
    title: 'London (dispersion)',
    kind: 'induced dipole – induced dipole',
    sketch: LONDON,
    tex: String.raw`\varphi = -\frac{3\,\alpha_0^2\,h\nu}{4\,(4\pi\varepsilon_0)^2\,r^6}`,
    meaning: (
      <>
        Fluctuating electron clouds (hν ≈ ionisation energy I). Acts between <strong>all</strong> molecules, nonpolar
        ones too.
      </>
    ),
  },
]

export default function Theory() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Three contributions
      </h2>
      <div className="wet-eq-grid">
        {CARDS.map((c) => (
          <div key={c.cls} className={`card eq-card vdw-${c.cls}`}>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${c.title}: ${c.kind}`} className="vdw-svg">
              {c.sketch}
            </svg>
            <h3>{c.title}</h3>
            <p className="note vdw-kind">{c.kind}</p>
            <div className="formula">
              <div className="formula-body eq-math">
                <Tex display tex={c.tex} />
              </div>
            </div>
            <p className="note">{c.meaning}</p>
          </div>
        ))}
      </div>
      <p className="note">
        Dipole moment μ in debye: 1 D = 3.336 × 10⁻³⁰ C·m. Polarizability given as α₀/(4πε₀), in Å³.
      </p>
    </section>
  )
}
