import { capillaryPressure } from '../../lib/capillary'
import { fmtTex } from '../../lib/training'
import { youngFromTensions } from '../../lib/wetting'
import type { ExamTopic } from './types'

// Exam practice, Liquid Interfaces: from the course's specimen exam (Introduction to Interface Engineering), Task 1 in
// full and Task 2 (a), (b), (f). The model solutions are written for this site and are not official answers.

const RAD = Math.PI / 180

// ---------- Task 1 numbers (650 °C) ----------
export const T1 = { gLG: 0.205, gSG: 1.05, gSL: 0.907, deltaRough: 22, fallback: 50, dPore: 5e-6, dpFuel: 1e5 }

/** (a) Young: cos δ = (γ_sg − γ_sl)/γ_lg. */
export const t1Delta = youngFromTensions(T1.gSG, T1.gSL, T1.gLG).delta
/** (c) Wenzel rearranged: A_r = cos δ_rough / cos δ_smooth. */
export const t1Ar = (deltaSmooth: number) => Math.cos(T1.deltaRough * RAD) / Math.cos(deltaSmooth * RAD)
/** (d) p_c = 2γ_lg cos δ / r_c with r_c = d/2, Pa. */
export const t1Pc = (delta: number) => capillaryPressure(T1.gLG, delta, T1.dPore / 2)
/** (e) Widest pore that still fills at Δp: d = 4γ_lg cos δ / Δp, m. */
export const t1Dcrit = (delta: number) => (4 * T1.gLG * Math.cos(delta * RAD)) / T1.dpFuel

const versions = [
  { title: 'With δ from (a)', delta: t1Delta, show: t1Delta.toFixed(1) },
  { title: 'With the fallback δ = 50°', delta: T1.fallback, show: '50' },
]
const bar = (pa: number) => pa / 1e5

