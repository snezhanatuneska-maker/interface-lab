import React, { useState } from 'react'

const W = 600
const H = 300
const M = { l: 58, r: 16, t: 14, b: 40 }

interface PlotProps {
  fn: (r: number) => number
  rMin: number
  rMax: number
  yMin: number
  yMax: number
  color: string
  yLabel: string
  sigma: number
  mark: { r: number; y: number; label: string }
  ariaLabel: string
}

const Plot: React.FC<PlotProps> = ({ fn, rMin, rMax, yMin, yMax, color, yLabel, sigma, mark, ariaLabel }) => {
  const pw = W - M.l - M.r
  const ph = H - M.t - M.b
  const X = (r: number) => M.l + ((r - rMin) / (rMax - rMin)) * pw
  const Y = (v: number) => M.t + ((yMax - v) / (yMax - yMin)) * ph

  // Build the path, lifting the pen where the curve leaves the plot area
  let d = ''
  let pen = false
  const N = 300
  for (let i = 0; i <= N; i++) {
    const r = rMin + ((rMax - rMin) * i) / N
    const v = fn(r)
    if (v > yMax || v < yMin) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${X(r).toFixed(1)} ${Y(v).toFixed(1)} `
    pen = true
  }

  const xTicks = [0, 1, 2, 3, 4].map((i) => rMin + ((rMax - rMin) * i) / 4)
  const yTicks = [0, 1, 2, 3, 4].map((i) => yMin + ((yMax - yMin) * i) / 4)
  const muted = 'var(--muted, #6b6b66)'
  const line = 'var(--border, #e3e3de)'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lj-plot" role="img" aria-label={ariaLabel} style={{ width: '100%', height: 'auto' }}>
      {yTicks.map((v, i) => (
        <g key={`y${i}`}>
          <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={line} />
          <text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={muted}>
            {v.toFixed(Math.abs(yMax - yMin) < 5 ? 2 : 1)}
          </text>
        </g>
      ))}
      {xTicks.map((r, i) => (
        <text key={`x${i}`} x={X(r)} y={H - 20} textAnchor="middle" fontSize="11" fill={muted}>
          {r.toFixed(1)}
        </text>
      ))}
      <text x={M.l + pw / 2} y={H - 4} textAnchor="middle" fontSize="12" fill={muted}>
        r (Å)
      </text>
      <text
        x={14}
        y={M.t + ph / 2}
        textAnchor="middle"
        fontSize="12"
        fill={muted}
        transform={`rotate(-90 14 ${M.t + ph / 2})`}
      >
        {yLabel}
      </text>

      {/* zero line */}
      <line x1={M.l} x2={W - M.r} y1={Y(0)} y2={Y(0)} stroke={muted} strokeWidth="1.5" />
      {/* hard-sphere diameter r = sigma */}
      <line x1={X(sigma)} x2={X(sigma)} y1={M.t} y2={M.t + ph} stroke={muted} strokeDasharray="5 4" />
      <text x={X(sigma) - 6} y={M.t + 12} textAnchor="end" fontSize="11" fill={muted}>
        r = σ
      </text>

      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />

      <circle cx={X(mark.r)} cy={Y(mark.y)} r="6" fill="#dc2626" />
      <text x={X(mark.r) + 10} y={Y(mark.y) - 8} fontSize="11" fill="var(--text, #1d1d1b)">
        {mark.label}
      </text>
    </svg>
  )
}

export const LennardJonesPage: React.FC = () => {
  const [epsilon, setEpsilon] = useState<number>(1.0) // well depth, kJ/mol
  const [sigma, setSigma] = useState<number>(3.4) // distance where V = 0, Å

  const rm = Math.pow(2, 1 / 6) * sigma // equilibrium distance
  const rF = Math.pow(26 / 7, 1 / 6) * sigma // distance of maximum attraction

  const V = (r: number) => {
    const s6 = Math.pow(sigma / r, 6)
    return 4 * epsilon * (s6 * s6 - s6)
  }
  const F = (r: number) => {
    const s6 = Math.pow(sigma / r, 6)
    return ((24 * epsilon) / r) * (2 * s6 * s6 - s6) // F = -dV/dr, positive = repulsive
  }
  const fAttract = Math.abs(F(rF))

  const rLo = 0.85 * sigma
  const rHi = 3.0 * sigma

  return (
    <div className="container wide page">
      <header className="page-header">
        <h1>Lennard-Jones Potential Explorer</h1>
        <p className="subtitle">
          The molecular basis of adhesion, adsorption, and cohesion via the 12-6 potential model.
        </p>
      </header>

      <div className="grid two-column">
        <div className="card controls-card">
          <h2>Parameters</h2>
          <div className="control-group">
            <label htmlFor="lj-eps">
              Well depth (ε): <strong>{epsilon.toFixed(2)} kJ/mol</strong>
            </label>
            <input
              id="lj-eps"
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label htmlFor="lj-sigma">
              Distance parameter (σ): <strong>{sigma.toFixed(2)} Å</strong>
            </label>
            <input
              id="lj-sigma"
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))}
            />
          </div>

          <div className="stats-box">
            <h3>Key Metrics</h3>
            <p>
              <strong>Equilibrium distance (r<sub>m</sub>):</strong> {rm.toFixed(3)} Å (2<sup>1/6</sup>σ ≈ 1.122σ)
            </p>
            <p>
              <strong>Well depth:</strong> V(r<sub>m</sub>) = −{epsilon.toFixed(2)} kJ/mol
            </p>
            <p>
              <strong>Zero crossing:</strong> V = 0 at r = σ = {sigma.toFixed(2)} Å
            </p>
            <p>
              <strong>Maximum attraction:</strong> {fAttract.toFixed(3)} kJ/(mol·Å) at r = {rF.toFixed(2)} Å
            </p>
            <p>
              <strong>Hard-sphere limit:</strong> steep repulsion as r → σ and below (r<sup>−12</sup> dominance),
              so the molecule acts like a rigid sphere of diameter ≈ σ.
            </p>
          </div>
        </div>

        <div className="card plot-card">
          <h2>Potential energy V(r)</h2>
          <Plot
            fn={V}
            rMin={rLo}
            rMax={rHi}
            yMin={-1.3 * epsilon}
            yMax={2.5 * epsilon}
            color="var(--accent-color, #2563eb)"
            yLabel="V (kJ/mol)"
            sigma={sigma}
            mark={{ r: rm, y: -epsilon, label: 'r_m, −ε' }}
            ariaLabel="Lennard-Jones potential energy curve"
          />

          <h2 style={{ marginTop: '1.5rem' }}>Force F(r) = −dV/dr</h2>
          <Plot
            fn={F}
            rMin={rLo}
            rMax={rHi}
            yMin={-1.5 * fAttract}
            yMax={2.5 * fAttract}
            color="#c2410c"
            yLabel="F (kJ/(mol·Å))"
            sigma={sigma}
            mark={{ r: rm, y: 0, label: 'F = 0 at r_m' }}
            ariaLabel="Lennard-Jones force curve"
          />
          <p className="caption">
            Red marker: the potential minimum (r<sub>m</sub>, −ε), where the force is zero. Positive force is
            repulsive, negative is attractive.
          </p>
        </div>
      </div>
    </div>
  )
}
