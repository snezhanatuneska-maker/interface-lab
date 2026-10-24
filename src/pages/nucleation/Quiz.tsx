import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
  {
    id: 1,
    title: 'Two terms',
    description: 'Look at the two terms of ΔG(d) in equation (2).',
    prompt: 'What does the surface term πd²γ in ΔG(d) represent?',
    options: [
      'A. Energy released by forming the new phase',
      'B. Energy cost of creating the new interface',
      'C. The kinetic attachment rate',
      'D. Thermal energy kT',
    ],
    correct: 1,
    explanation: 'Creating interface costs energy, so this term resists nucleation; the volume term favours it.',
  },
  {
    id: 2,
    title: 'More supersaturation',
    description: 'Move the S slider up and watch the d* line in Figure 1.',
    prompt: 'What happens to the critical diameter d* when supersaturation S increases?',
    options: ['A. Increases', 'B. Decreases', 'C. Stays the same', 'D. Becomes negative'],
    correct: 1,
    explanation: 'd* = 4γV_m/(kT ln S); larger ln S → smaller d*.',
  },
  {
    id: 3,
    title: 'Why the surface helps',
    description: 'Compare the two curves in Figure 1 and the cap sketch.',
    prompt: 'Why is heterogeneous nucleation usually easier than homogeneous nucleation?',
    options: [
      'A. The surface raises the supersaturation',
      'B. The surface replaces part of the high-energy interface, so fewer molecules are needed to reach d*',
      'C. The critical radius is larger',
      'D. Surface tension is zero on solids',
    ],
    correct: 1,
    explanation: 'ΔG*_het = f(θ)·ΔG*_hom with f ≤ 1.',
  },
  {
    id: 4,
    title: 'A non-wetting nucleus',
    description: 'Move θ all the way to 180° and read f(θ).',
    prompt: 'For a contact angle θ = 180°, f(θ) equals:',
    options: ['A. 0', 'B. 0.5', 'C. 1', 'D. ∞'],
    correct: 2,
    explanation:
      'The nucleus does not wet the substrate, so the surface gives no help and the case is identical to homogeneous nucleation.',
  },
  {
    id: 5,
    title: 'Stronger interface',
    description: 'Set γ to 0.10 and then 0.20 J/m², and compare ΔG*_hom.',
    prompt: 'If the surface tension γ doubles (all else constant), the homogeneous barrier ΔG*_hom:',
    options: ['A. Doubles', 'B. Increases 4×', 'C. Increases 8×', 'D. Halves'],
    correct: 2,
    explanation: 'ΔG* ∝ γ³, so 2³ = 8.',
  },
  {
    id: 6,
    title: 'Electrolyser bubbles',
    description: 'Think of the CEP example above.',
    prompt: 'Where do H₂ bubbles mainly nucleate in an electrolyser?',
    options: [
      'A. Homogeneously in the bulk electrolyte',
      'B. Heterogeneously at the electrode surface and its defects',
      'C. Only at the membrane',
      'D. Only in the gas outlet',
    ],
    correct: 1,
    explanation: 'The liquid near the electrode is supersaturated, and the electrode supplies the surface that lowers the barrier.',
  },
]

export default function Quiz() {
  return <KnowledgeCheck title="Check your understanding" questions={QUESTIONS} />
}
