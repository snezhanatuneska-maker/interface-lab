import type { Rng } from './random'
import { labelled, numericOptions, round, type Difficulty, type Generator, type Step } from './training'
import { cassieAngle, criticalAngle, FS_RANGE, R_RANGE, wenzelAngle, youngFromTensions } from './wetting'

// Wetting training: contact angles from Young, Wenzel and Cassie–Baxter, and which rough-surface state is favoured.
// Reuses src/lib/wetting.ts. Angles in degrees, tensions in mN/m.

export type WettingAsk = 'young' | 'wenzel' | 'cassie' | 'state'

export interface WettingData {
  ask: WettingAsk
  gSV?: number
  gSL?: number
  gLV?: number
  thetaY?: number
  r?: number
  fs?: number
  /** The correct angle (deg) or state. */
  result: number | 'wenzel' | 'cassie'
}

const ASKS: Record<Difficulty, WettingAsk[]> = {
  easy: ['young', 'wenzel'],
  medium: ['young', 'wenzel', 'cassie'],
  hard: ['young', 'cassie', 'state'],
}

const RAD = Math.PI / 180
const acosDeg = (c: number) => Math.acos(Math.min(1, Math.max(-1, c))) / RAD
const deg = (v: number) => `${Math.round(v)}°`
const angleOptions = {
  format: deg,
  apart: (a: number, b: number) => Math.abs(a - b) >= 8,
  valid: (v: number) => Number.isFinite(v) && v >= 0 && v <= 180,
  fallback: (c: number, rng: Rng) => rng.shuffle([-40, -25, -15, 15, 25, 40]).concat([-60, 60, -80, 80]).map((d) => c + d),
}

/** Liquids with their surface tension γ_LV (mN/m, room temperature). */
const LIQUIDS = [
  { name: 'water', gLV: 72.8 },
  { name: 'glycerol', gLV: 63.4 },
  { name: 'ethylene glycol', gLV: 47.7 },
]

