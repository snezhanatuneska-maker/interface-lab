import { gammaWater, KELVIN_0, kelvinPoreRadius, poreKelvinRatio, capillaryPressure, jurinHeight, G } from './capillary'
import { pressureCurves, type PoreNetwork } from './poreNetwork'
import type { Rng } from './random'
import { duNouyForce, wilhelmyForce } from './surfaceTension'
import { fmt, fmtTex, type Step } from './training'

// Liquid Interfaces – Exercise Sheet 1 (Exercises 1.1–1.4): the original data, the solution path in compendium
// notation and the official final answers, plus "try with new numbers" variants that follow the same path.
// Text may hold inline TeX between $…$ (RichText).

// ---------------------------------------------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------------------------------------------

export interface Tolerance {
  /** Relative tolerance (0.03 = ±3 %). */
  rel?: number
  /** Absolute tolerance, in the field's unit. */
  abs?: number
}

export interface Field {
  /** Label shown next to the input (or the row/column of a table). */
  label: string
  /** Correct value in the field's unit. */
  value: number
  unit: string
  tol: Tolerance
  /** Official answer as printed on the answer sheet (original numbers only). */
  official?: string
}

export interface Choice {
  question: string
  options: string[]
  answer: number
}

export interface Part {
  id: string
  /** The task text of the part. */
  prompt: string
  /** Numeric fields; none for comment/explain parts. */
  fields?: Field[]
  /** Lays the fields out as a table, row-major. */
  table?: { corner: string; rows: string[]; cols: string[] }
  /** Worked solution. */
  steps?: Step[]
  /** Final answer line (numeric parts) or model answer (text parts). */
  answer: string
  /** Comment that goes with the numeric answer. */
  comment?: string
  /** Optional concept check built from the official answer. */
  choice?: Choice
}

export const withinTolerance = (input: number, f: Pick<Field, 'value' | 'tol'>) => {
  const err = Math.abs(input - f.value)
  return (f.tol.abs !== undefined && err <= f.tol.abs + 1e-12) || (f.tol.rel !== undefined && err <= f.tol.rel * Math.abs(f.value) + 1e-12)
}

const REL3: Tolerance = { rel: 0.03 }
const round = (x: number, sig = 3) => Number(x.toPrecision(sig))
const pick = <T,>(rng: Rng, list: readonly T[]) => list[Math.floor(rng.next() * list.length)]

// ---------------------------------------------------------------------------------------------------------------
// Exercise 1.1: Wilhelmy plate and Du Noüy ring
// ---------------------------------------------------------------------------------------------------------------

export interface Ex11 {
  /** Plate width and thickness, m. */
  width: number
  thickness: number
  /** Extra mass on the pan, kg. */
  mass: number
  /** Ring wire diameter and outer diameter, m. */
  wire: number
  outer: number
}

export const EX11: Ex11 = { width: 0.1, thickness: 0.001, mass: 0.42e-3, wire: 0.3e-3, outer: 10e-3 }

export function solve11(p: Ex11) {
  const F = p.mass * G
  const P = 2 * (p.width + p.thickness)
  const gamma = F / P // N/m; δ = 0
  const inner = p.outer - 2 * p.wire
  const line = Math.PI * (p.outer + inner)
  const Fring = duNouyForce(gamma, p.outer, inner)
  const dm = Fring / G
  return { F, P, gamma, inner, line, Fring, dm, check: wilhelmyForce(gamma, p.width, p.thickness) }
}

export const randomize11 = (rng: Rng): Ex11 => ({
  width: round(rng.uniform(0.04, 0.15), 2),
  thickness: round(rng.uniform(0.5, 2) * 1e-3, 2),
  mass: round(rng.uniform(0.2, 0.7) * 1e-3, 2),
  wire: pick(rng, [0.2, 0.25, 0.3, 0.4, 0.5]) * 1e-3,
  outer: rng.int(8, 20) * 1e-3,
})

