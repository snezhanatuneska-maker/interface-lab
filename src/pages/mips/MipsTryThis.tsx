import { useEffect, useRef, useState } from 'react'
import { Slider } from '../../components/Controls'
import { useThemeColors } from '../../lib/themeColors'
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas'
import { DELTA_HG, entryDiameter, entryPressure, GAMMA_HG } from '../../lib/mips'

const W = 380
const H = 240

/** Diameters of the drawn pores, nm. */
const PORES = [45, 30, 20, 12, 6]

export function MipsTryThis() {
  const [pressureMPa, setPressureMPa] = useState(20) // MPa
  const theme = useThemeColors()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const dEntry = entryDiameter(pressureMPa)
  // Share of the drawn pore volume that is filled: cylinders of equal length, so volume ∝ d².
  const vol = (d: number) => d * d
  const filled = PORES.filter((d) => pressureMPa >= entryPressure(d))
  const intrusionPercentage = ((100 * filled.reduce((a, d) => a + vol(d), 0)) / PORES.reduce((a, d) => a + vol(d), 0)).toFixed(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas, W, H)
    if (!ctx) return

    ctx.fillStyle = theme.plotBg
    ctx.fillRect(0, 0, W, H)

    // Porous solid
    ctx.fillStyle = theme.solid
    ctx.fillRect(20, 20, W - 40, H - 40)
    ctx.strokeStyle = theme.solidLine
    ctx.lineWidth = 1
    ctx.strokeRect(20.5, 20.5, W - 41, H - 41)

    const poreSizes = PORES
    ctx.font = `11px ${CANVAS_FONT}`
    poreSizes.forEach((size, idx) => {
      const x = 50 + idx * 60
      const y = 80

      ctx.fillStyle = theme.plotBg
      ctx.fillRect(x - size / 2, y, size, 110)

      const thresholdPressure = entryPressure(size)
      const isIntruded = pressureMPa >= thresholdPressure
      if (isIntruded) {
        ctx.fillStyle = theme.axis
        ctx.fillRect(x - size / 2 + 2, y + 10, size - 4, 95)
        ctx.fillStyle = theme.text
        ctx.fillText('Filled', x - 14, y + 60)
      } else {
        ctx.fillStyle = theme.muted
        ctx.fillText(`${size}nm`, x - 12, y + 60)
      }
    })

    // Mercury reservoir
    ctx.fillStyle = theme.axis
    ctx.fillRect(20, 20, W - 40, 25)
    ctx.fillStyle = theme.text
    ctx.font = `13px ${CANVAS_FONT}`
    ctx.fillText(`Mercury reservoir (p = ${pressureMPa} MPa)`, 35, 37)
  }, [pressureMPa, theme])

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Interactive MIP Intrusion Simulator">
      <div className="hero-head">
        <div className="coverage">
          <span className="coverage-label">
            Smallest pore entered: diameter <em>d</em>
          </span>
          <span className="coverage-value colloid">{dEntry.toFixed(1)} nm</span>
          <span className="coverage-sub">radius r<sub>c</sub> = {(dEntry / 2).toFixed(1)} nm</span>
        </div>
      </div>

      <div className="sim-grid">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={`Pores of 45 to 6 nm diameter under a mercury reservoir at ${pressureMPa} MPa`}
        />
        <dl className="results">
          <div>
            <dt>Drawn pore volume intruded</dt>
            <dd>{intrusionPercentage}%</dd>
          </div>
          <div>
            <dt>Mercury</dt>
            <dd>
              Non-wetting: γ = {GAMMA_HG} N/m, δ = {DELTA_HG}°
            </dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls">
        <Slider
          id="pressure"
          label={<>Applied pressure <em>p</em></>}
          value={`${pressureMPa} MPa`}
          min={5}
          max={250}
          step={1}
          pos={pressureMPa}
          onChange={setPressureMPa}
          hint={
            <span className="slider-ticks">
              <span>Low Pressure (Macropores)</span>
              <span>High Pressure (Nanopores)</span>
            </span>
          }
        />
      </div>
      <figcaption>
        <span className="figure-label">Figure 1.</span> Five cylindrical pores (labels are diameters). A pore fills
        once p exceeds its entry pressure p = −4γ cos δ/d; the intruded share counts each pore’s volume (∝ d²).
      </figcaption>
    </figure>
  )
}
