// Surfactants and micelle formation: every equation and constant used by the CMC simulator.
//
// Units used throughout: concentrations in mol/L (M) unless a name says otherwise, surface tension in N/m,
// surface excess Γ in mol/m², temperature in K. The page converts to mM, mN/m, µmol/m² and nm² for display.
//
// Model in one paragraph: the surfactant is a "pseudo-phase". Below the CMC every molecule is a free monomer;
// above it the free monomer concentration stays at the CMC and the rest forms micelles. Everything that depends
// on free monomers (surface tension, surface excess, osmotic pressure) therefore stops changing at the CMC,
// while everything that sees the micelles (turbidity, the slower average diffusion) starts changing there.
//
// Values marked ESTIMATED are reasonable textbook-order numbers chosen for the simulation, not taken from a
// single measured source. Check them against the course materials.

export type HeadType = 'anionic' | 'cationic' | 'nonionic' | 'zwitterionic'
export type SurfactantId = 'sds' | 'ctab' | 'tween20' | 'betaine' | 'custom'

export const isIonic = (h: HeadType) => h === 'anionic' || h === 'cationic'

// ---------------------------------------------------------------------------------------------------------------
// Physical constants and conditions
// ---------------------------------------------------------------------------------------------------------------

export const R_GAS = 8.314 // J/(mol·K), gas constant (CODATA 8.314 462 618)
export const N_A = 6.02214076e23 // 1/mol, Avogadro constant (SI exact)
export const T = 298.15 // K, 25 °C: all CMC values below are for 25 °C
export const GAMMA_0 = 0.0720 // N/m, surface tension of pure water at 25 °C (71.97 mN/m, CRC Handbook)

// ---------------------------------------------------------------------------------------------------------------
// Head-group classes: the parameters a "Custom" surfactant inherits from its head type
// ---------------------------------------------------------------------------------------------------------------

export interface HeadParams {
  /** Klevens slope B in log10(CMC / M) = A − B·n. */
  klevensB: number
  /** Klevens intercept A, anchored so the reference surfactant of the class lands on its measured CMC. */
  klevensA: number
  /** Surface tension at (and above) the CMC, N/m. Kept the same for every tail length of the class. */
  gammaCmc: number
  /** Saturated surface excess Γmax, mol/m². Kept the same for every tail length of the class. */
  gammaMax: number
  /** Corrin–Harkins slope b (ionic only): log10(CMC) = a − b·log10(CMC + c_salt). */
  corrinB: number
  /** Conductivity slopes below / above the CMC, in mS·cm⁻¹ per mM of surfactant (ionic only). */
  condBelow: number
  condAbove: number
}

// Klevens intercepts are anchored on the reference surfactants:
//   anionic:      SDS, n = 12, CMC 8.2 mM  → A = log10(8.2e-3) + 0.30·12 = 1.51  (Klevens 1953 gives A = 1.51 for
//                 sodium alkyl sulfates, so the anchor and the literature agree)
//   cationic:     CTAB, n = 16, CMC 0.92 mM → A = log10(9.2e-4) + 0.30·16 = 1.76  (Klevens: 1.72 for alkyltrimethyl-
//                 ammonium bromides)
//   non-ionic:    Tween 20, n = 12 (laurate tail), CMC 0.06 mM → A = log10(6e-5) + 0.50·12 = 1.78
//                 ESTIMATED: Tween's head is a large polyoxyethylene sorbitan group, so a Klevens line through it
//                 is only a rough guide for other non-ionic tail lengths.
//   zwitterionic: dodecyl dimethyl betaine (C12 betaine), n = 12, CMC 1.8 mM → A = log10(1.8e-3) + 0.50·12 = 3.26
//                 ESTIMATED: B = 0.5 (net-neutral head, so treated like a non-ionic; Rosen lists ~0.47–0.5).
const klevensA = (cmc: number, n: number, B: number) => Math.log10(cmc) + B * n

