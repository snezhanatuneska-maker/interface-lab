import React from 'react';

export const ZetaEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Core Physical Principles & Equations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Henry's / Smoluchowski Equation</h4>
          <p>Relates particle electrophoretic mobility (<span className="italic font-serif">u<sub>e</sub></span>) directly to zeta potential (<span className="italic font-serif">ζ</span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-base shadow-sm">
            u<sub>e</sub> = (ε · ζ) / η
          </div>
        </div>
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Electrostatic Stabilization</h4>
          <p>Particles remain stably dispersed in inks when electrostatic repulsion (high absolute <span className="italic font-serif">ζ</span>) overcomes van der Waals attraction:</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-sm shadow-sm">
            |ζ| &gt; 30 mV (Stable) | ζ ≈ 0 (Agglomeration)
          </div>
        </div>
      </div>
    </div>
  );
};
