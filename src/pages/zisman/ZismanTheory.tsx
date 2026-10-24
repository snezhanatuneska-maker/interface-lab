import React from 'react';

export const ZismanTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Wettability & Critical Surface Tension</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">The Zisman Plot</h4>
          <p>
            By measuring contact angles (<span className="font-serif italic">&theta;</span>) of homologous series of liquids, plotting <span className="font-mono">cos(&theta;)</span> against liquid surface tension (<span className="font-serif italic">&gamma;<sub>lv</sub></span>) yields a straight line.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Complete Wetting</h4>
          <p>
            Where the linear fit reaches <span className="font-mono">cos(&theta;) = 1</span> (i.e., <span className="font-serif italic">&theta; = 0&deg;</span>), the corresponding surface tension is defined as the <strong className="font-semibold text-gray-900">critical surface tension (<span className="font-serif italic">&gamma;<sub>c</sub></span>)</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Teflon & Low Energy Surfaces</h4>
          <p>
            Fluoropolymers like PTFE (Teflon) feature dense <span className="font-mono">-CF<sub>2</sub>-</span> groups, creating exceptionally low surface energy (<span className="font-serif italic">&gamma;<sub>c</sub></span> &approx; 18 mN/m) that repels water completely.
          </p>
        </div>
      </div>
    </div>
  );
};