export function text11(p: Ex11): string {
  return (
    `A Wilhelmy plate with width ${fmt(p.width * 100)} cm and thickness ${fmt(p.thickness * 1e3)} mm is suspended vertically and connected via a balance arm to a counterweight. ` +
    `When a trough containing soap solution is raised so that the glass plate touches the liquid surface, an additional mass of ${fmt(p.mass * 1e3)} g has to be added to the counterweight pan to keep the arm horizontal.`
  )
}

export function parts11(p: Ex11, official: boolean): Part[] {
  const s = solve11(p)
  return [
    {
      id: 'a',
      prompt: 'Determine the surface tension of the liquid.',
      fields: [{ label: '$\\gamma$', value: s.gamma * 1e3, unit: 'mN/m', tol: REL3, official: official ? '20.4 mN/m' : undefined }],
      steps: [
        { text: 'The extra mass balances the force with which the surface pulls the plate down:', tex: `F = m g = ${fmtTex(p.mass)}\\ \\mathrm{kg} \\times 9.81\\ \\mathrm{m\\,s^{-2}} = ${fmtTex(s.F)}\\ \\mathrm{N}` },
        { text: 'Wetted perimeter of the plate; a clean glass plate is fully wetted, $\\delta = 0$:', tex: `P = 2(\\text{width} + \\text{thickness}) = 2(${fmtTex(p.width)} + ${fmtTex(p.thickness)})\\ \\mathrm{m} = ${fmtTex(s.P, 4)}\\ \\mathrm{m}` },
        { text: 'Wilhelmy: $F = \\gamma P\\cos\\delta$, so', tex: `\\gamma = \\frac{F}{P} = \\frac{${fmtTex(s.F)}}{${fmtTex(s.P, 4)}}\\ \\mathrm{N/m} = ${fmtTex(s.gamma * 1e3)}\\ \\mathrm{mN/m}` },
      ],
      answer: `$\\gamma$ = ${fmt(s.gamma * 1e3)} mN/m`,
    },
    {
      id: 'b',
      prompt: `You check your result using the Du Noüy method. You use the same setup but replace the plate with a ring made of a wire with diameter ${fmt(p.wire * 1e3)} mm. The ring has an outer diameter of ${fmt(p.outer * 1e3)} mm. Assuming the ring is initially balanced, what additional mass should be added once the ring is contacted with the soap solution?`,
      fields: [{ label: '$\\Delta m$', value: s.dm * 1e3, unit: 'g', tol: REL3, official: official ? '0.127 g' : undefined }],
      steps: [
        { text: 'The ring holds liquid along two contact lines, outside and inside the wire. Inner diameter:', tex: `d_\\text{inner} = ${fmtTex(p.outer * 1e3)} - 2 \\times ${fmtTex(p.wire * 1e3)} = ${fmtTex(s.inner * 1e3)}\\ \\mathrm{mm}` },
        { text: 'Total contact line:', tex: `\\pi(d_\\text{outer} + d_\\text{inner}) = \\pi \\times ${fmtTex((p.outer + s.inner) * 1e3)}\\ \\mathrm{mm} = ${fmtTex(s.line * 1e3)}\\ \\mathrm{mm}` },
        { text: 'Du Noüy force with the γ from (a):', tex: `F = \\gamma\\cdot\\pi(d_\\text{outer}+d_\\text{inner}) = ${fmtTex(s.gamma, 4)} \\times ${fmtTex(s.line, 4)}\\ \\mathrm{N} = ${fmtTex(s.Fring)}\\ \\mathrm{N}` },
        { text: 'Extra mass on the pan:', tex: `\\Delta m = \\frac{F}{g} = ${fmtTex(s.Fring / G)}\\ \\mathrm{kg} = ${fmtTex(s.dm * 1e3)}\\ \\mathrm{g}` },
      ],
      answer: `$\\Delta m$ = ${fmt(s.dm * 1e3)} g`,
    },
    {
      id: 'c',
      prompt: 'You double the concentration of the soap in the liquid but determine the same surface tension. Comment on this observation.',
      answer:
        'The soap concentration is above the critical micelle concentration (CMC). The surface is already saturated with surfactant, and the extra surfactant forms micelles in the bulk, so $\\gamma$ does not change.',
      choice: {
        question: 'Why does doubling the soap concentration leave γ unchanged?',
        options: [
          'The concentration is above the CMC: the surface is saturated and extra surfactant forms micelles in the bulk.',
          'The Wilhelmy plate is no longer wetted, so it cannot measure a change.',
          'Surfactants only lower γ of pure water; once some are present, more have no effect at any concentration.',
          'Doubling the concentration doubles γ and halves it again through evaporation.',
        ],
        answer: 0,
      },
    },
  ]
}

