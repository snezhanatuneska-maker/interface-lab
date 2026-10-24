import type { ReactNode } from 'react'
import Tex from '../../components/Tex'

function Term({ sym, children }: { sym: string; children: ReactNode }) {
  return (
    <>
      <dt>
        <Tex tex={sym} />
      </dt>
      <dd>{children}</dd>
    </>
  )
}

function Formula({ tex, n }: { tex: string; n: number }) {
  return (
    <div className="formula">
      <div className="formula-body eq-math">
        <Tex display tex={tex} />
      </div>
      <span className="formula-number">({n})</span>
    </div>
  )
}

export default function Equations() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations
      </h2>
      <div className="card eq-card">
        <div className="eq-head">
          <h3>Crystal growth rate</h3>
        </div>
        <Formula n={1} tex={String.raw`G = \frac{dx}{dt} = 2v`} />
        <Formula n={2} tex={String.raw`A = \beta x^2, \qquad V = \alpha x^3`} />
        <p className="note">Sphere of diameter x: β = π, α = π/6.</p>
        <Formula n={3} tex={String.raw`R = \frac{3\alpha}{\beta}\,\rho_c\,G`} />
        <Formula
          n={4}
          tex={String.raw`\begin{aligned} G &= \frac{\beta}{3\alpha}\,\frac{Sh\,D_{AB}\,M}{\rho_c\,x} \\ &\quad \times a^*\,(S - 1) \end{aligned}`}
        />
        <dl className="terms">
          <Term sym="x">characteristic crystal size (m)</Term>
          <Term sym="G">linear growth rate of the size, m/s</Term>
          <Term sym="v">displacement velocity of a face; it moves on both sides, so G = 2v</Term>
          <Term sym={String.raw`A,\ V`}>crystal surface area and volume</Term>
          <Term sym={String.raw`\beta,\ \alpha`}>area and volume shape factors</Term>
          <Term sym="R">mass growth rate per unit crystal surface, kg/(m²·s)</Term>
          <Term sym={String.raw`\rho_c`}>crystal density, kg/m³</Term>
          <Term sym="Sh">Sherwood number, k·x/D<sub>AB</sub> (k = mass-transfer coefficient); stirring raises it</Term>
          <Term sym={String.raw`D_{AB}`}>diffusion coefficient of solute A in solvent B, m²/s</Term>
          <Term sym="M">molar mass of the solute, kg/mol</Term>
          <Term sym={String.raw`a^*`}>equilibrium (saturation) activity of the solute, mol/m³</Term>
          <Term sym={String.raw`S = a/a^*`}>supersaturation; growth needs S &gt; 1</Term>
        </dl>
        <p className="note">
          (4) is the diffusion-controlled case: G grows linearly with (S − 1) and with Sh, so stirring speeds it up.
          Surface-reaction control does not depend on Sh.
        </p>
      </div>
    </section>
  )
}
