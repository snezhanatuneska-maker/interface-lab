import Tex from '../../components/Tex'

export function MipsEquations() {
  return (
    <section className="section" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Core Physical Principles & Equations
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>The Washburn Equation</h3>
          <p>
            Relates applied hydraulic pressure (<em>P</em>) directly to pore radius (<em>r</em>) and mercury surface
            tension (<em>γ</em>):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`P = \frac{-2\,\gamma\cos\theta}{r}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
        </div>
        <div className="card eq-card">
          <h3>Work of Intrusion</h3>
          <p>
            The mechanical work required to force non-wetting mercury into pore volumes (<em>V</em>):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`W = \int P\,dV`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
