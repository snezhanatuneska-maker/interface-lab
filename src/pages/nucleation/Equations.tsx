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
      <div className="eq-grid">
        <div className="card eq-card hom">
          <div className="eq-head">
            <h3>Homogeneous (in the bulk)</h3>
          </div>
          <Formula n={1} tex={String.raw`S = \frac{p}{p_\text{sat}} \;\;\text{or}\;\; \frac{c}{c_\text{sat}}`} />
          <Formula
            n={2}
            tex={String.raw`\Delta G(d) = -\frac{\pi d^3}{6\,v_m}\,kT\ln S \;+\; \pi d^2\,\gamma`}
          />
          <Formula n={3} tex={String.raw`d^* = \frac{4\,\gamma\,v_m}{kT\ln S}`} />
          <Formula n={4} tex={String.raw`\Delta G^*_\text{hom} = \frac{16\pi\,\gamma^3\,v_m^2}{3\,(kT\ln S)^2}`} />
          <dl className="terms">
            <Term sym="S">supersaturation. S &gt; 1 drives nucleation; for S ≤ 1, ln S ≤ 0 and no nucleus is stable</Term>
            <Term sym="d">diameter of the cluster</Term>
            <Term sym="v_m">volume of one molecule in the new phase (lower-case v: not a molar volume)</Term>
            <Term sym="\gamma">interfacial tension between the nucleus and its surroundings, J/m²</Term>
            <Term sym="kT">thermal energy (k = Boltzmann constant)</Term>
          </dl>
          <p className="note">
            First term: the new phase is more stable, so volume lowers G (favours). Second term: new interface costs
            energy (resists). Below d* the surface term wins and the cluster dissolves; above d* it grows.
          </p>
          <p className="note">
            <strong>Capillary approximation.</strong> CNT treats even a tiny cluster as a piece of bulk phase with a
            sharp interface and the flat-surface γ. That is questionable for a nucleus of a few tens of molecules and
            meaningless below about ten, so the numbers are qualitative there (the default nucleus holds about 100).
          </p>
        </div>

        <div className="card eq-card het">
          <div className="eq-head">
            <h3>Heterogeneous (on a surface)</h3>
          </div>
          <Formula
            n={5}
            tex={String.raw`\begin{aligned} f(\theta) &= \frac{(2+\cos\theta)(1-\cos\theta)^2}{4} \\ &= \frac{V_\text{cap}}{V_\text{sphere}} \end{aligned}`}
          />
          <Formula n={6} tex={String.raw`\begin{aligned} \Delta G^*_\text{het} &= f(\theta)\,\Delta G^*_\text{hom} \\ 0 &\le f \le 1 \end{aligned}`} />
          <dl className="terms">
            <Term sym="\theta">
              contact angle of the nucleus on the substrate, measured <strong>through the nucleus</strong>
            </Term>
            <Term sym="f(\theta)">share of a full sphere that the cap holds</Term>
          </dl>
          <p className="note">
            The nucleus is a spherical cap on a flat surface. Its radius of curvature at the top of the barrier is the
            same d*/2 as in the bulk; the cap just needs fewer molecules, because the substrate replaces part of its
            costly interface.
          </p>
          <h4>Limits</h4>
          <ul className="assumptions">
            <li>θ = 180°: f = 1. The nucleus does not wet the surface, so the surface does not help.</li>
            <li>θ = 90°: f = ½. A hemisphere, half the barrier.</li>
            <li>θ → 0°: f → 0. Complete wetting, no barrier.</li>
          </ul>
        </div>
      </div>

      <div className="card eq-card rate-card">
        <div className="eq-head">
          <h3>Nucleation rate</h3>
        </div>
        <Formula n={7} tex={String.raw`J = \beta^*\,Z\,n\,\exp\!\left(-\frac{\Delta G^*}{kT}\right) \;\approx\; J_0\,\exp\!\left(-\frac{\Delta G^*}{kT}\right)`} />
        <dl className="terms">
          <Term sym="\beta^*">rate at which molecules attach to the critical nucleus</Term>
          <Term sym="Z">Zeldovich factor (chance a critical nucleus goes on to grow)</Term>
          <Term sym="n">number of sites where a nucleus can form (per volume, or per area on a surface)</Term>
        </dl>
        <p className="note">
          The full form (left) is for homogeneous nucleation. The plot uses one constant prefactor J₀ = 10³⁰ for both cases (in
          m⁻³ s⁻¹ for the bulk; a heterogeneous rate is really per area of substrate, m⁻² s⁻¹): a simplification that
          compares only the exponential term, which is what changes by many orders of magnitude.
        </p>
      </div>
      <p className="callout">
        <strong>In short:</strong> the barrier scales as γ³/(ln S)². A surface multiplies it by f(θ) ≤ 1, and because
        the rate depends on it exponentially, even a modest f makes nucleation on the surface vastly faster.
      </p>
    </section>
  )
}
