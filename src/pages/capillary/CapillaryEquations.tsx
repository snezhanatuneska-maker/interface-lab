import React from 'react';

export const CapillaryEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="text-xl font-bold">Core Physical Principles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">Young–Laplace Equation</h4>
          <p>Defines the pressure jump across a curved liquid-gas interface inside confinements:</p>
          <div className="p-3 bg-white rounded border border-gray-100 text-center font-mono font-medium text-blue-700 text-base">
            P<sub>c</sub> = (2 · γ · cos(<span className="font-serif italic">θ</span>)) / <span className="font-serif italic">r</span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">Kelvin Equation</h4>
          <p>Governs capillary condensation, explaining vapor condensation at reduced relative pressures:</p>
          <div className="p-3 bg-white rounded border border-gray-100 text-center font-mono font-medium text-blue-700 text-xs md:text-sm">
            ln(P / P<sub>0</sub>) = (-2 · γ · V<sub>m</sub> · cos(<span className="font-serif italic">θ</span>)) / (<span className="font-serif italic">r</span> · R · T)
          </div>
        </div>
      </div>
    </div>
  );
};