// ---------------------------------------------------------------------------------------------------------------
// Exercise 1.2: contact angles of ethanol–water mixtures on bare and silanized glass
// ---------------------------------------------------------------------------------------------------------------

export const F_ETHANOL = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1]

export interface Ex12 {
  /** mN/m */
  gSGBare: number
  gSGSil: number
  /** Contact angles δ (°) read from the figure, one per F_ETHANOL. */
  bare: number[]
  sil: number[]
}

export const EX12: Ex12 = {
  gSGBare: 83,
  gSGSil: 20,
  bare: [53, 47, 42, 26, 14, 12, 6],
  sil: [96, 82, 63, 54, 48, 44, 28],
}

/** Official γ_sl (mN/m) from the answer sheet, for the original data. */
export const OFFICIAL_12 = {
  bare: [40, 51, 55, 56, 58, 60, 61],
  sil: [27, 13, 3, 2, 2, 3, 1],
}

/** γ_lg of the ethanol–water mixture (mN/m), from the exercise. */
export const gammaLGMix = (f: number) => 17.6 + 28.3 * Math.exp(-f / 0.084) + 24.8 * Math.exp(-f / 0.566)

/** Young rearranged: γ_sl = γ_sg − γ_lg cos δ. */
export const youngGammaSL = (gSG: number, gLG: number, delta: number) => gSG - gLG * Math.cos((delta * Math.PI) / 180)

export function solve12(p: Ex12) {
  const gLG = F_ETHANOL.map(gammaLGMix)
  return {
    gLG,
    bare: gLG.map((g, i) => youngGammaSL(p.gSGBare, g, p.bare[i])),
    sil: gLG.map((g, i) => youngGammaSL(p.gSGSil, g, p.sil[i])),
  }
}

export const randomize12 = (rng: Rng): Ex12 => {
  const jitter = (d: number) => Math.min(170, Math.max(2, Math.round(d + rng.uniform(-4, 4))))
  return {
    gSGBare: Math.round(rng.uniform(76, 90)),
    gSGSil: Math.round(rng.uniform(18, 24)),
    bare: EX12.bare.map(jitter),
    sil: EX12.sil.map(jitter),
  }
}

