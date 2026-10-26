import React from 'react';

export const ZismanTheory: React.FC = () => {
  return (
    <section className="section" aria-labelledby="zisman-theory-title">
      <h2 id="zisman-theory-title" className="section-title">Wettability & Critical Surface Tension</h2>

      <div className="concept-grid">
        <div>
          <h3>The Zisman Plot</h3>
          <p>
            By measuring contact angles (<em>&theta;</em>) of a homologous series of non-polar liquids (e.g. n-alkanes), plotting <span>cos(&theta;)</span> against liquid surface tension (<em>&gamma;<sub>lv</sub></em>) yields a straight line.
          </p>
        </div>

        <div>
          <h3>Complete Wetting</h3>
          <p>
            Where the linear fit reaches <span>cos(&theta;) = 1</span> (i.e., <em>&theta; = 0&deg;</em>), the corresponding surface tension is defined as the <strong>critical surface tension (<em>&gamma;<sub>c</sub></em>)</strong>.
          </p>
        </div>

        <div>
          <h3>Teflon & Low Energy Surfaces</h3>
          <p>
            Fluoropolymers like PTFE (Teflon) feature dense <span>-CF<sub>2</sub>-</span> groups with weak dispersion forces, creating a very low surface energy (<em>&gamma;<sub>c</sub></em> &approx; 18 mN/m). Water beads up at about 110°; surfaces of packed <span>-CF<sub>3</sub></span> groups go lower still (&gamma;<sub>c</sub> &approx; 6 mN/m).
          </p>
        </div>
      </div>
    </section>
  );
};
