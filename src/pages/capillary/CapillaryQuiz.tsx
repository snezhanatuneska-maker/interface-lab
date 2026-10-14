import React, { useState } from 'react';

export const CapillaryQuiz: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const correctIndex = 0; // "It increases capillary pressure..."

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-emerald-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">🧠 Knowledge Check: Pore Confinement</h3>
      <p className="text-sm text-gray-700">
        How does decreasing the pore radius (<span className="italic font-serif">r</span>) affect capillary pressure according to the Young–Laplace equation?
      </p>

      <div className="space-y-2">
        {[
          'It increases capillary pressure inversely (P_c ∝ 1/r)',
          'It decreases capillary pressure to zero',
          'It has no effect on capillary pressure'
        ].map((option, index) => {
          let btnStyle = 'w-full text-left p-3 rounded-lg border text-sm transition-all ';
          if (showResult) {
            if (index === correctIndex) {
              btnStyle += 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
            } else if (index === selectedOption) {
              btnStyle += 'bg-rose-50 border-rose-300 text-rose-900';
            } else {
              btnStyle += 'bg-gray-50 border-gray-200 text-gray-500';
            }
          } else {
            btnStyle += 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800';
          }

          return (
            <button 
              key={index} 
              onClick={() => handleSelect(index)} 
              className={btnStyle}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`p-3 rounded-lg text-sm ${selectedOption === correctIndex ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {selectedOption === correctIndex 
            ? '✓ Correct! Because radius is in the denominator, smaller nanopores generate immense capillary pressures.' 
            : '✕ Incorrect. Remember that P_c = 2γ cos(θ) / r, meaning radius is inversely proportional.'}
        </div>
      )}
    </div>
  );
};
