import type { ReactNode } from 'react'
import Tex from '../../components/Tex'
import { EPS_STERN, type Model } from '../../lib/edl'

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

export default function Equations({ model }: { model: Model }) {
  const gc = model === 'gc'
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations
      </h2>
      <div className="eq-grid">
        <div className={`card eq-card gc${gc ? ' current' : ''}`}>
          <div className="eq-head">
            <h3>Gouy–Chapman (diffuse layer)</h3>
            {gc && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\kappa^{-1} = \sqrt{\frac{\varepsilon_0\varepsilon_r k_B T}{2 N_A e^2 I}},\quad I = \tfrac12\sum c_i z_i^2`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\tanh\frac{ze\psi(x)}{4k_BT} = \tanh\frac{ze\psi_d}{4k_BT}\,e^{-\kappa x}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`c_\pm(x) = c_0\,e^{\mp ze\psi(x)/k_BT}`} />
            </div>
            <span className="formula-number">(3)</span>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\kappa^{-1}`}>Debye length: 0.304/√I nm for I in mol/L at 25 °C</Term>
            <Term sym="I">ionic strength; I = c₀z² for a z:z salt</Term>
            <Term sym={String.raw`\psi_d`}>potential where the diffuse layer starts (ψ₀ in pure GC)</Term>
            <Term sym={String.raw`\varepsilon_r`}>78.5 (water, 298 K)</Term>
          </dl>
          <p className="note">At low potential (2) becomes ψ = ψd e^(−κx).</p>
        </div>

        <div className={`card eq-card gcs${gc ? '' : ' current'}`}>
          <div className="eq-head">
            <h3>Stern layer + capacitance</h3>
            {!gc && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\begin{aligned} \sigma &= \frac{\varepsilon_0\varepsilon_S(\psi_0-\psi_d)}{\delta} \\ &= \sqrt{8c_0N_A\varepsilon_0\varepsilon_r k_BT}\,\sinh\frac{ze\psi_d}{2k_BT} \end{aligned}`} />
            </div>
            <span className="formula-number">(4)</span>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\begin{aligned} C_S &= \frac{\varepsilon_0\varepsilon_S}{\delta} \\ C_d &= \varepsilon_0\varepsilon_r\kappa\cosh\frac{ze\psi_d}{2k_BT} \end{aligned}`} />
              <Tex display tex={String.raw`\frac{1}{C_\text{tot}} = \frac{1}{C_S} + \frac{1}{C_d}`} />
            </div>
            <span className="formula-number">(5)</span>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\delta`}>Stern thickness: surface to OHP</Term>
            <Term sym={String.raw`\varepsilon_S`}>{EPS_STERN}: water in the Stern layer is ordered by the field</Term>
            <Term sym={String.raw`\sigma`}>surface charge; (4) is solved for ψd</Term>
          </dl>
          <p className="note">In pure GC, C_tot = C_d, which grows as cosh and has no upper limit.</p>
        </div>
      </div>
    </section>
  )
}
