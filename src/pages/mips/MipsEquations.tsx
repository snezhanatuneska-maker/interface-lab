import React from 'react';

export const MipsEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Core Physical Principles & Equations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">The Washburn Equation</h4>
          <p>Relates applied hydraulic pressure (<span className="italic font-serif">P</span>) directly to pore radius (<span className="italic font-serif">r</span>) and mercury surface tension (<span className="italic font-serif">&gamma;</span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-base shadow-sm">
            P = (-2 &middot; &gamma; &middot; cos(&theta;)) / r
          </div>
        </div>
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Work of Intrusion</h4>
          <p>The mechanical work required to force non-wetting mercury into pore volumes (<span className="italic font-serif">V</span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-sm shadow-sm">
            W = &int; P dV
          </div>
        </div>
      </div>
    </div>
  );
};
