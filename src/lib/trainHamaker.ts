import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator, type Problem } from './training'

export interface HamakerData {
  a: number
  d: number
}

const KT_OVER_1E20 = 1.380649e-23 * 298 / 1e-20 // kT at 298 K in units of 10^-20 J (about 0.4114)
const UNIT = '× 10⁻²⁰ J'
/** Inputs to one decimal place. */
const dec1 = (v: number) => Math.round(v * 10) / 10

export const generateHamaker: Generator<HamakerData> = (
  rng: Rng,
  difficulty: Difficulty,
): Problem<HamakerData> => {
  const ask = difficulty === 'easy' ? rng.pick(['combine', 'plane'] as const) : rng.pick(['combine', 'repulsive', 'plane', 'sphere'] as const)

  if (ask === 'combine') {
    const a11 = dec1(rng.uniform(6, 14))
    const a33 = dec1(rng.uniform(2, 4.5))
    const a132 = round(Math.pow(Math.sqrt(a11) - Math.sqrt(a33), 2), 2)
    const { options, answer } = numericOptions(
      rng,
      a132,
      [
        round(a11 - a33, 2),
        round(Math.sqrt(a11 * a33), 2),
        round(Math.pow(Math.sqrt(a11) + Math.sqrt(a33), 2), 2),
      ],
      { format: (v) => `${fmt(v, 2)} ${UNIT}` },
    )
    return {
      question: `Two identical particles ($A_{11} = A_{22} = ${a11} \\times 10^{-20}$ J) interact across a medium with $A_{33} = ${a33} \\times 10^{-20}$ J. Using the combining relation, what is $A_{132}$?`,
      options,
      answer,
      steps: [
        { text: 'Combining relation:', tex: `A_{132} \\approx \\left(\\sqrt{A_{11}} - \\sqrt{A_{33}}\\right)\\left(\\sqrt{A_{22}} - \\sqrt{A_{33}}\\right)` },
        { text: 'For identical particles this is a square:', tex: `A_{132} = \\left(\\sqrt{${fmtTex(a11)}} - \\sqrt{${fmtTex(a33)}}\\right)^2 = ${fmtTex(a132, 2)} \\times 10^{-20}\\ \\text{J}` },
      ],
      data: { a: a132, d: 0 },
    }
  }

  if (ask === 'repulsive') {
    const a11 = dec1(rng.uniform(2, 4))
    const a33 = dec1(rng.uniform(5, 7))
    const a22 = dec1(rng.uniform(9, 14))
    const a132 = round((Math.sqrt(a11) - Math.sqrt(a33)) * (Math.sqrt(a22) - Math.sqrt(a33)), 2)
    const { options, answer } = numericOptions(
      rng,
      a132,
      [round(-a132, 2), round(a132 * 2, 2), round(a132 / 2, 2)], // sign flipped; doubled; halved
      {
        format: (v) => `${fmt(v, 2)} ${UNIT}`,
        // The answer is negative (repulsion), so negative options must be allowed.
        valid: (v) => Number.isFinite(v) && v !== 0,
        fallback: (c) => [3, 0.25, 4, 1.5].map((f) => round(c * f, 2)),
      },
    )
    return {
      question: `Material 1 has $A_{11} = ${a11} \\times 10^{-20}$ J, material 2 has $A_{22} = ${a22} \\times 10^{-20}$ J, and the medium between them has $A_{33} = ${a33} \\times 10^{-20}$ J. What is $A_{132}$ (a negative value means repulsion)?`,
      options,
      answer,
      steps: [
        { text: 'Combining relation:', tex: `A_{132} \\approx \\left(\\sqrt{A_{11}} - \\sqrt{A_{33}}\\right)\\left(\\sqrt{A_{22}} - \\sqrt{A_{33}}\\right)` },
        { text: 'The medium lies between the two materials, so one bracket is negative:', tex: `A_{132} = \\left(\\sqrt{${fmtTex(a11)}} - \\sqrt{${fmtTex(a33)}}\\right)\\left(\\sqrt{${fmtTex(a22)}} - \\sqrt{${fmtTex(a33)}}\\right) = ${fmtTex(a132, 2)} \\times 10^{-20}\\ \\text{J}` },
      ],
      data: { a: a132, d: 0 },
    }
  }

  if (ask === 'plane') {
    const a = dec1(rng.uniform(0.5, 3))
    const d = dec1(rng.uniform(1.2, 3))
    const w = round((a * 10) / (12 * Math.PI * d * d), 3) // mJ/m^2
    const { options, answer } = numericOptions(
      rng,
      w,
      [round((a * 10) / (6 * Math.PI * d * d), 3), round((a * 10) / (12 * Math.PI * d), 3), round(w / 2, 3)],
      { format: (v) => `${fmt(v, 3)} mJ/m²` },
    )
    return {
      question: `Two flat plates have $A_{132} = ${a} \\times 10^{-20}$ J and are separated by $D = ${d}$ nm. What is the magnitude of the attractive energy per unit area, $|W|$?`,
      options,
      answer,
      steps: [
        { text: 'Plane–plane energy per unit area:', tex: `W = -\\frac{A_{132}}{12\\pi D^2}` },
        { text: 'Substitute (1 J/m² = 1000 mJ/m²):', tex: `|W| = \\frac{${fmtTex(a)} \\times 10^{-20}}{12\\pi (${fmtTex(d)} \\times 10^{-9})^2} \\approx ${fmtTex(w, 3)}\\ \\text{mJ/m}^2` },
      ],
      data: { a, d },
    }
  }

  // sphere-plane
  const a = dec1(rng.uniform(0.5, 3))
  const radius = Math.round(rng.uniform(200, 1000)) // nm
  const d = dec1(rng.uniform(1.5, 4))
  const wkt = round(((a * radius) / (6 * d)) / KT_OVER_1E20, 3)
  const { options, answer } = numericOptions(
    rng,
    wkt,
    [round(wkt * 2, 3), round(wkt / 6, 3), round(((a * radius) / (6 * d * d)) / KT_OVER_1E20, 3)],
    { format: (v) => `${fmt(v, 3)} kT` },
  )
  return {
    question: `A sphere of radius $R = ${radius}$ nm sits at $D = ${d}$ nm from a flat plate, with $A_{132} = ${a} \\times 10^{-20}$ J. What is the magnitude of the attractive energy $|W|$ in units of $kT$ (298 K)?`,
    options,
    answer,
    steps: [
      { text: 'Sphere–plane energy (R much larger than D):', tex: `W = -\\frac{A_{132} R}{6D}` },
      { text: 'Substitute and divide by kT = 4.11 × 10⁻²¹ J:', tex: `|W| = \\frac{${fmtTex(a)} \\times 10^{-20} \\times ${fmtTex(radius)}}{6 \\times ${fmtTex(d)}} \\big/ kT \\approx ${fmtTex(wkt, 3)}\\ kT` },
    ],
    data: { a, d },
  }
}
