import { Fragment, type ReactNode } from 'react'
import Tex from '../../components/Tex'

interface Eq {
  title: string
  note: ReactNode
  tex: string
  terms?: [string, ReactNode][]
}

const EQUATIONS: Eq[] = [
  {
    title: 'Klevens: tail length',
    note: 'The CMC falls by a constant factor for each CH₂ in the tail.',
    tex: String.raw`\log_{10}\mathrm{CMC} = A - B\,n`,
    terms: [
      ['n', 'carbons in the tail'],
      ['B', '≈ 0.3 for ionic, ≈ 0.5 for non-ionic surfactants'],
      ['A', 'depends on the head group and temperature'],
    ],
  },
  {
    title: 'Corrin–Harkins: added salt',
    note: 'For ionic surfactants (log = log₁₀). The counterions from the surfactant itself (≈ CMC) add to the salt.',
    tex: String.raw`\log\mathrm{CMC} = a - b\,\log(\mathrm{CMC} + c_\text{salt})`,
    terms: [
      ['b', 'close to the degree of counterion binding (≈ 0.6–0.7 for SDS)'],
      ['c_salt', 'added NaCl, mol/L'],
    ],
  },
  {
    title: 'Szyszkowski: surface tension',
    note: 'Below the CMC (c = free monomer); above it γ stays at its CMC value.',
    tex: String.raw`\gamma = \gamma_0 - n\,R\,T\,\Gamma_\text{max}\,\ln(1 + K c)`,
    terms: [
      ['γ₀', 'pure water, 72.0 mN/m at 25 °C'],
      ['n', '2 for an ionic surfactant without salt, 1 otherwise'],
      ['K', 'adsorption constant (how strongly molecules prefer the surface)'],
    ],
  },
  {
    title: 'Gibbs: surface excess',
    note: 'Read Γ from the slope of γ against ln c. With Szyszkowski it gives Langmuir adsorption.',
    tex: String.raw`\Gamma = -\frac{1}{n R T}\frac{\mathrm{d}\gamma}{\mathrm{d}\ln c} = \Gamma_\text{max}\frac{K c}{1 + K c}`,
  },
  {
    title: 'Area per molecule',
    note: 'How much interface each molecule occupies when the surface is full.',
    tex: String.raw`A = \frac{1}{\Gamma_\text{max}\,N_A}`,
    terms: [['N_A', 'Avogadro constant, 6.022 × 10²³ mol⁻¹']],
  },
  {
    title: 'Counterion binding',
    note: 'From the two slopes of the conductivity plot (ionic surfactants).',
    tex: String.raw`\beta = 1 - \frac{S_\text{above}}{S_\text{below}}`,
    terms: [['β', 'fraction of counterions bound to the micelle']],
  },
]

export default function Equations() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations behind the simulation
      </h2>
      <div className="eq-grid">
        {EQUATIONS.map((e, i) => (
          <div key={e.title} className="card eq-card">
            <div className="eq-head">
              <h3>{e.title}</h3>
            </div>
            <p className="note">{e.note}</p>
            <div className="formula">
              <div className="formula-body eq-math">
                <Tex display tex={e.tex} />
              </div>
              <span className="formula-number">({i + 1})</span>
            </div>
            {e.terms && (
              <dl className="terms">
                {e.terms.map(([t, d]) => (
                  <Fragment key={t}>
                    <dt>{t}</dt>
                    <dd>{d}</dd>
                  </Fragment>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>
      <p className="note prose">
        Osmotic pressure, turbidity and self-diffusion are drawn as qualitative shapes; the simulation does not
        compute them in physical units.
      </p>
    </section>
  )
}