export function parts12(p: Ex12, official: boolean): Part[] {
  const s = solve12(p)
  const cols = F_ETHANOL.map((f) => f.toFixed(1))
  const tol: Tolerance = { abs: 2 }
  const row = (vals: number[], off: number[]) =>
    vals.map((v, i) => ({ label: `f = ${cols[i]}`, value: v, unit: 'mN/m', tol, official: official ? `${off[i]}` : undefined }))
  const tex0 = (gSG: number, d: number) => `\\gamma_{sl} = ${gSG} - ${fmtTex(s.gLG[0], 3)} \\cos ${d}^\\circ = ${fmtTex(youngGammaSL(gSG, s.gLG[0], d), 3)}\\ \\mathrm{mN/m}`
  return [
    {
      id: 'a',
      prompt: 'With reference to the chemical composition of the surfaces, comment on the qualitative trends in the contact-angle data.',
      answer:
        'Bare glass carries polar Si–OH groups (high $\\gamma_{sg}$) and is partially wetted by water ($\\delta \\approx 53°$). Silanized glass carries non-polar Si–CH₃ groups (low $\\gamma_{sg}$) and is not wetted by water ($\\delta \\approx 96°$). Ethanol lowers $\\gamma_{lg}$, so $\\delta$ decreases on both surfaces, but the silanized surface always shows the larger contact angle.',
      choice: {
        question: 'Why is δ always larger on the silanized glass?',
        options: [
          'Its non-polar Si–CH₃ groups give a low γ_sg, while bare glass has polar Si–OH groups with a high γ_sg.',
          'Silanization makes the glass rougher, and roughness always raises the angle.',
          'Ethanol reacts with the silane layer and raises γ_lg.',
          'Silanized glass is hydrophilic, so the liquid beads up.',
        ],
        answer: 0,
      },
    },
    {
      id: 'b',
      prompt:
        'Determine graphically the trend in the solid–liquid interface energy $\\gamma_{sl}$ for both substrates for the mixtures used. Comment on the trends in $\\gamma_{sl}$ for the bare and treated substrate with increasing $f_\\text{ethanol}$.',
      fields: [...row(s.bare, OFFICIAL_12.bare), ...row(s.sil, OFFICIAL_12.sil)],
      table: { corner: 'γ_sl / mN m⁻¹', rows: ['bare', 'silanized'], cols },
      steps: [
        { text: 'Rearrange Young’s equation for the solid–liquid interface energy:', tex: String.raw`\gamma_{sl} = \gamma_{sg} - \gamma_{lg}\cos\delta` },
        {
          text: 'Compute $\\gamma_{lg}$ of each mixture from the given fit (values in mN/m):',
          tex: `\\gamma_{lg}(f) = 17.6 + 28.3\\,e^{-f/0.084} + 24.8\\,e^{-f/0.566}:\\quad ${s.gLG.map((g, i) => `${cols[i]} \\to ${g.toFixed(1)}`).join(',\\ ')}`,
        },
        { text: `Check at $f_\\text{ethanol} = 0$, bare glass ($\\gamma_{sg}$ = ${p.gSGBare} mN/m):`, tex: tex0(p.gSGBare, p.bare[0]) },
        { text: `and silanized glass ($\\gamma_{sg}$ = ${p.gSGSil} mN/m):`, tex: tex0(p.gSGSil, p.sil[0]) },
        { text: 'Repeat for every mixture and plot $\\gamma_{sl}$ against $f_\\text{ethanol}$ for both substrates.' },
      ],
      answer: `Bare: ${s.bare.map((v) => Math.round(v)).join(', ')} mN/m; silanized: ${s.sil.map((v) => Math.round(v)).join(', ')} mN/m (±2 mN/m).`,
      comment:
        'On bare glass $\\gamma_{sl}$ rises with ethanol, because water interacts with the silanol groups more favourably (hydrogen bonds) than ethanol does. On silanized glass $\\gamma_{sl}$ falls to almost zero, because ethanol interacts with the methylated surface like with like (dispersion forces).',
    },
  ]
}

// ---------------------------------------------------------------------------------------------------------------
// Exercise 1.3: capillary pressure diagram of a model pore system
// ---------------------------------------------------------------------------------------------------------------

export interface Ex13 {
  /** Subunit radii r_i, r_ii, r_iii, m. */
  r: [number, number, number]
  /** Surface tension, N/m. */
  gamma: number
  /** Subunit height, m. */
  height: number
  /** Radius of the replacement for subunit iii in (c), m. */
  rWide: number
}

export const EX13: Ex13 = { r: [1e-6 / 3, 0.5e-6, 1e-6], gamma: 0.072, height: 10e-3, rWide: 1e-3 }
export const RHO_13 = 1000

/** Columns I–IV, top → bottom, as subunit types 0 = i, 1 = ii, 2 = iii. */
export const GEOMETRY_13 = [
  [2, 1, 0],
  [0, 1, 2],
  [0, 1, 0],
  [1, 0, 1],
]

