import React, { useState } from 'react';

export const DlvoQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Salt Concentration & Energy Barrier",
      description: "Observe how increasing electrolyte concentration alters double-layer repulsion.",
      prompt: "What happens to the DLVO energy barrier when you significantly increase the salt concentration in a colloidal suspension?",
      options: [
        "A. The energy barrier collapses, allowing particles to agglomerate",
        "B. The energy barrier grows infinitely higher",
        "C. Salt has no effect on electrostatic repulsion",
        "D. Van der Waals forces disappear completely"
      ],
      correct: 0,
      explanation: "Correct! High salt concentration compresses the electrical double layer, shrinking the repulsion range and collapsing the barrier."
    },
    {
      id: 2,
      title: "The Schulze-Hardy Rule (Valency)",
      description: "Analyze the dramatic impact of counter-ion charge.",
      prompt: "According to the Schulze-Hardy rule, how does the Critical Coagulation Concentration (CCC) scale with counter-ion valency z?",
      options: [
        "A. CCC is independent of valency (CCC ∝ 1)",
        "B. CCC scales linearly with valency (CCC ∝ 1/z)",
        "C. CCC scales inversely with the sixth power (CCC ∝ 1/z⁶)",
        "D. CCC scales quadratically (CCC ∝ 1/z²)"
      ],
      correct: 2,
      explanation: "Correct! Multivalent ions are extraordinarily effective coagulants, scaling as 1/z⁶."
    },
    {
      id: 3,
      title: "Steric vs Electrostatic Stabilization",
      description: "Evaluate alternative methods of preventing particle aggregation.",
      prompt: "How do polymer chains anchored to particle surfaces provide steric stabilization?",
      options: [
        "A. By increasing the solution pH to extreme levels",
        "B. By creating an osmotic and configurational entropy barrier when chains overlap",
        "C. By neutralizing all surface charges permanently",
        "D. By increasing van der Waals attraction"
      ],
      correct: 1,
      explanation: "Correct! When polymer-coated particles approach each other, overlapping chains restrict conformation and cause osmotic repulsion."
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
