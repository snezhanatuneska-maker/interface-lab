import type { BankQuestion } from '../../lib/bank'

// Langmuir vs BET concept questions (moved from the adsorption page's "Try this").

export const ADSORPTION_BANK: BankQuestion[] = [
  {
    question: 'A BET isotherm with C = 50 is followed from p/p₀ = 0 to 0.3. Where does it bend (the knee, point B)?',
    correct: 'At p/p₀ ≈ 0.12, at one monolayer’s worth',
    wrong: ['At p/p₀ = 0.35, the end of the BET fit range', 'At p/p₀ = 0.5, half the saturation pressure', 'It does not bend; it rises steadily'],
    explanation:
      'B is at p/p₀ = 1/(1 + √C) ≈ 0.12 for C = 50. Before B, molecules land on bare solid and bind strongly. After B they land on other molecules, which hold them weakly, so the curve flattens.',
  },
  {
    question: 'What happens to the BET isotherm when C is below 2?',
    correct: 'The knee disappears; the curve bends up from the start',
    wrong: ['The knee becomes sharper', 'It levels off at one monolayer, like Langmuir', 'Nothing; C only changes the surface area'],
    explanation:
      'Below C = 2 the solid holds the first layer barely better than the liquid holds itself, so molecules pile up in islands (type III). No knee, no point B: Vₘ is unreliable.',
  },
  {
    question: 'At p/p₀ = 0.8, BET (C = 50) gives about 5 layers but Langmuir (K = 50) gives θ ≈ 0.98. Why is the Langmuir loading so much lower?',
    correct: 'Langmuir allows one molecule per site, so it stops at one layer',
    wrong: ['Langmuir molecules bind more weakly', 'The Langmuir surface has fewer sites', 'Langmuir is only valid below p/p₀ = 0.35'],
    explanation:
      'Langmuir is on its plateau at θ ≈ 0.98. At p/p₀ = 0.05 the two nearly agree (0.71 vs 0.76): almost everything is still in layer 1.',
    level: 'medium',
  },
  {
    question: 'Langmuir adsorption at p/p₀ = 0.1: K drops from 200 to 1. What happens to the coverage θ?',
    correct: 'It drops from about 0.95 to about 0.09',
    wrong: ['It stays the same; the pressure did not change', 'It rises; weaker binding frees sites', 'It drops to exactly 0.5'],
    explanation:
      'θ = Kx/(1 + Kx): 20/21 ≈ 0.95 for K = 200 and 0.1/1.1 ≈ 0.09 for K = 1. A strongly bound molecule rarely leaves, so the surface fills even at low pressure. That is why a few ppm of CO can poison a Pt fuel-cell anode.',
    level: 'medium',
  },
  {
    question: 'In a BET analysis, C changes from 10 to 300 for the same solid. What happens to the specific surface area in m²/g?',
    correct: 'It stays the same',
    wrong: ['It grows with C', 'It shrinks with C', 'It cannot be calculated once C > 100'],
    explanation:
      'Slope and intercept change, but Vₘ = 1/(slope + intercept) does not. Vₘ belongs to the solid, C to how strongly the gas binds to it.',
    level: 'hard',
  },
]