/** Interconnections of (d): I-ii ↔ II-ii ↔ III-ii, and III-ii to IV-middle (i) and IV-bottom (ii). */
export const LINKS_13: [[number, number], [number, number]][] = [
  [[0, 1], [1, 1]],
  [[1, 1], [2, 1]],
  [[2, 1], [3, 1]],
  [[2, 1], [3, 2]],
]

export const network13 = (p: Ex13, links = false): PoreNetwork => ({
  columns: GEOMETRY_13.map((col) => col.map((t) => p.r[t])),
  height: p.height,
  links: links ? LINKS_13 : undefined,
})

const ROMAN = ['i', 'ii', 'iii']

export function solve13(p: Ex13) {
  const fluid = { gamma: p.gamma, delta: 0 }
  const pc = p.r.map((r) => capillaryPressure(p.gamma, 0, r)) // Pa
  const h = p.r.map((r) => jurinHeight(p.gamma, 0, r, RHO_13))
  const plain = pressureCurves(network13(p), fluid)
  const linked = pressureCurves(network13(p, true), fluid)
  const hWide = jurinHeight(p.gamma, 0, p.rWide, RHO_13)
  const vol = p.r.map((r) => (r / p.r[2]) ** 2) // relative to subunit iii
  return { pc, h, plain, linked, hWide, vol }
}

export const randomize13 = (rng: Rng): Ex13 => {
  const scale = pick(rng, [0.5, 0.8, 1.25, 1.5, 2])
  return {
    r: [round((1e-6 / 3) * scale, 3), 0.5e-6 * scale, 1e-6 * scale],
    gamma: pick(rng, [0.05, 0.06, 0.065, 0.072]),
    height: pick(rng, [5e-3, 10e-3, 20e-3]),
    rWide: pick(rng, [0.5e-3, 1e-3, 2e-3]),
  }
}

/** Δp column headings between the subunit capillary pressures (bar). */
function rangeCols(pc: number[]) {
  const t = [...pc].sort((a, b) => a - b).map((x) => fmt(x / 1e5))
  return [`< ${t[0]}`, `${t[0]}–${t[1]}`, `${t[1]}–${t[2]}`, `> ${t[2]}`]
}

