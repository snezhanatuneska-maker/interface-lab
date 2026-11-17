import Tex from '../../components/Tex'

// The course equations used on this page (compendium notation).

const EQUATIONS = [
  {
    title: 'Surface tension (thermodynamic)',
    tex: String.raw`\gamma = \left(\frac{\partial F}{\partial A}\right)_{T,V,N}`,
    note: 'F: Helmholtz free energy, A: interfacial area. Units J/m² = N/m.',
  },
  {
    title: 'Wilhelmy plate',
    tex: String.raw`F = \gamma P\cos\delta`,
    note: 'P = 2(width + thickness): wetted perimeter; δ = 0 for a clean plate.',
  },
  {
    title: 'Du Noüy ring',
    tex: String.raw`F = \gamma\cdot\pi(d_\text{outer} + d_\text{inner})`,
    note: 'Two contact lines, outside and inside the wire.',
  },
]

export default function Equations() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Equations on this page
      </h2>
      <div className="eq-grid">
        {EQUATIONS.map((e, i) => (
          <div key={e.title} className="card eq-card">
            <h3>{e.title}</h3>
            <div className="formula">
              <div className="formula-body eq-math">
                <Tex display tex={e.tex} />
              </div>
              <span className="formula-number">({i + 1})</span>
            </div>
            <p className="note">{e.note}</p>
          </div>
        ))}
      </div>
      <p className="note prose">
        The CMC simulation is qualitative: it shows the trends from the lecture (plateau of γ above the CMC, longer
        tail → lower CMC, non-ionic below ionic) and the shape of the property changes at the CMC, not a theory of the
        CMC.
      </p>
    </section>
  )
}
