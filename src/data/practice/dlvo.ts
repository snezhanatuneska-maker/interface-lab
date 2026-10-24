import type { BankQuestion } from '../../lib/bank'

// DLVO concept questions (moved from the DLVO page's knowledge check).

export const DLVO_BANK: BankQuestion[] = [
  {
    question: 'What happens to the DLVO energy barrier when the salt concentration is raised a lot?',
    correct: 'It collapses, so particles can aggregate',
    wrong: ['It grows without limit', 'Salt has no effect on electrostatic repulsion', 'Van der Waals forces disappear'],
    explanation: 'More salt compresses the double layer (κ⁻¹ ∝ 1/√I), shortening the repulsion range until the barrier is gone.',
  },
  {
    question: 'How does the critical coagulation concentration (CCC) scale with counter-ion valency z (Schulze–Hardy rule)?',
    correct: 'CCC ∝ 1/z⁶',
    wrong: ['CCC is independent of z', 'CCC ∝ 1/z', 'CCC ∝ 1/z²'],
    explanation: 'Multivalent counter-ions are far more effective coagulants: going from z = 1 to z = 2 lowers the CCC 64-fold.',
  },
  {
    question: 'How do polymer chains anchored on particle surfaces provide steric stabilization?',
    correct: 'Overlapping chains create an osmotic and conformational-entropy penalty',
    wrong: ['By raising the pH to extreme values', 'By neutralizing all surface charges', 'By increasing van der Waals attraction'],
    explanation: 'When coated particles approach, the chains crowd each other, lose conformations and draw in solvent: a repulsion.',
    level: 'medium',
  },
]