export const HEADS: Record<HeadType, HeadParams> = {
  anionic: {
    klevensB: 0.3, // typical ionic value (Klevens 1953; Rosen, "Surfactants and Interfacial Phenomena")
    klevensA: klevensA(8.2e-3, 12, 0.3),
    gammaCmc: 0.039, // SDS γ at the CMC ≈ 38–40 mN/m
    gammaMax: 3.2e-6, // SDS Γmax ≈ 3.2 µmol/m² → ≈ 0.52 nm² per molecule (Gibbs, n = 2); literature 0.45–0.55 nm²
    corrinB: 0.66, // SDS + NaCl: CMC ≈ 1.6 mM at 0.1 M NaCl; slope 0.6–0.7 reported (≈ degree of counterion binding)
    condBelow: 0.072, // ≈ Λ°(Na⁺) + Λ°(DS⁻) ≈ 50 + 22 S·cm²/mol → 0.072 mS·cm⁻¹/mM
    condAbove: 0.026, // ESTIMATED to give β ≈ 0.64 (literature β for SDS ≈ 0.6–0.7)
  },
  cationic: {
    klevensB: 0.3,
    klevensA: klevensA(9.2e-4, 16, 0.3),
    gammaCmc: 0.036, // CTAB γ at the CMC ≈ 36–37 mN/m
    gammaMax: 2.8e-6, // ≈ 0.59 nm² per molecule; literature for CTAB ≈ 0.55–0.65 nm²
    corrinB: 0.6, // ESTIMATED for CTAB + NaCl (values 0.6–0.8 are reported, higher with KBr)
    condBelow: 0.098, // ≈ Λ°(Br⁻) + Λ°(CTA⁺) ≈ 78 + 20 S·cm²/mol
    condAbove: 0.025, // ESTIMATED to give β ≈ 0.74 (literature β for CTAB ≈ 0.7–0.8)
  },
  nonionic: {
    klevensB: 0.5, // typical non-ionic value (Klevens 1953; Rosen)
    klevensA: klevensA(6e-5, 12, 0.5),
    gammaCmc: 0.036, // Tween 20 γ at the CMC ≈ 36–38 mN/m
    gammaMax: 1.5e-6, // ESTIMATED: ≈ 1.1 nm² per molecule; literature for Tween 20 spans ~0.9–1.5 nm²
    corrinB: 0, // not used: no counterions
    condBelow: 0,
    condAbove: 0,
  },
  zwitterionic: {
    klevensB: 0.5, // ESTIMATED (see above)
    klevensA: klevensA(1.8e-3, 12, 0.5),
    gammaCmc: 0.035, // ESTIMATED for C12 betaine (≈ 33–36 mN/m reported)
    gammaMax: 3.0e-6, // ESTIMATED: ≈ 0.55 nm² per molecule
    corrinB: 0, // not used: the head carries both charges, so salt is not modelled
    condBelow: 0,
    condAbove: 0,
  },
}

// ---------------------------------------------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------------------------------------------

export interface Surfactant {
  id: SurfactantId
  name: string
  /** Full chemical name shown under the dropdown. */
  chem: string
  head: HeadType
  /** Carbons in the hydrophobic tail. */
  tail: number
}

export const PRESETS: Surfactant[] = [
  { id: 'sds', name: 'SDS', chem: 'Sodium dodecyl sulfate, C₁₂H₂₅OSO₃⁻ Na⁺', head: 'anionic', tail: 12 },
  { id: 'ctab', name: 'CTAB', chem: 'Cetyltrimethylammonium bromide, C₁₆H₃₃N(CH₃)₃⁺ Br⁻', head: 'cationic', tail: 16 },
  { id: 'tween20', name: 'Tween 20', chem: 'Polysorbate 20 (polyoxyethylene sorbitan monolaurate), C₁₂ tail', head: 'nonionic', tail: 12 },
  { id: 'betaine', name: 'C12 betaine', chem: 'Dodecyl dimethyl betaine, C₁₂H₂₅N⁺(CH₃)₂CH₂COO⁻', head: 'zwitterionic', tail: 12 },
]

