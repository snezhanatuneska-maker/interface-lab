import { useState } from 'react'
import { Segmented, Slider } from '../../components/Controls'
import { capillaryPressure } from '../../lib/capillary'
import { T1, t1Delta } from '../../data/exam/liquidInterfaces'

// Figures and interactive extras of the exam page (#/exam/…), drawn as SVG in the site style.

/** Task 1: molten carbonate fuel cell anode. */
export function McfcFigure() {
  const dots: [number, number][] = []
  for (let x = 120; x < 430; x += 16) for (let y = 98; y < 150; y += 13) dots.push([x + ((y / 13) % 2) * 8, y])
  return (
    <svg viewBox="0 0 460 250" className="tensio-svg" role="img" aria-label="A horizontal porous nickel anode at 650 °C. Molten carbonate electrolyte above it, with CO₃²⁻ ions entering the anode; hydrogen fuel gas below it, entering from beneath; on the left an arrow labelled 2e⁻ carries the electrical current out of the anode.">
      <rect x="110" y="20" width="330" height="62" className="tensio-liquid" />
      <text x="275" y="40" textAnchor="middle" className="tensio-note">Molten carbonate electrolyte</text>
      <path d="M200 52 V100" className="tensio-arrow" markerEnd="url(#exam-arrow)" />
      <path d="M350 52 V100" className="tensio-arrow" markerEnd="url(#exam-arrow)" />
      <text x="210" y="66" className="tensio-label">CO₃²⁻</text>
      <text x="360" y="66" className="tensio-label">CO₃²⁻</text>
      <rect x="110" y="88" width="330" height="70" className="tensio-metal" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} className="exam-pore" />
      ))}
      <text x="275" y="174" textAnchor="middle" className="tensio-note">Porous nickel anode, 650 °C</text>
      <rect x="110" y="182" width="330" height="54" className="exam-gas" />
      <text x="275" y="228" textAnchor="middle" className="tensio-note">Fuel (Hydrogen gas)</text>
      <path d="M200 212 V164" className="tensio-arrow" markerEnd="url(#exam-arrow)" />
      <path d="M350 212 V164" className="tensio-arrow" markerEnd="url(#exam-arrow)" />
      <text x="210" y="204" className="tensio-label">H₂</text>
      <text x="360" y="204" className="tensio-label">H₂</text>
      <path d="M108 123 H30" className="tensio-arrow" markerEnd="url(#exam-arrow)" />
      <text x="60" y="114" textAnchor="middle" className="tensio-label">2e⁻</text>
      <text x="56" y="142" textAnchor="middle" className="tensio-note">Electrical</text>
      <text x="56" y="155" textAnchor="middle" className="tensio-note">current</text>
      <defs>
        <marker id="exam-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}

/** Task 1 (b): toggle between a Wenzel and a Cassie–Baxter sketch. */
export function WettingSketches() {
  const [which, setWhich] = useState<'wenzel' | 'cassie'>('wenzel')
  const xs = [30, 70, 110, 150, 190, 230, 270]
  return (
    <div className="exam-extra">
      <Segmented
        label="Sketch"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'wenzel', label: 'Wenzel' },
          { value: 'cassie', label: 'Cassie–Baxter' },
        ]}
      />
      <svg viewBox="0 0 300 140" className="exam-sketch" role="img" aria-label={which === 'wenzel' ? 'Wenzel: the drop fills the grooves of the rough surface.' : 'Cassie–Baxter: the drop sits on the pillar tops with gas trapped in the grooves.'}>
        <rect x="0" y="118" width="300" height="22" className="tensio-metal" />
        {which === 'wenzel' ? (
          <path d="M60 90 Q150 -10 240 90 Z" className="tensio-liquid" />
        ) : (
          <path d="M70 90 Q150 -30 230 90 Z" className="tensio-liquid" />
        )}
        {xs.map((x, i) => (
          <g key={x}>
            <rect x={x - 8} y={90} width={16} height={30} className="tensio-metal" />
            {i < xs.length - 1 && x + 8 >= (which === 'wenzel' ? 60 : 70) && x + 32 <= (which === 'wenzel' ? 240 : 230) && (
              <rect x={x + 8} y={90} width={24} height={which === 'wenzel' ? 28 : 0} className="tensio-liquid" />
            )}
          </g>
        ))}
        {which === 'cassie' && <text x="150" y="110" textAnchor="middle" className="tensio-note">gas trapped</text>}
        <text x="150" y="14" textAnchor="middle" className="tensio-note">
          {which === 'wenzel' ? 'liquid fills the grooves: cos δ_rough = A_r cos δ_smooth' : 'drop on the tops: cos δ_rough = f_solid(cos δ_smooth + 1) − 1'}
        </text>
      </svg>
    </div>
  )
}

