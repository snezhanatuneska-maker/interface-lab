import React from 'react';

export const SurfaceExplorerTheory: React.FC = () => {
  return (
    <section className="section" aria-labelledby="surface-theory-title">
      <h2 id="surface-theory-title" className="section-title">Multimodal Surface Probing</h2>

      <div className="concept-grid">
        <div>
          <h3>SEM (Topography & Morphology)</h3>
          <p>
            Uses a focused electron beam to scan surfaces, capturing secondary and backscattered electrons. Offers high lateral resolution (~1–5 nm) and wide depth of field for evaluating catalyst particle sizes.
          </p>
        </div>

        <div>
          <h3>AFM (Nanoscale Topography)</h3>
          <p>
            Employs a sharp tip mounted on a flexible <strong>cantilever</strong> to physically feel the surface. Provides exceptional <strong>vertical resolution (&lt; 0.1 nm)</strong> and 3D roughness profiling.
          </p>
        </div>

        <div>
          <h3>XPS (Chemical State & Composition)</h3>
          <p>
            Relies on the <strong>photoelectric effect</strong> by irradiating samples with X-rays. Measures core-level binding energies with an <strong>information depth of ~1–10 nm</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};