export const LIQUID_INTERFACES_EXAM: ExamTopic = {
  id: 'liquid-interfaces',
  topic: 'Liquid Interfaces',
  title: 'Liquid Interfaces',
  source: 'Specimen exam, Introduction to Interface Engineering: Task 1 and Task 2 (a), (b), (f)',
  tasks: [
    {
      id: 'task1',
      title: 'Task 1: Liquid Interfaces: Wetting',
      intro: [
        'Molten carbonate fuel cells typically comprise a porous nickel anode which regulates contact between the current collector/catalyst (Ni), the fuel (H₂) and the molten electrolyte (contains CO₃²⁻ ions). The figure shows a simplified diagram of the anode arrangement. It is essential to understand the wetting and penetration of the electrolyte into the anode in order to optimize the function of the fuel cell.',
      ],
      figure: 'mcfc',
      data: [
        { quantity: 'Electrolyte surface tension', value: '0.205 N/m' },
        { quantity: 'Nickel/gas interfacial energy', value: '1.05 J/m²' },
        { quantity: 'Nickel/electrolyte interfacial energy', value: '0.907 J/m²' },
      ],
      note: 'All values apply at the operating temperature of 650 °C. You may ignore the effects of gravity for this task.',
      parts: [
        {
          id: 'a',
          points: 2,
          prompt:
            "Write down Young's equation and use it to determine the contact angle of a sessile drop of electrolyte on a smooth, non-porous nickel substrate at 650 °C.",
          numeric: { symbol: '$\\delta$', unit: '°', accept: [{ value: t1Delta, label: `${t1Delta.toFixed(1)}°` }] },
          solution: [
            {
              steps: [
                { text: 'Young’s equation:', tex: String.raw`\cos\delta = \frac{\gamma_{sg} - \gamma_{sl}}{\gamma_{lg}}` },
                {
                  text: 'With $\\gamma_{sg}$ = 1.05 J/m², $\\gamma_{sl}$ = 0.907 J/m², $\\gamma_{lg}$ = 0.205 N/m:',
                  tex: `\\cos\\delta = \\frac{1.05 - 0.907}{0.205} = ${fmtTex(Math.cos(t1Delta * RAD))} \\;\\Rightarrow\\; \\delta \\approx ${t1Delta.toFixed(1)}^\\circ`,
                },
              ],
            },
          ],
          model: `cos δ = (γ_sg − γ_sl)/γ_lg = (1.05 − 0.907)/0.205 = 0.698, so δ ≈ ${t1Delta.toFixed(1)}°.`,
          marking: [
            { label: "Young's equation written correctly", points: 1 },
            { label: 'δ ≈ 46°', points: 1, auto: true },
          ],
        },
        {
          id: 'b',
          points: 4,
          prompt:
            'Name and provide sketches for the two wetting scenarios you are familiar with for rough surfaces. Write down the equation for the apparent contact angle for each and define all the terms.',
          solution: [
            {
              title: 'Wenzel',
              steps: [
                { text: 'The liquid completely penetrates the roughness (sketch: drop with liquid filling the grooves).' },
                { text: '', tex: String.raw`\cos\delta_\text{rough} = A_r\cos\delta_\text{smooth},\qquad A_r = \frac{A_\text{true}}{A_\text{proj}} \ge 1` },
                { text: '$A_r$: ratio of true surface area to projected surface area of the rough surface.' },
              ],
            },
            {
              title: 'Cassie–Baxter',
              steps: [
                { text: 'Partial penetration: gas stays trapped under the drop, which sits on the tops of the roughness (sketch: drop on pillar tops).' },
                {
                  text: '',
                  tex: String.raw`\cos\delta_\text{rough} = f_\text{solid}(\cos\delta_\text{smooth} + 1) - 1,\qquad f_\text{solid} = \frac{A_\text{proj, solid}}{A_\text{proj, solid} + A_\text{proj, gas}}`,
                },
                { text: '$f_\\text{solid}$: solid fraction of the projected area under the drop.' },
              ],
            },
            {
              steps: [{ text: 'In both: $\\delta_\\text{smooth}$ is the Young angle on the smooth surface, $\\delta_\\text{rough}$ the apparent angle on the rough surface.' }],
            },
          ],
          model:
            'Wenzel: liquid fills the roughness; cos δ_rough = A_r cos δ_smooth, A_r = A_true/A_proj ≥ 1. Cassie–Baxter: gas trapped under the drop; cos δ_rough = f_solid(cos δ_smooth + 1) − 1, f_solid = A_proj,solid/(A_proj,solid + A_proj,gas). δ_smooth: Young angle on the smooth surface; δ_rough: apparent angle.',
          marking: [
            { label: 'Wenzel: name + sketch (liquid in the grooves)', points: 1 },
            { label: 'Wenzel: equation with A_r (and the angles) defined', points: 1 },
            { label: 'Cassie–Baxter: name + sketch (gas trapped under the drop)', points: 1 },
            { label: 'Cassie–Baxter: equation with f_solid (and the angles) defined', points: 1 },
          ],
          extra: 'wetting-sketches',
        },
        {
          id: 'c',
          points: 2,
          prompt:
            'For sessile drops of molten electrolyte on a rough, non-porous nickel substrate, the lowest contact angle you are able to measure is 22°. Which wetting scenario from (b) does this correspond to? Rearrange the appropriate equation from (b) and so determine a measure of the roughness of the substrate. If you were unable to solve part (a), take the contact angle on a smooth nickel substrate to be 50°.',
          numeric: {
            symbol: '$A_r$',
            unit: '',
            accept: [
              { value: t1Ar(t1Delta), label: `${t1Ar(t1Delta).toFixed(2)} (with δ from (a))` },
              { value: t1Ar(T1.fallback), label: `${t1Ar(T1.fallback).toFixed(2)} (with 50°)` },
            ],
          },
          solution: [
            {
              steps: [
                {
                  text: `$\\delta_\\text{rough}$ = 22° is below $\\delta_\\text{smooth}$ (${t1Delta.toFixed(1)}°, or 50°), and both are below 90°: roughness amplifies wetting, so this is the **Wenzel** state. Cassie–Baxter can only raise the angle.`,
                },
                { text: 'Rearrange Wenzel:', tex: String.raw`A_r = \frac{\cos\delta_\text{rough}}{\cos\delta_\text{smooth}}` },
              ],
            },
            ...versions.map((v) => ({
              title: v.title,
              steps: [{ text: '', tex: `A_r = \\frac{\\cos 22^\\circ}{\\cos ${v.show}^\\circ} = \\frac{${Math.cos(22 * RAD).toFixed(3)}}{${Math.cos(v.delta * RAD).toFixed(3)}} = ${t1Ar(v.delta).toFixed(2)}` }],
            })),
          ],
          model: `Wenzel (δ_rough < δ_smooth < 90°: roughness amplifies wetting). A_r = cos 22°/cos δ_smooth = ${t1Ar(t1Delta).toFixed(2)} (or ${t1Ar(T1.fallback).toFixed(2)} with 50°).`,
          marking: [
            { label: 'Wenzel, with the reason (angle lowered below the smooth angle)', points: 1 },
            { label: 'A_r ≈ 1.33 (or 1.44 with 50°)', points: 1, auto: true },
          ],
        },
        {
          id: 'd',
          points: 2,
          prompt:
            'You find a porous nickel fuel cell anode to have a broad range of pore diameters with an average diameter of 5 µm. What capillary pressure does this correspond to? Use the contact angle you determined in (a), or, if you were unable to solve that part, take 50°.',
          numeric: {
            symbol: '$p_c$',
            unit: 'bar',
            accept: [
              { value: bar(t1Pc(t1Delta)), label: `${bar(t1Pc(t1Delta)).toFixed(2)} bar (with δ from (a))` },
              { value: bar(t1Pc(T1.fallback)), label: `${bar(t1Pc(T1.fallback)).toFixed(2)} bar (with 50°)` },
            ],
          },
          solution: [
            {
              steps: [
                { text: 'Capillary pressure of a cylindrical pore, with the radius $r_c$ = d/2 = 2.5 µm:', tex: String.raw`p_c = \frac{2\gamma_{lg}\cos\delta}{r_c}` },
              ],
            },
            ...versions.map((v) => ({
              title: v.title,
              steps: [
                {
                  text: '',
                  tex: `p_c = \\frac{2 \\times 0.205 \\times \\cos ${v.show}^\\circ}{2.5 \\times 10^{-6}}\\ \\mathrm{Pa} = ${fmtTex(t1Pc(v.delta))}\\ \\mathrm{Pa} \\approx ${bar(t1Pc(v.delta)).toFixed(2)}\\ \\mathrm{bar}`,
                },
              ],
            })),
          ],
          model: `p_c = 2γ_lg cos δ / r_c with r_c = 2.5 µm: ${bar(t1Pc(t1Delta)).toFixed(2)} bar (or ${bar(t1Pc(T1.fallback)).toFixed(2)} bar with 50°).`,
          pitfall: 'Using the diameter d instead of the radius r_c gives half the value.',
          marking: [
            { label: 'Correct equation, using the radius (not the diameter)', points: 1 },
            { label: 'p_c ≈ 1.14 bar (or 1.05 bar with 50°)', points: 1, auto: true },
          ],
        },
        {
          id: 'e',
          points: 1,
          prompt:
            'The H₂ fuel is supplied at a pressure 1 bar higher than the electrolyte reservoir. State whether the capillary pressure you calculated in (d) is sufficient for the electrolyte to penetrate the porous structure. If you think this will not happen, suggest what can be done to achieve it. Alternatively, if you think it will happen, comment on why the electrolyte will be unlikely to fully fill the anode.',
          solution: [
            {
              steps: [
                { text: `$p_c$ ≈ ${bar(t1Pc(t1Delta)).toFixed(2)} bar (or ${bar(t1Pc(T1.fallback)).toFixed(2)} bar) > 1 bar, so the electrolyte **does penetrate** the anode.` },
                {
                  text: 'It will not fill the whole anode, because the pore-size distribution is broad and $p_c \\propto 1/r_c$. Pores wider than',
                  tex: `d = \\frac{4\\gamma_{lg}\\cos\\delta}{\\Delta p} = \\frac{4 \\times 0.205 \\times ${Math.cos(t1Delta * RAD).toFixed(3)}}{10^5}\\ \\mathrm{m} \\approx ${(t1Dcrit(t1Delta) * 1e6).toFixed(1)}\\ \\mu\\mathrm{m}\\quad (${(t1Dcrit(T1.fallback) * 1e6).toFixed(1)}\\ \\mu\\mathrm{m}\\ \\text{with}\\ 50^\\circ)`,
                },
                { text: 'have $p_c$ < 1 bar and stay gas-filled. This is also what the cell needs: gas, electrolyte and Ni must all meet (the three-phase boundary). Contact-angle hysteresis and trapped gas can also leave pores unfilled.' },
              ],
            },
          ],
          model: `Yes: p_c ≈ ${bar(t1Pc(t1Delta)).toFixed(2)} bar > 1 bar, so it penetrates. Not fully: the pore-size distribution is broad and pores wider than ≈ ${(t1Dcrit(t1Delta) * 1e6).toFixed(1)} µm have p_c < 1 bar and stay gas-filled (needed for the three-phase boundary); hysteresis and trapped gas add to this.`,
          marking: [
            { label: 'Penetrates, because p_c > Δp = 1 bar', points: 0.5 },
            { label: 'Not fully: broad pore-size distribution, the large pores stay empty', points: 0.5 },
          ],
          extra: 'pore-slider',
        },
      ],
    },
    {
      id: 'task2',
      title: 'Task 2: Liquid and Solid Interfaces: Surfactants and Adsorption',
      intro: [
        'In an electrolyser, water is split into hydrogen and oxygen at the cathode and anode respectively. In order to regulate the size of gas bubbles, non-ionic surfactants are added to the electrolyte. The surfactant molecules adsorb to the electrodes, lowering their interfacial energy.',
      ],
      omitted: 'Parts (c)–(e) are Solid Interfaces (Langmuir adsorption) and are not included here.',
      parts: [
        {
          id: 'a',
          points: 2,
          prompt: 'Explain with a sketch why surfactants are often referred to as amphiphilic molecules.',
          solution: [
            {
              steps: [
                { text: 'A surfactant has a **hydrophilic head** (“loves water”) and a **hydrophobic tail** (“hates water”) in one molecule, so it has an affinity for both phases: it is amphiphilic.' },
                { text: 'At a water–air or water–oil interface it orients with its head in the water and its tail out of it. Sketch: a head circle with a tail line, molecules lined up at the interface.' },
              ],
            },
          ],
          model:
            'One molecule with a hydrophilic head and a hydrophobic tail, so it likes both phases. At the water–air (or water–oil) interface the head sits in the water and the tail points out of it.',
          marking: [
            { label: 'Hydrophilic head + hydrophobic tail in one molecule', points: 1 },
            { label: 'Sketch with the orientation at the interface (head in water)', points: 1 },
          ],
          extra: 'orient',
        },
        {
          id: 'b',
          points: 1,
          prompt: 'State the main difference between a non-ionic surfactant and one other general class of surfactant.',
          solution: [
            {
              steps: [
                { text: 'A non-ionic surfactant’s head group carries **no charge** (e.g. Pluronic).' },
                { text: 'An anionic surfactant’s head is negatively charged (e.g. SDS); a cationic surfactant’s head is positively charged (e.g. CTAB); a zwitterionic head carries both charges (e.g. phospholipids such as POPC).' },
              ],
            },
          ],
          model: 'Non-ionic: uncharged head (e.g. Pluronic). Anionic: negative head (SDS); cationic: positive head (CTAB); zwitterionic: both charges (phospholipids).',
          marking: [{ label: 'Any one correct contrast of head-group charge', points: 1 }],
        },
        {
          id: 'f',
          points: 1,
          prompt:
            'What typical behaviour of surfactants in solution may start to interfere with adsorption on an electrode surface if the concentration is increased significantly further? Name one parameter you could measure to find the concentration at which this behaviour starts.',
          solution: [
            {
              steps: [
                { text: '**Micelle formation** above the **critical micelle concentration (CMC)**: extra surfactant forms micelles in the bulk instead of adsorbing.' },
                { text: 'Measure the **surface tension** against concentration: it stops falling and levels off at the CMC. Turbidity or osmotic pressure also change at the CMC.' },
                { text: 'Note: conductivity works for ionic surfactants but **not** for this non-ionic one.' },
              ],
            },
          ],
          model: 'Micelle formation above the CMC. Measure the surface tension against concentration (it levels off at the CMC); turbidity or osmotic pressure also work. Not conductivity: the surfactant is non-ionic.',
          pitfall: 'Conductivity shows the CMC only for ionic surfactants.',
          marking: [
            { label: 'Micelles / CMC', points: 0.5 },
            { label: 'A suitable measurable parameter (γ, turbidity, osmotic pressure; not conductivity)', points: 0.5 },
          ],
        },
      ],
    },
  ],
}
