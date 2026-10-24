import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
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
]

export function ZetaQuiz() {
  return <KnowledgeCheck title="Interactive Exercises & Knowledge Check" questions={QUESTIONS} />
}
