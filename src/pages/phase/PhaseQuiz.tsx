import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
  {
    id: 1,
    title: 'Between the curves',
    description: 'Drag the point into the blue band of the phase diagram.',
    prompt: 'A mixture lies between the binodal and the spinodal. What happens?',
    options: [
      'A. It separates instantly',
      'B. It is metastable and separates only after a trigger (nucleation)',
      'C. It stays mixed forever',
      'D. It forms a bicontinuous network spontaneously',
    ],
    correct: 1,
    explanation: 'd²G/dx² > 0 there, so small fluctuations decay. Separation needs a nucleus that crosses the barrier.',
  },
  {
    id: 2,
    title: 'Defining the spinodal',
    description: 'Look at the diamonds on the G(x) curve.',
    prompt: 'The spinodal is defined by…',
    options: ['A. dG/dx = 0', 'B. G = 0', 'C. d²G/dx² = 0', 'D. the common tangent'],
    correct: 2,
    explanation: 'The spinodal is where the curvature of G changes sign: the inflection points, d²G/dx² = 0.',
  },
  {
    id: 3,
    title: 'No barrier',
    description: 'Drag the point into the orange region and read the status box.',
    prompt: 'Which mechanism has no energy barrier?',
    options: ['A. Nucleation & growth', 'B. Spinodal decomposition', 'C. Both', 'D. Neither'],
    correct: 1,
    explanation: 'Inside the spinodal any small fluctuation already lowers G, so nothing has to be crossed.',
  },
  {
    id: 4,
    title: 'Reading the profiles',
    description: 'Play the animation and watch the left panel.',
    target: 'anim-figure',
    prompt: 'Concentration profiles in nucleation & growth show…',
    options: [
      'A. small fluctuations that grow everywhere',
      'B. no change',
      'C. a uniform drift',
      'D. large, sharp, localized composition changes',
    ],
    correct: 3,
    explanation: 'Each nucleus jumps straight to x₂ with a sharp interface, while the rest of the matrix stays near x₀.',
  },
  {
    id: 5,
    title: 'More supersaturation',
    description: 'Move the S slider up and watch d*.',
    target: 'barrier-figure',
    prompt: 'Increasing supersaturation S does what to the critical diameter d*?',
    options: ['A. Increases it', 'B. Decreases it', 'C. No effect', 'D. Makes it negative only for S < 1'],
    correct: 1,
    explanation: 'd* = 4γV_m/(kT ln S): a larger ln S gives a smaller critical nucleus and a lower barrier.',
  },
  {
    id: 6,
    title: 'Undersaturated',
    description: 'Set S below 1.',
    target: 'barrier-figure',
    prompt: 'For S < 1, small clusters…',
    options: [
      'A. dissolve, because ΔG only increases with size',
      'B. grow without limit',
      'C. stop at d*',
      'D. become spinodal',
    ],
    correct: 0,
    explanation: 'With ln S < 0 both terms are positive, so there is no maximum and every cluster shrinks.',
  },
  {
    id: 7,
    title: 'Finding x₁ and x₂',
    description: 'Look at the straight line on the G(x) curve.',
    prompt: 'The binodal compositions x₁ and x₂ are found from…',
    options: ['A. the inflection points', 'B. the minimum of G', 'C. the critical point', 'D. the common tangent to G(x)'],
    correct: 3,
    explanation: 'Both phases must have equal chemical potentials, which is the common tangent touching G at x₁ and x₂.',
  },
  {
    id: 8,
    title: 'Membrane structure',
    description: 'Compare the two strips under the profiles.',
    target: 'anim-figure',
    prompt: 'A membrane with an interconnected (bicontinuous) pore structure most likely formed by…',
    options: ['A. nucleation & growth', 'B. spinodal decomposition', 'C. adsorption', 'D. crystallization from melt'],
    correct: 1,
    explanation: 'Spinodal decomposition grows everywhere at once with one wavelength, giving a connected network.',
  },
]

export default function PhaseQuiz() {
  return <KnowledgeCheck title="Check your understanding" questions={QUESTIONS} showScore />
}
