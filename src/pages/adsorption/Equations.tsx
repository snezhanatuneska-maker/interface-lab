import type { ReactNode } from 'react'
import Tex, { Frac } from '../../components/Tex'
import type { Model } from '../../lib/adsorption'

function Term({ sym, fallback, children }: { sym: string; fallback: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt>
        <Tex tex={sym} fallback={fallback} />
      </dt>
      <dd>{children}</dd>
    </>
  )
}

const withX = (
  <Tex
    display
    tex={String.raw`\text{with}\quad x = \frac{p}{p_0}`}
    fallback={
      <>
        with <i>x</i> = <Frac n={<i>p</i>} d={<><i>p</i><sub>0</sub></>} />
      </>
    }
  />
)

const VVm = <><i>V</i>/<i>V</i><sub>m</sub></>

export default function Equations({ mode }: { mode: Model }) {
  const lang = mode === 'langmuir'
  const bet = mode === 'bet'
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations
      </h2>
      <div className="eq-grid">
        <div className={`card eq-card lang${lang ? ' current' : ''}`}>
          <div className="eq-head">
            <h3>Langmuir isotherm (monolayer)</h3>
            {lang && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex
                display
                tex={String.raw`\theta = \frac{V}{V_m} = \frac{K\,x}{1 + K\,x}`}
                fallback={
                  <>
                    <i>θ</i> = {VVm} = <Frac n={<><i>K</i>·<i>x</i></>} d={<>1 + <i>K</i>·<i>x</i></>} />
                  </>
                }
              />
              {withX}
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta`} fallback={<i>θ</i>}>
              fractional surface coverage: share of sites that are occupied (0 = empty, 1 = full monolayer)
            </Term>
            <Term sym="V" fallback={<i>V</i>}>
              amount adsorbed, usually as gas volume at STP per gram of solid, cm³(STP)/g
            </Term>
            <Term sym="V_m" fallback={<><i>V</i><sub>m</sub></>}>
              amount that forms one complete monolayer (all sites taken)
            </Term>
            <Term sym="K" fallback={<i>K</i>}>
              Langmuir constant: ratio of the adsorption and desorption rate constants. Larger K = stronger binding,
              the surface fills at lower pressure.
            </Term>
          </dl>
          <p className="note">
            Langmuir is normally written with the pressure itself, θ = K′p/(1 + K′p), with K′ in 1/Pa. Here p is
            divided by p₀ so both models share one axis: K = K′p₀. For chemisorption above the gas’s critical
            temperature there is no p₀, and only the K′p form applies.
          </p>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>one molecule per site, so only a single layer</li>
            <li>all sites identical</li>
            <li>
              no interaction between adsorbed molecules: a “distanced dance party”, everyone on their own spot,
              nobody cares who is next to them
            </li>
          </ul>
        </div>

        <div className={`card eq-card bet${bet ? ' current' : ''}`}>
          <div className="eq-head">
            <h3>BET isotherm (multilayer)</h3>
            {bet && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex
                display
                tex={String.raw`\frac{V}{V_m} = \frac{C\,x}{(1 - x)\,(1 - x + C\,x)}`}
                fallback={
                  <>
                    {VVm} = <Frac n={<><i>C</i>·<i>x</i></>} d={<>(1 − <i>x</i>)(1 − <i>x</i> + <i>C</i>·<i>x</i>)</>} />
                  </>
                }
              />
              {withX}
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <dl className="terms">
            <Term sym="V" fallback={<i>V</i>}>
              amount adsorbed at pressure p, cm³(STP)/g. Plotting the surface excess Γ (amount per area) instead of V
              gives the same curve shape.
            </Term>
            <Term sym="V_m" fallback={<><i>V</i><sub>m</sub></>}>
              monolayer capacity: amount needed to cover the surface with one layer
            </Term>
            <Term sym="V/V_m" fallback={VVm}>
              number of “layers’ worth” adsorbed (can exceed 1)
            </Term>
            <Term sym="p_0" fallback={<><i>p</i><sub>0</sub></>}>
              saturation vapour pressure of the gas at that temperature; at p = p₀ the gas condenses
            </Term>
            <Term sym="C" fallback={<i>C</i>}>
              BET constant, related to how much more strongly the first layer binds than the higher layers:{' '}
              <Tex
                tex={String.raw`C \approx \exp\!\left(\frac{E_1 - E_L}{RT}\right)`}
                fallback={
                  <>
                    <i>C</i> ≈ exp((<i>E</i>
                    <sub>1</sub> − <i>E</i>
                    <sub>L</sub>)/<i>RT</i>)
                  </>
                }
              />
              , where <Tex tex="E_1" fallback={<><i>E</i><sub>1</sub></>} /> = adsorption heat of the first layer and{' '}
              <Tex tex="E_L" fallback={<><i>E</i><sub>L</sub></>} /> = heat of liquefaction
            </Term>
          </dl>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>each layer is a Langmuir layer for the one on top of it; any number of layers</li>
            <li>first layer binds directly to the solid (energy E₁)</li>
            <li>all higher layers bind like the liquid (energy E<sub>L</sub>)</li>
            <li>no lateral interactions</li>
          </ul>
        </div>
      </div>
      <p className="callout">
        <strong>How they relate:</strong> Langmuir allows one layer and plateaus at V = V<sub>m</sub>. BET lets every
        adsorbed molecule act as a site for the next, so the curve has a knee where the first layer completes and
        then rises steeply as p → p₀, where the gas condenses.
      </p>
    </section>
  )
}
