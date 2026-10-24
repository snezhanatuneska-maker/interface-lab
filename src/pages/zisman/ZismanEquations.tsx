import React from 'react';

export const ZismanEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Core Physical Principles & Equations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">The Zisman Empirical Relation</h4>
          <p>Relates cosine of contact angle (<span className="italic font-serif">cos(&theta;)</span>) linearly to liquid surface tension (<span className="italic font-serif">&gamma;<sub>lv</sub></span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-base shadow-sm">
            cos(&theta;) = 1 - b &middot; (&gamma;<sub>lv</sub> - &gamma;<sub>c</sub>)
          </div>
        </div>
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Critical Surface Tension</h4>
          <p>Defined at complete wetting (<span className="italic font-serif">&theta; = 0&deg;</span>, <span className="italic font-serif">cos(&theta;) = 1</span>), representing apparent solid surface energy:</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-sm shadow-sm">
            &gamma;<sub>c</sub> = lim<sub>&theta;&rarr;0</sub> &gamma;<sub>lv</sub>
          </div>
        </div>
      </div>
    </div>
  );
};