export function parts13(p: Ex13, official: boolean): Part[] {
  const s = solve13(p)
  const cols = rangeCols(s.pc)
  const sTol: Tolerance = { abs: 0.01 }
  const off = <T,>(v: T) => (official ? v : undefined)
  const OFF_PC = ['4.32', '2.88', '1.44']
  const OFF_H = ['44.0', '29.4', '14.7']
  const OFF_DR = ['1', '0.74', '0.61', '0']
  const OFF_IM = ['1', '0.38', '0.058', '0']
  const OFF_D = ['1', '0.74', '0.15', '0.09']
  const height = p.height * 3
  const vols = s.vol.map((v) => fmt(v, 3))
  const colVol = GEOMETRY_13.map((c) => c.reduce((a, t) => a + s.vol[t], 0))
  return [
    {
      id: 'a',
      prompt: 'For the individual subunit capillaries, determine the corresponding capillary pressure and theoretical capillary rise height.',
      fields: [
        ...s.pc.map((v, k) => ({ label: ROMAN[k], value: v / 1e5, unit: 'bar', tol: REL3, official: off(OFF_PC[k]) })),
        ...s.h.map((v, k) => ({ label: ROMAN[k], value: v, unit: 'm', tol: REL3, official: off(OFF_H[k]) })),
      ],
      table: { corner: 'subunit', rows: ['Δp / bar', 'h / m'], cols: ROMAN },
      steps: [
        { text: 'Capillary pressure of a cylindrical capillary with $\\delta = 0°$:', tex: String.raw`p_c = \frac{2\gamma\cos\delta}{r_c}` },
        ...p.r.map((r, k) => ({
          text: `Subunit ${ROMAN[k]}, $r_c$ = ${fmt(r * 1e6)} µm:`,
          tex: `p_c = \\frac{2 \\times ${p.gamma}}{${fmtTex(r)}}\\ \\mathrm{Pa} = ${fmtTex(s.pc[k])}\\ \\mathrm{Pa} = ${fmtTex(s.pc[k] / 1e5)}\\ \\mathrm{bar},\\quad h_c = \\frac{p_c}{\\rho_L g} = ${fmtTex(s.h[k])}\\ \\mathrm{m}`,
        })),
      ],
      answer: `$p_c$ = ${s.pc.map((v) => fmt(v / 1e5)).join(', ')} bar; $h_c$ = ${s.h.map((v) => fmt(v)).join(', ')} m (i, ii, iii).`,
    },
    {
      id: 'b',
      prompt: 'Assuming the entire pore system is initially filled with water, determine the capillary pressure diagram for drainage and subsequent imbibition.',
      fields: [
        ...s.plain.drainage.map((q, k) => ({ label: cols[k], value: q.S, unit: '', tol: sTol, official: off(OFF_DR[k]) })),
        ...s.plain.imbibition.map((q, k) => ({ label: cols[k], value: q.S, unit: '', tol: sTol, official: off(OFF_IM[k]) })),
      ],
      table: { corner: 'Δp / bar', rows: ['S, drainage', 'S, imbibition'], cols },
      steps: [
        { text: `Volumes ∝ $r^2$ × subunit height: i : ii : iii = ${vols.join(' : ')} (× π h $r_{iii}^2$).` },
        { text: `Column totals I–IV: ${colVol.map((v) => fmt(v, 4)).join(', ')}; total ${fmt(colVol.reduce((a, b) => a + b), 4)}.` },
        { text: 'Drainage: the top subunit of a column drains when $\\Delta p$ exceeds its $p_c$; a lower subunit drains only once gas has reached it from above and its liquid still connects to the membrane.' },
        { text: `Δp ${cols[1]} bar: only I-top (iii) drains (II-bottom iii is shielded by the i above it). Δp ${cols[2]} bar: I-ii and IV-top ii drain too. Δp ${cols[3]} bar: everything drains.` },
        { text: 'Imbibition: subunits fill from the bottom when $\\Delta p < p_c$ and everything below them is filled.' },
        { text: `Δp ${cols[2]} bar: only the bottom i subunits (I, III) fill. Δp ${cols[1]} bar: columns I (up to ii), III and IV fill; II stays empty behind its bottom iii. Δp ${cols[0]} bar: all filled.` },
      ],
      answer: `S (drainage) = ${s.plain.drainage.map((q) => fmt(q.S, 2)).join(', ')}; S (imbibition) = ${s.plain.imbibition.map((q) => fmt(q.S, 2)).join(', ')} for Δp ${cols.join(', ')} bar.`,
      comment: 'Imbibition lies below drainage (hysteresis): large pores empty first on drainage, small pores fill first on imbibition.',
    },
    {
      id: 'c',
      prompt: `Subunit iii is replaced with a ${fmt(p.rWide * 1e3)} mm radius capillary. Determine the theoretical capillary rise height for this capillary and comment on the implication for drainage of the whole pore system.`,
      fields: [{ label: '$h_c$', value: s.hWide * 1e3, unit: 'mm', tol: REL3, official: off('14.7 mm') }],
      steps: [
        { text: 'Jurin with $\\delta = 0$:', tex: `h_c = \\frac{2\\gamma}{\\rho_L g r_c} = \\frac{2 \\times ${p.gamma}}{${RHO_13} \\times 9.81 \\times ${fmtTex(p.rWide)}}\\ \\mathrm{m} = ${fmtTex(s.hWide * 1e3)}\\ \\mathrm{mm}` },
        { text: `Compare with the height of the pore system, 3 × ${fmt(p.height * 1e3)} mm = ${fmt(height * 1e3)} mm.` },
      ],
      answer: `$h_c$ = ${fmt(s.hWide * 1e3)} mm.`,
      comment:
        `This is of the same order as the height of the pore system (${fmt(height * 1e3)} mm), so gravity can no longer be neglected. ` +
        'The wide subunit cannot be held full and drains with practically no applied pressure, so the first drainage step (at the old $p_c$ of iii) disappears.',
    },
    {
      id: 'd',
      prompt:
        'The ii subunits are now interconnected by capillaries with the same radius $r_{ii}$: I-ii ↔ II-ii ↔ III-ii, and III-ii branches to IV-middle (i) and IV-bottom (ii). How does the drainage behaviour change compared with (b)? Assume the interconnection volumes are negligible.',
      fields: s.linked.drainage.map((q, k) => ({ label: cols[k], value: q.S, unit: '', tol: sTol, official: off(OFF_D[k]) })),
      table: { corner: 'Δp / bar', rows: ['S, drainage'], cols },
      steps: [
        { text: `At Δp ${cols[2]} bar gas reaches the ii subunits through I-ii and the interconnections, so II-ii, III-ii and, behind them, II-iii and IV-bottom ii drain too.` },
        { text: 'II-top i, III-top i and IV-middle i are now surrounded by empty subunits: their liquid has lost its path to the membrane.' },
        { text: `At Δp ${cols[3]} bar only the bottom i subunits of I and III drain; the three cut-off i subunits stay filled (residual saturation 3 × ${vols[0]} / ${fmt(colVol.reduce((a, b) => a + b), 4)}).` },
      ],
      answer: `S (drainage) = ${s.linked.drainage.map((q) => fmt(q.S, 2)).join(', ')} for Δp ${cols.join(', ')} bar.`,
      comment: `Most of the pore volume now drains at the ii step, but three i subunits are cut off and stay filled, so a residual saturation of ≈ ${fmt(s.linked.drainage[3].S, 2)} remains.`,
    },
  ]
}

