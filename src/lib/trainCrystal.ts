import { survivingFamilies } from './crystal'
import type { Rng } from './random'
import { labelled, round, type Generator } from './training'

// Crystal growth training: which face families survive on a 2D crystal with {10} and {11} faces, given their
// growth-rate ratio (src/lib/crystal.ts). Slow faces win.

export interface CrystalData {
  kind: 'crystal'
  ratio: number
  survivors: string
}

const LABELS: Record<string, string> = {
  '10': 'Only the {10} faces',
  '11': 'Only the {11} faces',
  '10,11': 'Both {10} and {11} faces',
}

export const generateCrystal: Generator<CrystalData> = (rng: Rng) => {
  let ratio: number
  // Stay away from the two thresholds 1/√2 and √2, where a family only just survives.
  do ratio = round(rng.logUniform(0.3, 3), 2)
  while (Math.abs(ratio - Math.SQRT1_2) < 0.06 || Math.abs(ratio - Math.SQRT2) < 0.1)
  const survivors = survivingFamilies(ratio).join(',')
  const keys = [survivors, ...Object.keys(LABELS).filter((k) => k !== survivors)]
  const { options, answer } = labelled(rng, [...keys.map((k) => LABELS[k]), 'Neither: the crystal becomes round'], 0)
  return {
    question: `A square 2D crystal has {10} faces and diagonal {11} faces. The {11} faces grow ${ratio} times as fast as the {10} faces ($g_{11}/g_{10}$ = ${ratio}). Which faces bound the crystal once it has grown large?`,
    options,
    answer,
    steps: [
      { text: 'Fast faces outrun their neighbours and grow out at the corners; slow faces remain.' },
      { text: 'For this geometry {11} survives only if √2·g₁₁ < 2·g₁₀ (ratio below √2 ≈ 1.41), and {10} only if √2·g₁₁ > g₁₀ (ratio above 1/√2 ≈ 0.71).' },
      { text: `With g₁₁/g₁₀ = ${ratio}: ${LABELS[survivors].toLowerCase()} remain.` },
    ],
    data: { kind: 'crystal', ratio, survivors },
  }
}