/** Task 2 (a): orient three surfactant molecules at the water/air line. */
export function OrientExercise() {
  const [up, setUp] = useState([true, false, true]) // true: head up (in the air), the wrong way
  const done = up.every((u) => !u)
  return (
    <div className="exam-extra">
      <p className="note">Turn each molecule so that it sits correctly at the water/air interface.</p>
      <svg viewBox="0 0 300 150" className="exam-sketch" role="img" aria-label={`Three surfactant molecules at a water/air line; ${up.filter((u) => !u).length} of 3 have the head in the water.`}>
        <rect x="0" y="0" width="300" height="75" className="exam-air" />
        <rect x="0" y="75" width="300" height="75" className="tensio-liquid" />
        <line x1="0" x2="300" y1="75" y2="75" className="tensio-surface" />
        <text x="8" y="16" className="tensio-note">air</text>
        <text x="8" y="142" className="tensio-note">water</text>
        {up.map((u, i) => {
          const x = 70 + i * 80
          const head = u ? 52 : 92
          const tailEnd = u ? 100 : 40
          return (
            <g key={i}>
              <path d={`M${x} ${u ? head + 9 : head - 9} L${x} ${tailEnd}`} className="tail-line" />
              <circle cx={x} cy={head} r={9} className="head-fill neutral" />
            </g>
          )
        })}
      </svg>
      <div className="sim-buttons">
        {up.map((_, i) => (
          <button key={i} type="button" className="button" onClick={() => setUp(up.map((u, k) => (k === i ? !u : u)))}>
            Turn molecule {i + 1}
          </button>
        ))}
      </div>
      <p className={done ? 'state-ok' : 'note'} aria-live="polite">
        {done ? 'Correct: heads (hydrophilic) in the water, tails (hydrophobic) pointing into the air.' : 'Not yet: a head is still in the air.'}
      </p>
    </div>
  )
}

/** Task 1 (e): which pores does the electrolyte fill against 1 bar? */
export function PoreSlider() {
  const [dUm, setDUm] = useState(5)
  const pc = capillaryPressure(T1.gLG, t1Delta, (dUm * 1e-6) / 2) / 1e5
  const fills = pc > T1.dpFuel / 1e5
  const max = capillaryPressure(T1.gLG, t1Delta, 0.5e-6) / 1e5
  const W = 300
  const x = (v: number) => 20 + (v / Math.max(max, 1.2)) * (W - 40)
  return (
    <div className="exam-extra">
      <Slider id="exam-d" label={<>Pore diameter <em>d</em></>} value={`${dUm} µm`} min={1} max={15} step={0.5} pos={dUm} onChange={setDUm} />
      <svg viewBox={`0 0 ${W} 70`} className="exam-sketch" role="img" aria-label={`p_c = ${pc.toFixed(2)} bar against the 1 bar gas overpressure: the pore ${fills ? 'fills' : 'stays gas-filled'}.`}>
        <line x1={20} x2={W - 20} y1={40} y2={40} className="bar-grid" />
        <rect x={20} y={28} width={Math.max(0, x(pc) - 20)} height={24} className={fills ? 'bar-fill' : 'bar-metal'} />
        <line x1={x(1)} x2={x(1)} y1={14} y2={62} className="profile-gds" />
        <text x={x(1) + 4} y={14} className="bar-tick">1 bar (H₂ overpressure)</text>
      </svg>
      <p className={fills ? 'state-ok' : 'state-bad'} aria-live="polite">
        p<sub>c</sub> = {pc.toFixed(2)} bar → {fills ? 'electrolyte fills this pore' : 'stays gas-filled'} (δ = {t1Delta.toFixed(1)}°)
      </p>
    </div>
  )
}

export const EXTRAS: Record<string, () => React.JSX.Element> = {
  'wetting-sketches': WettingSketches,
  orient: OrientExercise,
  'pore-slider': PoreSlider,
}

export const FIGURES: Record<string, () => React.JSX.Element> = { mcfc: McfcFigure }