// ---------------------------------------------------------------------------------------------------------------
// Exercise 1.4: optical humidity sensor (Kelvin)
// ---------------------------------------------------------------------------------------------------------------

export interface Ex14 {
  /** Highest relative humidity to measure (0–1). */
  rhMax: number
  /** Temperature range, °C. */
  tLow: number
  tHigh: number
  /** Smallest pore diameter that can be made, m. */
  dMin: number
}

export const EX14: Ex14 = { rhMax: 0.9, tLow: -10, tHigh: 40, dMin: 2.5e-9 }

export function solve14(p: Ex14) {
  const temps = [p.tLow, p.tHigh].map((t) => t + KELVIN_0)
  const d = temps.map((T) => 2 * kelvinPoreRadius(p.rhMax, gammaWater(T), T)) // m
  const rh = temps.map((T) => poreKelvinRatio(gammaWater(T), p.dMin / 2, 0, T))
  return { temps, gamma: temps.map(gammaWater), d, dLargest: Math.min(...d), rh, rhMin: Math.max(...rh) }
}

export const randomize14 = (rng: Rng): Ex14 => ({
  rhMax: pick(rng, [0.8, 0.85, 0.9, 0.95]),
  tLow: pick(rng, [-20, -10, 0, 5]),
  tHigh: pick(rng, [30, 40, 50, 60]),
  dMin: pick(rng, [2, 2.5, 3, 4]) * 1e-9,
})

