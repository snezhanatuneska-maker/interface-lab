import React from 'react';

export const ZismanEquations: React.FC = () => {
  return (
    <section className="section" aria-labelledby="zisman-eq-title">
      <h2 id="zisman-eq-title" className="section-title">Core Physical Principles & Equations</h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>The Zisman Empirical Relation</h3>
          <p>Relates cosine of contact angle (<em>cos(&theta;)</em>) linearly to liquid surface tension (<em>&gamma;<sub>lv</sub></em>):</p>
          <div className="formula">
            <div className="formula-body formula-text">
              cos(&theta;) = 1 - b &middot; (&gamma;<sub>lv</sub> - &gamma;<sub>c</sub>)
            </div>
          </div>
        </div>
        <div className="card eq-card">
          <h3>Critical Surface Tension</h3>
          <p>Defined at complete wetting (<em>&theta; = 0&deg;</em>, <em>cos(&theta;) = 1</em>), representing apparent solid surface energy:</p>
          <div className="formula">
            <div className="formula-body formula-text">
              &gamma;<sub>c</sub> = lim<sub>&theta;&rarr;0</sub> &gamma;<sub>lv</sub>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
