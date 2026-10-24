import React, { useState } from 'react';

export const ZismanQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Zisman Plot Extrapolation",
      description: "Examine how critical surface tension is extracted from data.",
      prompt: "What value of cos(θ) is used on a Zisman plot to determine the critical surface tension (γ_c)?",
      options: [
        "A. cos(θ) = 0 (contact angle of 90 degrees)",
        "B. cos(θ) = 1 (complete wetting, contact angle of 0 degrees)",
        "C. cos(θ) = -1 (complete non-wetting)",
        "D. cos(θ) = 0.5"
      ],
      correct: 1,
      explanation: "Correct! The intercept where cos(θ) = 1 gives the critical surface tension γ_c."
    },
    {
      id: 2,
      title: "Teflon Low Surface Energy",
      description: "Analyze the molecular origin of fluoropolymer repellency.",
      prompt: "Why do fluoropolymers like Teflon (PTFE) exhibit exceptionally low critical surface tensions (~18 mN/m)?",
      options: [
        "A. Because they contain tightly packed CF₂ groups with low polarizability and weak intermolecular forces",
        "B. Because they are highly soluble in water",
        "C. Because they possess infinite electrical conductivity",
        "D. Because they absorb all liquid droplets instantly"
      ],
      correct: 0,
      explanation: "Correct! The dense fluorine shielding around carbon backbones creates minimal intermolecular forces and very low surface energy."
    },
    {
      id: 3,
      title: "Polar vs Non-Polar Surfaces",
      description: "Understand the interaction between liquids and substrates.",
      prompt: "How do high-energy surfaces (like clean metals or glass) typically interact with water?",
      options: [
        "A. They repel water into high contact angle beads",
        "B. They cause complete wetting or low contact angles because their surface energy exceeds water's surface tension",
        "C. They dissolve into the water droplet",
        "D. They prevent any hydrogen bonding"
      ],
      correct: 1,
      explanation: "Correct! High-energy solid surfaces easily spread water because their surface energy is much higher than the liquid's surface tension."
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
