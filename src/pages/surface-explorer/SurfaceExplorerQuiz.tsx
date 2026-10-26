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
      explanation: "AFM physically traces surface topography with a sharp cantilever tip, providing extraordinary vertical resolution."
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
      explanation: "XPS bombards the sample with X-rays, ejecting core electrons via the photoelectric effect."
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
      explanation: "Because photoelectrons have short inelastic mean free paths in solids, XPS probes only the top ~1–10 nm."
    }
  ];

  return (
    <section className="section" aria-labelledby="surface-quiz-title">
      <h2 id="surface-quiz-title" className="section-title">Interactive Exercises & Knowledge Check</h2>
      
      {questions.map((q) => {
        const selected = answers[q.id];
        const revealed = showResults[q.id];

        return (
          <div key={q.id} className="card quiz-card">
            <div className="eq-head">
              <div>
                <h3>
                  {q.id}. {q.title}
                </h3>
                <p className="note">{q.description}</p>
              </div>
              <button 
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="button"
              >
                Set it up
              </button>
            </div>

            <fieldset className="choices">
              <legend>{q.prompt}</legend>
              {q.options.map((opt, optIdx) => {
                let state = "";
                if (revealed) {
                  if (optIdx === q.correct) {
                    state = " correct";
                  } else if (optIdx === selected) {
                    state = " wrong";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    aria-pressed={selected === optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    className={`choice${state}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </fieldset>

            {revealed && (
              <p className={selected === q.correct ? 'insight' : 'result-warning'} role="status">
                {selected === q.correct ? `✓ ${q.explanation}` : `✕ Not quite right. ${q.explanation}`}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
};
