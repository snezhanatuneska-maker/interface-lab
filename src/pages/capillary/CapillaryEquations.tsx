import React from 'react';
import { Tex } from '../../components/Tex';

export const CapillaryEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="text-xl font-bold">Core Physical Principles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">Young–Laplace Equation</h4>
          <p>Defines the pressure jump across a curved liquid-gas interface inside confinements:</p>
          <div className="p-2 bg-white rounded border border-gray-100 text-center font-mono">
            <Tex math="P_c = \frac{2\gamma \cos\theta}{r}" />
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-900">Kelvin Equation</h4>
          <p>Governs capillary condensation, explaining vapor condensation at reduced relative pressures:</p>
          <div className="p-2 bg-white rounded border border-gray-100 text-center font-mono">
            <Tex math="\ln\left(\frac{P}{P_0}\right) = -\frac{2\gamma V_m \cos\theta}{r R T}" />
          </div>
        </div>
      </div>
    </div>
  );
};
