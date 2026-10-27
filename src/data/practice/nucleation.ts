import type { BankQuestion } from '../../lib/bank'

// Classical nucleation concept questions (moved from the nucleation page's quiz).

export const NUCLEATION_BANK: BankQuestion[] = [
  {
    question: 'What does the surface term πd²γ in ΔG(d) represent?',
    correct: 'The energy cost of creating the new interface',
    wrong: ['The energy released by forming the new phase', 'The kinetic attachment rate', 'The thermal energy kT'],
    explanation: 'Creating interface costs energy, so this term resists nucleation; the volume term favours it.',
  },
  {
    question: 'What happens to the critical diameter d* when the supersaturation S increases?',
    correct: 'It decreases',
    wrong: ['It increases', 'It stays the same', 'It becomes negative'],
    explanation: 'd* = 4γv_m/(kT ln S); larger ln S gives a smaller d*.',
  },
  {
    question: 'Why is heterogeneous nucleation usually easier than homogeneous nucleation?',
    correct: 'The surface replaces part of the high-energy interface, so the critical nucleus needs fewer molecules and the barrier is lower',
    wrong: ['The surface raises the supersaturation', 'The critical radius is larger', 'Surface tension is zero on solids'],
    explanation: 'ΔG*_het = f(θ)·ΔG*_hom with f ≤ 1. The radius of curvature d*/2 is the same as in the bulk; the cap just holds fewer molecules.',
  },
  {
    question: 'For a contact angle θ = 180°, the shape factor f(θ) equals:',
    correct: '1',
    wrong: ['0', '0.5', '∞'],
    explanation: 'The nucleus does not wet the substrate, so the surface gives no help: the same as homogeneous nucleation.',
    level: 'medium',
  },
  {
    question: 'If the surface tension γ doubles (all else constant), the homogeneous barrier ΔG*_hom:',
    correct: 'increases 8×',
    wrong: ['doubles', 'increases 4×', 'halves'],
    explanation: 'ΔG* ∝ γ³, so 2³ = 8.',
    level: 'medium',
  },
  {
    question: 'Where do H₂ bubbles mainly nucleate in an electrolyser?',
    correct: 'Heterogeneously at the electrode surface and its defects',
    wrong: ['Homogeneously in the bulk electrolyte', 'Only at the membrane', 'Only in the gas outlet'],
    explanation: 'The liquid near the electrode is supersaturated, and the electrode supplies the surface that lowers the barrier.',
  },
]
