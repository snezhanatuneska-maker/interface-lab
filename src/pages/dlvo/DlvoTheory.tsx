export function DlvoTheory() {
  return (
    <section className="section" aria-labelledby="theory-title">
      <h2 id="theory-title" className="section-title">
        Energy Barriers & Particle Interactions
      </h2>
      <div className="concept-grid">
        <div>
          <h3>The Energy Barrier</h3>
          <p>
            DLVO theory combines repulsive electrostatic forces and attractive van der Waals forces. A high energy
            barrier prevents particles from falling into the deep primary minimum, keeping the colloid stable.
          </p>
        </div>
        <div>
          <h3>Primary & Secondary Minima</h3>
          <p>
            At large separations, weak attraction creates a shallow <strong>secondary minimum</strong> (reversible
            flocculation). At contact, the deep <strong>primary minimum</strong> causes irreversible particle
            aggregation.
          </p>
        </div>
        <div>
          <h3>The Schulze-Hardy Rule</h3>
          <p>
            Adding salt compresses the electrical double layer. Counter-ion valency (<em>z</em>) drastically impacts
            stability, with the Critical Coagulation Concentration scaling as CCC ∝ 1/z<sup>6</sup>.
          </p>
        </div>
      </div>
    </section>
  )
}
