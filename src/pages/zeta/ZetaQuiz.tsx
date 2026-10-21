import React, { useState } from 'react';

export const ZetaQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Isoelectric Point & Charge",
      description: "Observe particle behavior when shifting pH values.",
      prompt: "What happens to a metal oxide particle's zeta potential when the solution pH equals its Isoelectric Point (IEP)?",
      options: [
        "A. Zeta potential reaches its maximum positive value (+50 mV)",
        "B. Zeta potential drops to exactly zero (ζ = 0)",
        "C. Zeta potential becomes heavily negative (-50 mV)",
        "D. Zeta potential fluctuates unpredictably"
      ],
      correct: 1,
      explanation: "Correct! At the Isoelectric Point, surface charges neutralize, resulting in a zeta potential of zero."
    },
    {
      id: 2,
      title: "Catalyst Ink Stability",
      description: "Evaluate the role of surface charge in preventing particle settling.",
      prompt: "Why is maintaining a high absolute zeta potential (|ζ| > 30 mV) crucial when preparing fuel cell catalyst inks?",
      options: [
        "A. It creates strong electrostatic repulsion to prevent catalyst nanoparticles from agglomerating",
        "B. It increases the electrical conductivity of the carbon support",
        "C. It speeds up water evaporation during drying",
        "D. It prevents the solvent from freezing"
      ],
      correct: 0,
      explanation: "Correct! High electrostatic repulsion prevents nanoparticles from clumping together, ensuring uniform active surface area."
    },
    {
      id: 3,
      title: "Potential-Determining Ions",
      description: "Analyze how pH titration alters surface chemistry.",
      prompt: "Which ions act as the primary potential-determining ions for metal oxide surfaces in aqueous suspensions?",
      options: [
        "A. Na⁺ and Cl⁻",
        "B. H⁺ and OH⁻",
        "C. SO₄²⁻ and Ca²⁺",
        "D. Pt²⁺ and C⁺"
      ],
      correct: 1,
      explanation: "Correct! Adsorption and desorption of hydrogen and hydroxide ions directly determine the surface charge on oxides."
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Interactive Exercises & Knowledge Check</h3>
      
      {questions.map((q) => {
        const selected = answers[q.id];
        const revealed = showResults[q.id];

        return (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {q.id}. {q.title}
                </h4>
                <p className="text-sm text-gray-600">{q.description}</p>
              </div>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-lg border border-gray-300 transition-colors shrink-0"
              >
                Set it up
              </button>
            </div>

            <p className="font-medium text-sm text-gray-900 pt-1">{q.prompt}</p>

            <div className="flex flex-col space-y-2">
              {q.options.map((opt, optIdx) => {
                let style = "w-full text-left p-3 rounded-lg border text-sm transition-all block ";
                if (revealed) {
                  if (optIdx === q.correct) {
                    style += "bg-emerald-50 border-emerald-400 text-emerald-900 font-medium";
                  } else if (optIdx === selected) {
                    style += "bg-rose-50 border-rose-300 text-rose-900";
                  } else {
                    style += "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
                  }
                } else {
                  style += "bg-white hover:bg-gray-50 border-gray-200 text-gray-800";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    className={style}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className={`p-3 rounded-lg text-sm font-medium ${selected === q.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {selected === q.correct ? `✓ ${q.explanation}` : `✕ Not quite right. ${q.explanation}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
