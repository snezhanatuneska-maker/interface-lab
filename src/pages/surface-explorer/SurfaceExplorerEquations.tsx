import React from 'react';

export const SurfaceExplorerEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Core Physical Principles & Equations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">The Photoelectric Effect (XPS)</h4>
          <p>Relates incoming X-ray photon energy (<span className="italic font-serif">h&nu;</span>) to photoelectron kinetic energy (<span className="italic font-serif">E<sub>k</sub></span>) and core binding energy (<span className="italic font-serif">E<sub>b</sub></span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-base shadow-sm">
            E<sub>b</sub> = h&nu; - E<sub>k</sub> - &Phi;
          </div>
        </div>
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Information Depth (~1–10 nm)</h4>
          <p>Governed by photoelectron inelastic mean free path (<span className="italic font-serif">&lambda;</span>), restricting XPS to extreme surface layers:</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-sm shadow-sm">
            I = I<sub>0</sub> &middot; exp(-d / (&lambda; &middot; cos(&theta;)))
          </div>
        </div>
      </div>
    </div>
  );
};
