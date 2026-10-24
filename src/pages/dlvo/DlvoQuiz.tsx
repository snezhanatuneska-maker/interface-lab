import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
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
]

export function DlvoQuiz() {
  return <KnowledgeCheck title="Interactive Exercises & Knowledge Check" questions={QUESTIONS} />
}
