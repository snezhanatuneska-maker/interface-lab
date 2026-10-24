import Tex from '../../components/Tex'

export function DlvoEquations() {
  return (
    <section className="section" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Core Physical Principles & Equations
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Total DLVO Interaction Energy</h3>
          <p>
            The net interaction potential (<em>V<sub>total</sub></em>) is the sum of double-layer
            repulsion (<em>V<sub>R</sub></em>) and van der Waals attraction (<em>V<sub>A</sub></em>):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`V_{total} = V_R + V_A`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
        </div>
        <div className="card eq-card">
          <h3>The Schulze-Hardy Rule</h3>
          <p>
            The Critical Coagulation Concentration (CCC) decreases exponentially with the valency (<em>z</em>) of
            counter-ions:
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`\mathrm{CCC} \propto \frac{1}{z^6}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
