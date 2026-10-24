import type { BankQuestion } from '../../lib/bank'

// Surfactant concept questions (moved from the surfactant page's "Try this").

export const SURFACTANT_BANK: BankQuestion[] = [
  {
    question: 'SDS and Tween 20 both have a C12 tail, but the CMC of Tween 20 is about two orders of magnitude lower (8.2 mM vs 0.06 mM). Why?',
    correct: 'Tween 20 heads carry no charge, so they do not repel each other in a micelle',
    wrong: ['Tween 20 has a much longer tail', 'Tween 20 lowers the surface tension of water more', 'Non-ionic surfactants do not adsorb at the surface'],
    explanation:
      'Packing SDS heads into a micelle brings negative charges close together, and that repulsion has to be paid for, so more surfactant is needed before micelles pay off. Tween 20 heads are uncharged: no repulsion, a much lower CMC.',
  },
  {
    question: 'What does each extra CH₂ in the tail do to the CMC of an ionic surfactant?',
    correct: 'Roughly halves it',
    wrong: ['Doubles it', 'Divides it by 10', 'Nothing measurable'],
    explanation:
      'Klevens: log₁₀ CMC = A − 0.3·n, and 10^−0.3 ≈ 0.5. Each CH₂ makes leaving the water more favourable. For non-ionics (B ≈ 0.5) the factor is about 3.',
  },
  {
    question: 'Why does added NaCl lower the CMC of SDS but not of Tween 20?',
    correct: 'Salt ions screen the repulsion between the charged SDS heads; Tween heads have no charge to screen',
    wrong: ['Salt makes the tails longer', 'Salt raises the surface tension, which forces micelles to form', 'Salt reacts with SDS to form a new surfactant'],
    explanation:
      'Na⁺ ions gather around the negative sulfate heads and shield them from each other. At 100 mM NaCl the SDS CMC falls from 8.2 mM to about 1.6 mM. Tween’s heads are uncharged, so there is nothing to screen.',
    level: 'medium',
  },
  {
    question: 'For SDS, why does the conductivity rise more slowly with concentration above the CMC?',
    correct: 'Micelles bind part of their counter-ions (β ≈ 0.64), and the micelles themselves move slowly',
    wrong: ['The surfactant stops dissolving', 'The solution becomes turbid, which blocks the current', 'Surface tension no longer changes'],
    explanation:
      'Below the CMC each molecule adds a free Na⁺ and a free DS⁻. Above it, new molecules join micelles that hold on to about 64 % of their Na⁺: β = 1 − S_above/S_below. A non-ionic surfactant shows no break at all.',
    level: 'hard',
  },
]