export const TAIL_RANGE: [number, number] = [8, 16]
export const SALT_MAX = 0.2 // M NaCl, top of the salt slider
/** Concentration axis and slider range, M: wide enough to reach well below and above every preset's CMC. */
export const C_RANGE: [number, number] = [1e-7, 1]

/** Aggregation number used only for the qualitative osmotic-pressure curve. ESTIMATED (SDS ≈ 60, CTAB ≈ 90). */
export const N_AGG = 60
/** Micelle / monomer self-diffusion ratio for the qualitative D curve. ESTIMATED (≈ monomer size / micelle size). */
export const D_MICELLE_RATIO = 0.15

// ---------------------------------------------------------------------------------------------------------------
// CMC: Klevens (tail length) and Corrin–Harkins (salt)
// ---------------------------------------------------------------------------------------------------------------

/** Klevens: log10(CMC₀) = A − B·n. CMC without added salt, in M. */
export function cmcNoSalt(head: HeadType, tail: number): number {
  const p = HEADS[head]
  return 10 ** (p.klevensA - p.klevensB * tail)
}

/**
 * Corrin–Harkins: log10(CMC) = a − b·log10(CMC + c_salt), solved for CMC by bisection.
 * The counterions the surfactant brings itself (≈ CMC) count as well as the added salt, which is why CMC appears
 * on both sides. a is fixed by requiring the zero-salt CMC from Klevens: a = (1 + b)·log10(CMC₀).
 * Non-ionic and zwitterionic surfactants ignore salt (their CMC barely moves with NaCl).
 */
export function cmc(head: HeadType, tail: number, salt: number): number {
  const c0 = cmcNoSalt(head, tail)
  const b = HEADS[head].corrinB
  if (!isIonic(head) || salt <= 0 || b === 0) return c0
  const a = (1 + b) * Math.log10(c0)
  const f = (x: number) => Math.log10(x) + b * Math.log10(x + salt) - a // increasing in x; root is the CMC
  let lo = Math.log10(c0) - 8
  let hi = Math.log10(c0) // salt can only lower the CMC
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (f(10 ** mid) > 0) hi = mid
    else lo = mid
  }
  return 10 ** ((lo + hi) / 2)
}

/** Pseudo-phase model: free monomer concentration, M. */
export const freeMonomer = (c: number, cmcV: number) => Math.min(c, cmcV)

// ---------------------------------------------------------------------------------------------------------------
// Surface tension, surface excess and area per molecule
// ---------------------------------------------------------------------------------------------------------------

/**
 * Gibbs prefactor n in Γ = −(1/nRT)·dγ/dln c: 2 for a 1:1 ionic surfactant without salt (surfactant ion and
 * counterion both adsorb/accumulate), falling to 1 in excess salt. The standard interpolation
 * n = 1 + c/(c + c_salt) is evaluated at the CMC, so each curve uses one n.
 */
export function gibbsN(head: HeadType, cmcV: number, salt: number): number {
  return isIonic(head) ? 1 + cmcV / (cmcV + salt) : 1
}

/**
 * Szyszkowski adsorption constant K (1/M), chosen so the curve reaches the class's γ_CMC exactly at the CMC:
 * γ_CMC = γ₀ − n·R·T·Γmax·ln(1 + K·CMC). This keeps γ continuous at the CMC whatever the tail, head or salt.
 */
export function szyszkowskiK(head: HeadType, cmcV: number, n: number): number {
  const p = HEADS[head]
  return (Math.exp((GAMMA_0 - p.gammaCmc) / (n * R_GAS * T * p.gammaMax)) - 1) / cmcV
}

export interface System {
  head: HeadType
  tail: number
  salt: number // M NaCl (ignored for non-ionic and zwitterionic)
  cmc: number // M
  n: number // Gibbs prefactor
  K: number // Szyszkowski constant, 1/M
  gammaMax: number // mol/m²
}

