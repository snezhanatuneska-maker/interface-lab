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
            repulsion (<em>V<sub>R</sub></em>) and van der Waals attraction (<em>V<sub>A</sub></em>). For two equal spheres
            of radius a at gap h, with n₀ ions of each kind per m³ and Hamaker constant A:
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`V_{total} = V_R + V_A`} />
              <Tex display tex={String.raw`V_R = \frac{64\pi a\,n_0 k T\,\Gamma^2}{\kappa^2}\,e^{-\kappa h},\quad \Gamma = \tanh\frac{ze\psi_0}{4kT},\qquad V_A = -\frac{A\,a}{12\,h}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
        </div>
        <div className="card eq-card">
          <h3>The Schulze-Hardy Rule</h3>
          <p>
            The Critical Coagulation Concentration (CCC) falls steeply with the counter-ion valency (<em>z</em>), as a
            power law. At high surface potential:
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`\mathrm{CCC} \propto \frac{1}{z^6}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <p>
            This needs tanh(zeψ₀/4kT) ≈ 1. At low surface potential the same DLVO calculation gives CCC ∝ ψ₀⁴/z², a much
            weaker valency effect. In the simulator (ψ₀ = 10–100 mV) the ratio CCC(z = 1)/CCC(z = 2) therefore runs
            from about 4 at 10 mV to about 24 at 100 mV; the full 64× is only approached at ψ₀ of 300 mV and more.
          </p>
        </div>
      </div>
    </section>
  )
}
