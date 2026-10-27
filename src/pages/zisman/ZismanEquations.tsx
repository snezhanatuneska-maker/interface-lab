import React from 'react';
import Tex from '../../components/Tex';

export const ZismanEquations: React.FC = () => {
  return (
    <section className="section" aria-labelledby="zisman-eq-title">
      <h2 id="zisman-eq-title" className="section-title">Core Physical Principles & Equations</h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>The Zisman Empirical Relation</h3>
          <p>Relates cosine of contact angle (<em>cos(&theta;)</em>) linearly to liquid surface tension (<em>&gamma;<sub>LV</sub></em>); b is the empirical slope, typically about 0.03 m/mN:</p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\cos\theta = 1 - b\,(\gamma_{LV} - \gamma_c)`} />
            </div>
          </div>
        </div>
        <div className="card eq-card">
          <h3>Critical Surface Tension</h3>
          <p>Defined at complete wetting (<em>&theta; = 0&deg;</em>, <em>cos(&theta;) = 1</em>), representing apparent solid surface energy:</p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\gamma_c = \lim_{\theta \to 0} \gamma_{LV}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
