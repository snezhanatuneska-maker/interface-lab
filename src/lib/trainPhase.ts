import { binodal, chi, region, spinodal, type Region } from './phase'
import type { Rng } from './random'
import { fmtTex, labelled, numericOptions, round, type Difficulty, type Generator } from './training'

// Phase separation training: the spinodal of a symmetric regular solution, and which region (stable, metastable,
// unstable) a mixture is in (src/lib/phase.ts).

export interface PhaseData {
  kind: 'phase'
  ask: 'spinodal' | 'region'
  chi: number
  x?: number
  t?: number
  result: number | Region
}

const REGION_LABELS: Record<Region, string> = {
  stable: 'Stable: it stays a single mixed phase',
  metastable: 'Metastable: it separates by nucleation & growth',
  unstable: 'Unstable: it separates by spinodal decomposition',
}

export const generatePhase: Generator<PhaseData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'region' : rng.pick(['spinodal', 'region'] as const)

  if (ask === 'spinodal') {
    const c = round(rng.uniform(2.2, 4), 2)
    const [xs] = spinodal(c)!
    const [xb] = binodal(c)!
    const { options, answer } = numericOptions(
      rng,
      xs,
      [xb, 0.5 - 0.5 * Math.sqrt(1 - 1 / c), 0.5 * Math.sqrt(1 - 2 / c)], // binodal; wrong factor; forgot ½ −
      { format: (v) => v.toFixed(3), apart: (a, b) => Math.abs(a - b) >= 0.03, valid: (v) => v > 0 && v < 0.5 },
    )
    return {
      question: `A symmetric regular solution has $G_\\text{mix}/kT = x\\ln x + (1-x)\\ln(1-x) + \\chi x(1-x)$ with χ = ${c}. At what composition x (below 0.5) is the spinodal?`,
      options,
      answer,
      steps: [
        { text: 'The spinodal is where the curvature of G vanishes:', tex: '\\frac{d^2G}{dx^2} = \\frac{1}{x(1-x)} - 2\\chi = 0 \;\\Rightarrow\; x(1-x) = \\frac{1}{2\\chi}' },
        { text: 'Solve the quadratic:', tex: `x = \\tfrac12 - \\tfrac12\\sqrt{1 - 2/\\chi} = \\tfrac12 - \\tfrac12\\sqrt{1 - 2/${c}} = ${fmtTex(xs)}` },
        { text: `The binodal (common tangent) lies further out, at x ≈ ${xb.toFixed(3)}; between the two the mixture is metastable.` },
      ],
      data: { kind: 'phase', ask, chi: c, result: xs },
    }
  }

  // Which region: pick a point that is not too close to a boundary.
  let x: number, t: number, reg: Region, c: number
  for (;;) {
    t = round(rng.uniform(0.6, 1.05), 2)
    x = round(rng.uniform(0.05, 0.5), 2)
    c = chi(t)
    reg = region(x, t)
    const b = binodal(c)
    const s = spinodal(c)
    const near = (v: number | undefined) => v !== undefined && Math.abs(x - v) < 0.03
    if (!near(b?.[0]) && !near(s?.[0])) break
  }
  const labels = [REGION_LABELS[reg], ...(Object.keys(REGION_LABELS) as Region[]).filter((r) => r !== reg).map((r) => REGION_LABELS[r]), 'It is exactly at the critical point']
  const { options, answer } = labelled(rng, labels, 0)
  const b = binodal(c)
  const s = spinodal(c)
  return {
    question: `A symmetric regular solution is quenched to T/T_c = ${t} (χ = 2T_c/T = ${c.toFixed(2)}) at composition x = ${x}. What happens to it?`,
    options,
    answer,
    steps: [
      b && s
        ? { text: `At χ = ${c.toFixed(2)} the binodal is at x = ${b[0].toFixed(3)} and the spinodal at x = ${s[0].toFixed(3)} (and their mirror images about 0.5).` }
        : { text: 'Above T_c (χ ≤ 2) there is no miscibility gap at all.' },
      {
        text:
          reg === 'stable'
            ? `x = ${x} is outside the binodal: the mixed state has the lowest free energy.`
            : reg === 'metastable'
              ? `x = ${x} is between binodal and spinodal: d²G/dx² > 0, so small fluctuations decay and a nucleus must cross a barrier.`
              : `x = ${x} is inside the spinodal: d²G/dx² < 0, so any small fluctuation grows, with no barrier.`,
      },
    ],
    data: { kind: 'phase', ask, chi: c, x, t, result: reg },
  }
}