export function makeSystem(head: HeadType, tail: number, salt: number): System {
  const s = isIonic(head) ? salt : 0
  const cmcV = cmc(head, tail, s)
  const n = gibbsN(head, cmcV, s)
  return { head, tail, salt: s, cmc: cmcV, n, K: szyszkowskiK(head, cmcV, n), gammaMax: HEADS[head].gammaMax }
}

/** Szyszkowski: γ = γ₀ − n·R·T·Γmax·ln(1 + K·c_free), N/m. Constant above the CMC because c_free is. */
export function surfaceTension(sys: System, c: number): number {
  return GAMMA_0 - sys.n * R_GAS * T * sys.gammaMax * Math.log(1 + sys.K * freeMonomer(c, sys.cmc))
}

/** Langmuir adsorption that goes with Szyszkowski (via Gibbs): Γ = Γmax·K·c/(1 + K·c), mol/m². */
export function surfaceExcess(sys: System, c: number): number {
  const kc = sys.K * freeMonomer(c, sys.cmc)
  return (sys.gammaMax * kc) / (1 + kc)
}

/** Area per molecule A = 1/(Γ·N_A), in nm². With Γ = Γmax this is the minimum (closest-packed) area. */
export const areaPerMolecule = (gamma: number) => 1e18 / (gamma * N_A)

// ---------------------------------------------------------------------------------------------------------------
// Other properties
// ---------------------------------------------------------------------------------------------------------------

/**
 * Specific conductivity from the surfactant (salt background subtracted), mS/cm: two straight lines meeting at
 * the CMC. Above the CMC each added molecule joins a micelle that binds a fraction β of its counterions, so the
 * slope drops. Returns 0 for non-ionic and zwitterionic surfactants.
 */
export function conductivity(sys: System, c: number): number {
  const p = HEADS[sys.head]
  const mM = c * 1e3
  const cmcMM = sys.cmc * 1e3
  return mM <= cmcMM ? p.condBelow * mM : p.condBelow * cmcMM + p.condAbove * (mM - cmcMM)
}

/** Degree of counterion binding β = 1 − S_above/S_below (ionic only, else null). */
export function counterionBinding(head: HeadType): number | null {
  const p = HEADS[head]
  return isIonic(head) ? 1 - p.condAbove / p.condBelow : null
}

/**
 * QUALITATIVE osmotic pressure, relative to its value at the CMC. Π counts dissolved particles: below the CMC
 * every monomer (plus its counterion, for ionic surfactants) counts; above it a whole micelle of N_AGG molecules
 * counts as one particle, so Π almost stops rising. (Counterions released by micelles are ignored here.)
 */
export function osmoticRel(sys: System, c: number): number {
  const nu = isIonic(sys.head) ? 2 : 1
  const free = freeMonomer(c, sys.cmc)
  return (nu * free + (c - free) / N_AGG) / (nu * sys.cmc)
}

/** QUALITATIVE turbidity, relative units: micelles scatter light, monomers essentially do not. */
export function turbidityRel(sys: System, c: number): number {
  return Math.max(0, c - sys.cmc) / sys.cmc
}

/**
 * QUALITATIVE mean self-diffusion coefficient relative to the free monomer (two-state average, as measured by
 * NMR): D = [c_free·D_mono + (c − c_free)·D_micelle] / c.
 */
export function diffusionRel(sys: System, c: number): number {
  const free = freeMonomer(c, sys.cmc)
  return (free + (c - free) * D_MICELLE_RATIO) / c
}

/** Log-spaced concentrations across C_RANGE, with the CMC itself inserted so the kink is drawn sharply. */
export function concentrationGrid(cmcV: number, points = 240): number[] {
  const [lo, hi] = C_RANGE.map(Math.log10)
  const xs = Array.from({ length: points + 1 }, (_, i) => 10 ** (lo + ((hi - lo) * i) / points))
  if (cmcV > C_RANGE[0] && cmcV < C_RANGE[1]) {
    xs.push(cmcV)
    xs.sort((a, b) => a - b)
  }
  return xs
}
