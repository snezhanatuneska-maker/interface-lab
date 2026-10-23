import React, { useState } from 'react';

export const MipsQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    setShowResults({ ...showResults, [qIndex]: true });
  };

  const questions = [
    {
      id: 1,
      title: "Non-Wetting Behavior",
      description: "Examine why mercury requires external pressure to enter pores.",
      prompt: "Why must external hydraulic pressure be applied during Mercury Intrusion Porosimetry?",
      options: [
        "A. Because mercury is a wetting liquid with a contact angle below 0 degrees",
        "B. Because mercury is a non-wetting liquid (θ > 90°), meaning capillary forces resist entry",
        "C. To evaporate all moisture inside the sample",
        "D. To increase the temperature of the pore network"
      ],
      correct: 1,
      explanation: "Correct! Mercury has a high contact angle (>90°), so it does not spontaneously enter pores without forced pressure."
    },
    {
      id: 2,
      title: "The Washburn Equation Scaling",
      description: "Analyze how pressure relates to pore dimensions.",
      prompt: "According to the Washburn equation, how does the required intrusion pressure P scale with pore radius r?",
      options: [
        "A. P is directly proportional to r (P ∝ r)",
        "B. P is inversely proportional to r (P ∝ 1/r)",
        "C. P is independent of pore radius",
        "D. P scales exponentially with r squared"
      ],
      correct: 1,
      explanation: "Correct! Smaller pores have smaller radii in the denominator, requiring much higher pressures to force mercury inside."
    },
    {
      id: 3,
      title: "Ink-Bottle Pore Effects",
      description: "Understand structural limitations in porosimetry curves.",
      prompt: "What causes the 'ink-bottle effect' during mercury intrusion and extrusion curves?",
      options: [
        "A. Large pore cavities being blocked by narrow neck entrances",
        "B. Chemical reactions between mercury and carbon supports",
        "C. Complete evaporation of mercury at high vacuum",
        "D. Constant pore diameters throughout the entire sample"
      ],
      correct: 0,
      explanation: "Correct! Mercury enters narrow necks at high pressure, filling larger internal cavities prematurely, leading to hysteresis during extrusion."
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