export const generateWetting: Generator<WettingData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = rng.pick(ASKS[difficulty])

  if (ask === 'young') {
    const liquid = rng.pick(LIQUIDS)
    const gLV = liquid.gLV
    let gSV: number, gSL: number, cos: number
    do {
      gSL = round(rng.uniform(2, 40), 3)
      gSV = round(gSL + gLV * Math.cos(rng.uniform(20, 150) * RAD), 3)
      cos = (gSV - gSL) / gLV
    } while (gSV < 5 || Math.abs(cos) > 0.95)
    const theta = youngFromTensions(gSV, gSL, gLV).theta
    const { options, answer } = numericOptions(
      rng,
      theta,
      [180 - theta, acosDeg((gSV - gSL) / gSV), acosDeg(gSV / gLV)], // sign flipped; divided by γ_SV; left out γ_SL
      angleOptions,
    )
    const steps: Step[] = [
      { text: 'Young’s equation balances the three tensions at the contact line:', tex: '\\gamma_{SV} = \\gamma_{SL} + \\gamma_{LV}\\cos\\theta_Y \;\\Rightarrow\; \\cos\\theta_Y = \\frac{\\gamma_{SV} - \\gamma_{SL}}{\\gamma_{LV}}' },
      { text: 'Insert the values:', tex: `\\cos\\theta_Y = \\frac{${gSV} - ${gSL}}{${gLV}} = ${cos.toFixed(3)}` },
      { text: `So θ_Y = arccos(${cos.toFixed(3)}) ≈ ${deg(theta)}: ${theta < 90 ? 'below 90°, the liquid wets the solid' : 'above 90°, the solid repels the liquid'}.` },
    ]
    return {
      question: `A drop of ${liquid.name} ($\\gamma_{LV}$ = ${gLV} mN/m) sits on a smooth solid with $\\gamma_{SV}$ = ${gSV} mN/m and $\\gamma_{SL}$ = ${gSL} mN/m. What is the Young contact angle $\\theta_Y$?`,
      options,
      answer,
      steps,
      data: { ask, gSV, gSL, gLV, result: theta },
    }
  }

  if (ask === 'wenzel') {
    const r = round(rng.uniform(1.2, 2.5), 2)
    // Keep |r cos θ_Y| below 1, so the drop has an angle rather than spreading or balling up completely.
    const allowed = Array.from({ length: 29 }, (_, i) => 20 + 5 * i).filter((t) => Math.abs(r * Math.cos(t * RAD)) < 0.95)
    const thetaY = rng.pick(allowed)
    const theta = wenzelAngle(thetaY, r)
    const { options, answer } = numericOptions(
      rng,
      theta,
      [thetaY, acosDeg(Math.cos(thetaY * RAD) / r), Math.min(thetaY * r, 180)], // ignored r; divided by r; multiplied the angle
      angleOptions,
    )
    const c = Math.cos(thetaY * RAD)
    return {
      question: `Water has $\\theta_Y$ = ${thetaY}° on the smooth material. The same material is roughened to $r$ = ${r} and the liquid fills the grooves (Wenzel state). What is the apparent contact angle?`,
      options,
      answer,
      steps: [
        { text: 'In the Wenzel state roughness multiplies the wetted area, so it multiplies cos θ:', tex: '\\cos\\theta_W = r\\cos\\theta_Y' },
        { text: 'Insert the values:', tex: `\\cos\\theta_W = ${r} \\times \\cos ${thetaY}^\\circ = ${r} \\times ${c.toFixed(3)} = ${(r * c).toFixed(3)}` },
        { text: `θ_W ≈ ${deg(theta)}. Roughness ${thetaY < 90 ? 'makes a wetting surface wet more' : 'makes a non-wetting surface repel more'}.` },
      ],
      data: { ask, thetaY, r, result: theta },
    }
  }

  if (ask === 'cassie') {
    const thetaY = rng.int(19, 32) * 5
    const fs = round(rng.uniform(FS_RANGE[0] + 0.05, 0.7), 2)
    const theta = cassieAngle(thetaY, fs)
    const c = Math.cos(thetaY * RAD)
    const { options, answer } = numericOptions(
      rng,
      theta,
      [acosDeg(fs * c), thetaY, Math.min(thetaY / fs, 180)], // forgot the air terms; ignored f_s; divided the angle
      angleOptions,
    )
    return {
      question: `A drop sits on the tops of a textured surface with trapped air underneath (Cassie–Baxter state). The smooth material has $\\theta_Y$ = ${thetaY}° and the solid fraction under the drop is $f_s$ = ${fs}. What is the apparent contact angle?`,
      options,
      answer,
      steps: [
        { text: 'Under the drop a fraction f_s is solid and the rest is air (where θ = 180°, cos θ = −1):', tex: '\\cos\\theta_{CB} = f_s(\\cos\\theta_Y + 1) - 1' },
        { text: 'Insert the values:', tex: `\\cos\\theta_{CB} = ${fs} \\times (${c.toFixed(3)} + 1) - 1 = ${(fs * (c + 1) - 1).toFixed(3)}` },
        { text: `θ_CB ≈ ${deg(theta)}. Less solid contact gives a higher angle.` },
      ],
      data: { ask, thetaY, fs, result: theta },
    }
  }

  // Which state is favoured: compare θ_Y with the critical angle cos θ_c = (f_s − 1)/(r − f_s).
  let thetaY: number, r: number, fs: number, crit: number
  do {
    thetaY = rng.int(19, 34) * 5
    r = round(rng.uniform(1.3, R_RANGE[1]), 2)
    fs = round(rng.uniform(0.1, 0.8), 2)
    crit = criticalAngle(r, fs)!
  } while (Math.abs(thetaY - crit) < 4)
  const state = thetaY > crit ? 'cassie' : 'wenzel'
  const labels = [
    'Cassie–Baxter: θ_Y is above the critical angle θ_c',
    'Wenzel: θ_Y is below the critical angle θ_c',
    'Wenzel: θ_Y is above the critical angle θ_c',
    'Cassie–Baxter: θ_Y is below the critical angle θ_c',
  ]
  const { options, answer } = labelled(rng, labels, state === 'cassie' ? 0 : 1)
  const cosc = (fs - 1) / (r - fs)
  return {
    question: `A hydrophobic material ($\\theta_Y$ = ${thetaY}°) is textured with roughness $r$ = ${r} and solid fraction $f_s$ = ${fs}. Which wetting state has the lower energy?`,
    options,
    answer,
    steps: [
      { text: 'The two states have equal energy when θ_Y equals the critical angle:', tex: '\\cos\\theta_c = \\frac{f_s - 1}{r - f_s}' },
      { text: 'Insert the values:', tex: `\\cos\\theta_c = \\frac{${fs} - 1}{${r} - ${fs}} = ${cosc.toFixed(3)} \;\\Rightarrow\; \\theta_c \\approx ${Math.round(crit)}^\\circ` },
      {
        text:
          state === 'cassie'
            ? `θ_Y = ${thetaY}° is above θ_c, so trapping air costs less energy than filling the grooves: Cassie–Baxter is favoured.`
            : `θ_Y = ${thetaY}° is below θ_c, so the liquid lowers its energy by filling the grooves: Wenzel is favoured.`,
      },
    ],
    data: { ask, thetaY, r, fs, result: state },
  }
}