export function parts14(p: Ex14, official: boolean): Part[] {
  const s = solve14(p)
  const [tl, th] = [p.tLow, p.tHigh]
  const binding = s.d[0] < s.d[1] ? tl : th
  const other = s.d[0] < s.d[1] ? th : tl
  const kelvinStep = (T: number, g: number, rhs: string) =>
    `T = ${fmtTex(T, 5)}\\ \\mathrm{K}:\\ \\gamma = ${fmtTex(g * 1e3)}\\ \\mathrm{mN/m},\\ ${rhs}`
  return [
    {
      id: 'a',
      prompt: 'Explain why, at a certain relative humidity and temperature, water condenses in small pores but not large ones. (Hint: a concave air–water interface corresponds to a negative radius of curvature in the Kelvin equation.)',
      answer:
        'Above a concave meniscus the radius in the Kelvin equation is negative, so the equilibrium vapour pressure is lowered, $p < p_0$, and more so the smaller the pore. Small pores therefore fill with water (capillary condensation) at a relative humidity where large pores stay empty.',
      choice: {
        question: 'Which pores fill first as the humidity rises?',
        options: [
          'The smallest ones: their concave meniscus has the most negative radius, so condensation starts at the lowest p/p₀.',
          'The largest ones: they hold the most water.',
          'All pores fill at p/p₀ = 1, whatever their size.',
          'Only pores with a hydrophobic inner surface.',
        ],
        answer: 0,
      },
    },
    {
      id: 'b',
      prompt: `The sensor should measure relative humidities up to ${fmt(p.rhMax * 100)} % over ${tl} °C to ${th} °C. Determine the diameter of the largest pore needed.`,
      fields: [{ label: '$d$', value: s.dLargest * 1e9, unit: 'nm', tol: REL3, official: official ? '≈ 18 nm (18.2 nm)' : undefined }],
      steps: [
        { text: 'Kelvin with a hemispherical meniscus of radius $r = -r_\\text{pore}$ (wetting pore) and RH = $p/p_0$:', tex: String.raw`\ln(\mathrm{RH}) = -\frac{2V_m\gamma(T)}{RTr_\text{pore}} \;\Rightarrow\; r_\text{pore} = -\frac{2V_m\gamma(T)}{RT\ln(\mathrm{RH})}` },
        { text: `γ(T) = 121.5 − 0.1662·T mN/m; $V_m$ = 18 cm³/mol; R = 8.3145 J K⁻¹ mol⁻¹; ln(${p.rhMax}) = ${Math.log(p.rhMax).toFixed(4)}.` },
        ...s.temps.map((T, k) => ({ text: `At ${[tl, th][k]} °C:`, tex: kelvinStep(T, s.gamma[k], `d = 2r_\\text{pore} = ${fmtTex(s.d[k] * 1e9)}\\ \\mathrm{nm}`) })),
        { text: `A pore of diameter d fills at RH = ${fmt(p.rhMax * 100)} % only if it is no larger than these values at every temperature, so the smaller one, at ${binding} °C, is binding.` },
      ],
      answer: `$d$ ≈ ${fmt(s.dLargest * 1e9)} nm.`,
      comment: `It is set by ${binding} °C (d = ${fmt(s.dLargest * 1e9)} nm); at ${other} °C a ${fmt(Math.max(...s.d) * 1e9)} nm pore would suffice.`,
    },
    {
      id: 'c',
      prompt: `The fabrication technique cannot make pores smaller than ${fmt(p.dMin * 1e9)} nm in diameter. What is the minimum relative humidity that can be measured at all temperatures from ${tl} °C to ${th} °C?`,
      fields: [{ label: 'RH$_\\text{min}$', value: s.rhMin * 100, unit: '%', tol: REL3, official: official ? '≈ 46 %' : undefined }],
      steps: [
        { text: `Smallest pore radius $r_\\text{pore}$ = ${fmt(p.dMin * 1e9 / 2)} nm. Evaluate the filling RH at both temperature limits:`, tex: String.raw`\mathrm{RH} = \exp\left(-\frac{2V_m\gamma(T)}{RTr_\text{pore}}\right)` },
        ...s.temps.map((T, k) => ({ text: `At ${[tl, th][k]} °C:`, tex: kelvinStep(T, s.gamma[k], `\\mathrm{RH} = ${fmtTex(s.rh[k] * 100)}\\ \\%`) })),
        { text: 'The smallest pores must still be empty below the RH to be detected at every temperature, so the larger of the two values is the minimum measurable RH.' },
      ],
      answer: `RH$_\\text{min}$ ≈ ${fmt(s.rhMin * 100, 2)} %.`,
      comment: `The ${fmt(p.dMin * 1e9)} nm pores fill at ${fmt(s.rh[0] * 100, 2)} % RH at ${tl} °C and ${fmt(s.rh[1] * 100, 2)} % at ${th} °C.`,
    },
  ]
}
