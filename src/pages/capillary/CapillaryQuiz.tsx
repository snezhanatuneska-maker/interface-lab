import React, { useState } from 'react';

export const CapillaryQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Pore Radius Scaling",
      description: "Observe how reducing the pore radius impacts the pressure jump.",
      prompt: "What happens to the capillary pressure (P_c) when you decrease the pore radius r?",
      options: [
        "A. It increases inversely, because P_c is proportional to 1/r",
        "B. It decreases linearly to zero",
        "C. It has no effect on capillary pressure",
        "D. It drops exponentially as pores get smaller"
      ],
      correct: 0,
      explanation: "Correct! Because radius is in the denominator of the Young–Laplace equation, smaller pores generate much higher capillary pressures."
    },
    {
      id: 2,
      title: "Contact Angle & Meniscus",
      description: "Examine how surface wetting properties influence fluid behavior.",
      prompt: "What defines a wetting fluid (imbibition) in terms of the contact angle θ?",
      options: [
        "A. θ > 90°, forming a convex bubble",
        "B. θ < 90°, forming a concave meniscus that rises inside the pore",
        "C. θ = 180°, meaning complete fluid repulsion",
        "D. Contact angle has no impact on pore filling"
      ],
      correct: 1,
      explanation: "Correct! A contact angle below 90° means the liquid wets the solid walls, creating capillary suction."
    },
    {
      id: 3,
      title: "Capillary Condensation",
      description: "Analyze vapor behavior under nanoscale confinement.",
      prompt: "Why does capillary condensation occur at relative pressures below saturation (P/P_0 < 1)?",
      options: [
        "A. Because the ambient temperature drops inside the pore",
        "B. Because the negative curvature of the confined meniscus lowers the required vapor pressure",
        "C. Because the gas molecules expand",
        "D. Because solid walls act as catalysts"
      ],
      correct: 1,
      explanation: "Correct! Confinement lowers the chemical potential required for condensation, explained by the Kelvin equation."
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
