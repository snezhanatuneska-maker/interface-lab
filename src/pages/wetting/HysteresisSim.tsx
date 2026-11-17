import { useState } from 'react'
import { Slider } from '../../components/Controls'
import { furmidgeForce, slidingAngle } from '../../lib/wetting'

// Tilt-the-drop: Furmidge retention force against the downhill pull of gravity.

const RAD = Math.PI / 180
const W = 420
const H = 240

/** A drop on a tilted plane: rear angle at the uphill contact, front angle downhill, drawn as one cubic curve. */
function TiltView({ alpha, front, rear, slides, label }: { alpha: number; front: number; rear: number; slides: boolean; label: string }) {
  const a = 70 // half base, px
  const L = 75
  const p0 = [-a, 0]
  const p3 = [a, 0]
  const p1 = [p0[0] + L * Math.cos(rear * RAD), -L * Math.sin(rear * RAD)]
  const p2 = [p3[0] - L * Math.cos(front * RAD), -L * Math.sin(front * RAD)]
  const d = `M${p0} C${p1} ${p2} ${p3} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="drop-svg">
      <rect width={W} height={H} className="drop-bg" />
      <g transform={`translate(${W / 2} ${H / 2 + 30}) rotate(${alpha})`}>
        <rect x={-220} y={0} width={440} height={40} className="drop-solid" />
        <line x1={-220} x2={220} y1={0} y2={0} className="drop-solid-edge" />
        <path d={d} className="drop-liquid" />
        <path d={d} className="drop-outline" />
        <text x={-a - 6} y={-10} textAnchor="end" className="drop-label">δ_r</text>
        <text x={a + 6} y={-10} className="drop-label">δ_a</text>
        {slides && <path d={`M${a + 30} 14 h50`} className="drop-tangent" markerEnd="url(#slide-arrow)" />}
      </g>
      <defs>
        <marker id="slide-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
      <text x={16} y={24} className="drop-label">
        tilt α = {alpha}°
      </text>
    </svg>
  )
}

export default function HysteresisSim() {
  const [deltaA, setDeltaA] = useState(110)
  const [deltaR, setDeltaR] = useState(90)
  const [wMm, setWMm] = useState(3)
  const [gLG, setGLG] = useState(72)
  const [vol, setVol] = useState(20) // µL
  const [alpha, setAlpha] = useState(10)

  const dr = Math.min(deltaR, deltaA)
  const F = furmidgeForce(wMm * 1e-3, gLG * 1e-3, deltaA, dr)
  const pull = 1000 * vol * 1e-9 * 9.81 * Math.sin(alpha * RAD)
  const slide = slidingAngle(F, vol * 1e-9)
  const slides = pull > F
  // Front and rear angles open up from the mean value towards δ_a and δ_r as the drop is tilted.
  const mid = (deltaA + dr) / 2
  const t = slide === null ? Math.min(1, pull / Math.max(F, 1e-12)) : Math.min(1, Math.sin(alpha * RAD) / Math.max(Math.sin(slide * RAD), 1e-9))
  const front = mid + (deltaA - mid) * t
  const rear = mid + (dr - mid) * t

  return (
    <figure className="figure" aria-label="Tilt-the-drop simulator">
      <div className="sim-grid">
        <TiltView
          alpha={alpha}
          front={front}
          rear={rear}
          slides={slides}
          label={`Drop on a surface tilted by ${alpha}°: ${slides ? 'it slides' : 'it stays pinned'}.`}
        />
        <div>
          <dl className="results" aria-live="polite">
            <div>
              <dt>Retention force F (Furmidge)</dt>
              <dd>{(F * 1e6).toFixed(1)} µN</dd>
            </div>
            <div>
              <dt>Gravity component m g sin α</dt>
              <dd>{(pull * 1e6).toFixed(1)} µN</dd>
            </div>
            <div className="result-main">
              <dt>Sliding angle</dt>
              <dd>{slide === null ? 'never (stays pinned)' : `${slide.toFixed(1)}°`}</dd>
            </div>
            <div>
              <dt>At α = {alpha}°</dt>
              <dd>
                <span className={`state-badge${slides ? ' above' : ''}`}>{slides ? 'slides' : 'pinned'}</span>
              </dd>
            </div>
          </dl>
          <p className="note">
            F = k w γ<sub>lg</sub>(cos δ<sub>r</sub> − cos δ<sub>a</sub>) with k = 1; m = ρ<sub>L</sub>V with ρ<sub>L</sub> =
            1000 kg/m³. Hysteresis δ<sub>a</sub> − δ<sub>r</sub> = {(deltaA - dr).toFixed(0)}°.
          </p>
        </div>
      </div>
      <div className="figure-controls hero-controls">
        <Slider id="hy-a" label={<>Advancing angle δ<sub>a</sub></>} value={`${deltaA}°`} min={10} max={170} step={1} pos={deltaA} onChange={setDeltaA} />
        <Slider id="hy-r" label={<>Receding angle δ<sub>r</sub></>} value={`${dr}°`} min={0} max={170} step={1} pos={deltaR} onChange={setDeltaR} hint="δ_r ≤ δ_a" />
        <Slider id="hy-w" label={<>Drop width w</>} value={`${wMm} mm`} min={0.5} max={8} step={0.1} pos={wMm} onChange={setWMm} />
        <Slider id="hy-g" label={<>γ<sub>lg</sub></>} value={`${gLG} mN/m`} min={15} max={80} step={1} pos={gLG} onChange={setGLG} />
        <Slider id="hy-v" label={<>Drop volume V</>} value={`${vol} µL`} min={1} max={100} step={1} pos={vol} onChange={setVol} />
        <Slider id="hy-t" label={<>Tilt angle α</>} value={`${alpha}°`} min={0} max={90} step={1} pos={alpha} onChange={setAlpha} />
      </div>
      <figcaption>
        <span className="figure-label">Figure 2.</span> On a tilted surface the downhill (advancing) angle grows and the
        uphill (receding) angle shrinks until they reach δ<sub>a</sub> and δ<sub>r</sub>; then the drop starts to move.
        Set δ<sub>a</sub> = δ<sub>r</sub> (no hysteresis) and the drop slides at any tilt.
      </figcaption>
    </figure>
  )
}
