import type { BankQuestion } from '../../lib/bank'

// Crystal growth concept questions (moved from the crystal page's quiz).

export const CRYSTAL_BANK: BankQuestion[] = [
  {
    question: 'Which faces dominate the final crystal habit?',
    correct: 'The slowest-growing faces',
    wrong: ['The fastest-growing faces', 'The faces with the highest γ', 'All faces equally'],
    explanation: 'Fast faces move out quickly, shrink and disappear at the corners. The slow faces are left to bound the crystal.',
  },
  {
    question: 'A capping agent adsorbs strongly on face A. What happens?',
    correct: 'A grows slower and becomes larger (more expressed)',
    wrong: ['A grows faster and disappears', 'The shape does not change', 'The crystal dissolves'],
    explanation: 'Adsorbed molecules block the steps and kinks of face A, so its growth rate drops. Slow faces dominate the habit.',
  },
  {
    question: 'At very high supersaturation, crystals tend to become…',
    correct: 'branched / dendritic (diffusion-limited)',
    wrong: ['perfectly faceted', 'spherical and smooth', 'equal to the Wulff shape'],
    explanation: 'At high S the surface takes up solute faster than diffusion brings it. Tips reach further into the solution and grow faster.',
  },
  {
    question: 'In the BCF model, growth proceeds mainly via…',
    correct: 'spiral steps created by screw dislocations',
    wrong: ['random attachment anywhere on the face', '2D nuclei only', 'dissolution of edges'],
    explanation: 'A screw dislocation leaves a step that never runs out: it winds up into a spiral. Without it, each new layer needs a 2D nucleus.',
    level: 'medium',
  },
  {
    question: 'In the Wulff construction, the distance of a face from the crystal centre is proportional to…',
    correct: 'its surface energy γ',
    wrong: ['its growth rate only', 'the crystal density', 'the supersaturation'],
    explanation: 'The equilibrium shape minimises total surface energy: h ∝ γ. High-γ faces sit far out and end up small or absent.',
    level: 'medium',
  },
  {
    question: 'Stirring the solution strongly increases the growth rate. The growth is most likely…',
    correct: 'diffusion (mass-transfer) controlled',
    wrong: ['surface-reaction controlled', 'equilibrium-shape controlled', 'independent of S'],
    explanation: 'Stirring thins the diffusion layer, which only helps if transport to the surface is the slow step.',
  },
  {
    question: 'For a sphere of diameter x, the shape factors in A = βx² and V = αx³ are…',
    correct: 'β = π, α = π/6',
    wrong: ['β = 4π, α = 4π/3', 'β = π/6, α = π', 'β = 6, α = 1'],
    explanation: 'A = πx² and V = πx³/6 for a sphere of diameter x. (4π and 4π/3 go with the radius; 6 and 1 are a cube.)',
    level: 'hard',
  },
  {
    question: 'Lithium dendrites in batteries form mainly when…',
    correct: 'the charging current is high and growth becomes diffusion-limited',
    wrong: ['the charging current is very low', 'the electrolyte is stirred', 'the electrode is perfectly smooth'],
    explanation: 'At high current Li⁺ is used up at the surface faster than it diffuses in, so deposition is diffusion-limited and grows as branched, tip-growing dendrites. (Mossy Li can still form at low current, but by a different, SEI-driven mechanism.)',
  },
]
