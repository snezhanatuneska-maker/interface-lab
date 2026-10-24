import { useEffect, useRef, useState } from 'react'
import { Slider } from '../../components/Controls'
import { useThemeColors } from '../../lib/themeColors'
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas'

const W = 380
const H = 240

export function DlvoTryThis() {
  const [saltConc, setSaltConc] = useState(10) // mM
  const [valency, setValency] = useState(1) // 1 (Monovalent) or 2 (Divalent)
  const theme = useThemeColors()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const effectiveCoagulationPower = saltConc * Math.pow(valency, 6)
  const barrierHeight = Math.max(0, 25 - effectiveCoagulationPower / 15).toFixed(1)
  const isCoagulated = parseFloat(barrierHeight) < 5

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas, W, H)
    if (!ctx) return

    ctx.fillStyle = theme.plotBg
    ctx.fillRect(0, 0, W, H)

    // Interaction energy curve
    ctx.strokeStyle = theme.data1
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 20; x < 200; x++) {
      const dist = (x - 20) / 10
      const energy =
        50 * Math.exp(-dist * (0.5 + saltConc * 0.05 * valency)) - 30 / (dist + 0.5) + parseFloat(barrierHeight) * 0.2
      const y = 130 - energy * 2
      if (x === 20) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Particles
    const centerX = 290
    const centerY = 130
    const numParticles = 14
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2
      const r = isCoagulated ? 12 + (i % 4) * 6 : 45 + (i % 2) * 15
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fillStyle = isCoagulated ? theme.data2 : theme.data1
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = theme.plotBg
      ctx.stroke()
    }

    ctx.font = `13px ${CANVAS_FONT}`
    ctx.fillStyle = theme.text
    ctx.fillText(`Energy Barrier: ${barrierHeight} kT`, 12, 22)
    ctx.fillStyle = isCoagulated ? theme.data2 : theme.accent
    ctx.fillText(isCoagulated ? 'State: Coagulated (Flocks)' : 'State: Stable Dispersed', 12, 42)
  }, [saltConc, valency, barrierHeight, isCoagulated, theme])

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Interactive DLVO Energy Barrier Simulator">
      <div className="hero-head">
        <div className="coverage">
          <span className="coverage-label">Energy Barrier Peak</span>
          <span className="coverage-value colloid">
            {barrierHeight} <em>kT</em>
          </span>
        </div>
      </div>

      <div className="sim-grid">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={`Energy curve and particles: ${isCoagulated ? 'coagulated' : 'stable dispersed'}`}
        />
        <dl className="results">
          <div>
            <dt>Coagulation Tendency</dt>
            <dd className={isCoagulated ? 'state-bad' : 'state-ok'}>
              {isCoagulated ? 'High (Barrier Collapsed)' : 'Low (Stable Colloid)'}
            </dd>
          </div>
          <div>
            <dt>Schulze-Hardy Scaling</dt>
            <dd>
              CCC ∝ 1/z<sup>6</sup>
            </dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls">
        <Slider
          id="salt"
          label="Electrolyte Salt Concentration"
          value={`${saltConc} mM`}
          min={1}
          max={100}
          step={1}
          pos={saltConc}
          onChange={setSaltConc}
        />
        <label className="select">
          <span className="control-label">
            Counter-ion Valency (<em>z</em>): {valency} ({valency === 1 ? 'Monovalent e.g., NaCl' : 'Divalent e.g., CaCl₂'})
          </span>
          <select value={valency} onChange={(e) => setValency(Number(e.target.value))}>
            <option value={1}>Monovalent (z = 1)</option>
            <option value={2}>Divalent (z = 2)</option>
          </select>
        </label>
      </div>
      <figcaption>
        <span className="figure-label">Figure 1.</span> Interactive DLVO Energy Barrier Simulator
      </figcaption>
    </figure>
  )
}
