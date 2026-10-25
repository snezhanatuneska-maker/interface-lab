import React, { useState } from 'react'

export const LennardJonesPage: React.FC = () => {
  const [epsilon, setEpsilon] = useState<number>(1.0) // Well depth (eV or arbitrary units)
  const [sigma, setSigma] = useState<number>(3.4)     // Finite distance where potential is zero (Å)

  // Calculated properties
  const rMin = Math.pow(2, 1 / 6) * sigma // Equilibrium distance r_m ≈ 1.122 * sigma

  // Generate curve points for SVG graph (r from 0.9 * sigma to 3.0 * sigma)
  const points: { r: number; v: number }[] = []
  for (let r = 0.9 * sigma; r <= 3.0 * sigma; r += 0.02 * sigma) {
    const sr6 = Math.pow(sigma / r, 6)
    const sr12 = sr6 * sr6
    const v = 4 * epsilon * (sr12 - sr6)
    points.push({ r, v })
  }

  // SVG scaling helpers
  const width = 600
  const height = 400
  const rMaxPlot = 3.0 * sigma
  const vMinPlot = -1.2 * epsilon
  const vMaxPlot = 2.0 * epsilon

  const scaleX = (r: number) => (r / rMaxPlot) * width
  const scaleY = (v: number) => height - ((v - vMinPlot) / (vMaxPlot - vMinPlot)) * height

  const pathData = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(pt.r)} ${scaleY(Math.max(vMinPlot, Math.min(vMaxPlot, pt.v)))}`)
    .join(' ')

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
            <label>
              Well Depth ($\epsilon$): <strong>{epsilon.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>
              Finite Distance ($\sigma$): <strong>{sigma.toFixed(2)} Å</strong>
            </label>
            <input
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
            <p><strong>Equilibrium Distance ($r_m$):</strong> {rMin.toFixed(3)} Å ($2^{1/6}\sigma$)</p>
            <p><strong>Well Depth ($-\epsilon$):</strong> -{epsilon.toFixed(2)} units at $r_m$</p>
            <p><strong>Hard-Sphere Limit:</strong> Steep repulsion as $r \to 0$ ($r^{-12}$ dominance)</p>
          </div>
        </div>

        <div className="card plot-card">
          <h2>Potential Energy Curve $V(r)$</h2>
          <svg viewBox={`0 0 ${width} ${height}`} className="lj-plot">
            {/* Axis lines */}
            <line x1="0" y1={scaleY(0)} x2={width} y2={scaleY(0)} stroke="#ccc" strokeDasharray="4" />
            <line x1={scaleX(sigma)} y1="0" x2={scaleX(sigma)} y2={height} stroke="#eee" />
            
            {/* LJ Curve */}
            <path d={pathData} fill="none" stroke="var(--accent-color, #2563eb)" strokeWidth="3" />

            {/* Equilibrium marker */}
            <circle cx={scaleX(rMin)} cy={scaleY(-epsilon)} r="6" fill="#dc2626" />
          </svg>
          <p className="caption">Red marker indicates equilibrium bond length / minimum potential well ($r_m, -\epsilon$).</p>
        </div>
      </div>
    </div>
  )
}
