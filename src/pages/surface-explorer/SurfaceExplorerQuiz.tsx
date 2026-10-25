import React, { useState } from 'react';

export const SurfaceExplorerQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Vertical vs Lateral Resolution",
      description: "Compare the capabilities of AFM and SEM.",
      prompt: "Which technique is best suited for achieving sub-nanometer vertical resolution (< 0.1 nm) to measure precise atomic step heights on a surface?",
      options: [
        "A. Scanning Electron Microscopy (SEM)",
        "B. Atomic Force Microscopy (AFM) with a sharp cantilever tip",
        "C. X-ray Photoelectron Spectroscopy (XPS)",
        "D. Gas Adsorption Isotherms"
      ],
      correct: 1,
      explanation: "Correct! AFM physically traces surface topography with a sharp cantilever tip, providing extraordinary vertical resolution."
    },
    {
      id: 2,
      title: "The Photoelectric Effect in XPS",
      description: "Examine how XPS determines chemical states.",
      prompt: "What fundamental physical phenomenon is harnessed in XPS to determine core-level binding energies?",
      options: [
        "A. The photoelectric effect, measuring emitted photoelectron kinetic energy",
        "B. Secondary electron scattering caused by high-voltage magnetic fields",
        "C. Capillary pressure across curved menisci",
        "D. Electrostatic double-layer compression by salt"
      ],
      correct: 0,
      explanation: "Correct! XPS bombards the sample with X-rays, ejecting core electrons via the photoelectric effect."
    },
    {
      id: 3,
      title: "Information Depth",
      description: "Understand the surface sensitivity of spectroscopic techniques.",
      prompt: "What is the typical analytical information depth of standard XPS measurements?",
      options: [
        "A. 1 to 10 micrometers",
        "B. 1 to 10 nanometers (extremely surface sensitive)",
        "C. Exactly 1 meter",
        "D. Entire bulk thickness of the electrode"
      ],
      correct: 1,
      explanation: "Correct! Because photoelectrons have short inelastic mean free paths in solids, XPS probes only the top ~1–10 nm."
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
