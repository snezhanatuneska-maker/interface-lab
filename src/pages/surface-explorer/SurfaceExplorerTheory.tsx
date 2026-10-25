import React from 'react';

export const SurfaceExplorerTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Multimodal Surface Probing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">SEM (Topography & Morphology)</h4>
          <p>
            Uses a focused electron beam to scan surfaces, capturing secondary and backscattered electrons. Offers high lateral resolution (~1–5 nm) and wide depth of field for evaluating catalyst particle sizes.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">AFM (Nanoscale Topography)</h4>
          <p>
            Employs a sharp tip mounted on a flexible <strong className="font-semibold text-gray-900">cantilever</strong> to physically feel the surface. Provides exceptional <strong className="font-semibold text-gray-900">vertical resolution (&lt; 0.1 nm)</strong> and 3D roughness profiling.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">XPS (Chemical State & Composition)</h4>
          <p>
            Relies on the <strong className="font-semibold text-gray-900">photoelectric effect</strong> by irradiating samples with X-rays. Measures core-level binding energies with an <strong className="font-semibold text-gray-900">information depth of ~1–10 nm</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
