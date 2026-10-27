import { useEffect, useRef, useState } from 'react'
import { Slider } from '../../components/Controls'
import { useThemeColors } from '../../lib/themeColors'
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas'
import { E0, EPS_BULK } from '../../lib/edl'
import { ETA_WATER } from '../../lib/trainZeta'

const W = 380
const H = 260

const ZETA_MAX = 60 // mV, plateau far from the IEP
const ZETA_WIDTH = 3 // pH units over which ζ turns from one plateau to the other
/** Rule of thumb for electrostatic stability. */
const STABLE_ZETA = 30 // mV
/** Below this |ζ| aggregation is fast; between it and STABLE_ZETA stability is limited. */
const UNSTABLE_ZETA = 10 // mV
/** Smoluchowski: u = ε₀ε_r ζ / η, in µm·cm/(V·s) per mV (1 µm·cm/(V·s) = 10⁻⁸ m²/(V·s)): about 0.078. */
const MOBILITY_PER_MV = (E0 * EPS_BULK * 1e-3) / ETA_WATER / 1e-8

export function ZetaTryThis() {
  const [ph, setPh] = useState(7) // pH 2 to 12
  const iep = 7.0 // Isoelectric point of model oxide particle
  const theme = useThemeColors()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Model oxide: ζ changes sign at the IEP and levels off at both ends (sigmoidal, as measured titration curves do).
  const zetaPotential = (-ZETA_MAX * Math.tanh((ph - iep) / ZETA_WIDTH)).toFixed(1)
  const zetaNum = parseFloat(zetaPotential)
  const mobility = (MOBILITY_PER_MV * zetaNum).toFixed(2) // Smoluchowski, water at 25 °C
  const isStable = Math.abs(zetaNum) > STABLE_ZETA
  const isUnstable = Math.abs(zetaNum) < UNSTABLE_ZETA
  const status = isStable ? 'Stable suspension' : isUnstable ? 'Agglomerating (fast)' : 'Limited stability (slow aggregation)'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas, W, H)
    if (!ctx) return

    ctx.fillStyle = theme.plotBg
    ctx.fillRect(0, 0, W, H)

    // Nanoparticles
    const numParticles = 16
    const centerX = W / 2
    const centerY = H / 2
    for (let i = 0; i < numParticles; i++) {
      let x, y
      const angle = (i / numParticles) * Math.PI * 2
      if (isStable) {
        // Particles repel and spread out evenly across the canvas
        const dist = 70 + (i % 3) * 25
        x = centerX + Math.cos(angle + ph * 0.2) * dist
        y = centerY + Math.sin(angle + ph * 0.2) * dist
      } else {
        // Agglomeration / clumping near the center when zeta ~ 0
        const clumpSpread = 18 + Math.abs(zetaNum) * 1.5
        x = centerX + Math.cos(angle) * (clumpSpread + (i % 4) * 5)
        y = centerY + Math.sin(angle) * (clumpSpread + (i % 4) * 5)
      }
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = zetaNum > 0 ? theme.data1 : zetaNum < 0 ? theme.data2 : theme.muted
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = theme.plotBg
      ctx.stroke()
    }

    // Status text
    ctx.font = `13px ${CANVAS_FONT}`
    ctx.fillStyle = theme.text
    ctx.fillText(`pH: ${ph.toFixed(1)} | Zeta: ${zetaPotential} mV`, 12, 22)
    ctx.fillStyle = isStable ? theme.accent : theme.data2
    ctx.fillText(`Status: ${status}`, 12, 42)
  }, [ph, zetaNum, zetaPotential, isStable, status, theme])

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Interactive pH Titration Simulator">
      <div className="hero-head">
        <div className="coverage">
          <span className="coverage-label">
            Zeta Potential (<em>ζ</em>)
          </span>
          <span className="coverage-value colloid">{zetaPotential} mV</span>
        </div>
      </div>

      <div className="sim-grid">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={`Particles at pH ${ph.toFixed(1)}: ${isStable ? 'dispersed' : 'agglomerated'}`}
        />
        <dl className="results">
          <div>
            <dt>
              Electrophoretic Mobility (<em>u<sub>e</sub></em>)
            </dt>
            <dd>{mobility} µm·cm/(V·s)</dd>
          </div>
          <div>
            <dt>Dispersion State</dt>
            <dd className={isStable ? 'state-ok' : 'state-bad'}>
              {status}
            </dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls">
        <Slider
          id="ph"
          label={
            <>
              Solution pH (<em>pH</em>)
            </>
          }
          value={ph.toFixed(1)}
          min={2}
          max={12}
          step={0.1}
          pos={ph}
          onChange={setPh}
          hint={
            <span className="slider-ticks">
              <span>Acidic (pH 2)</span>
              <span>IEP (pH 7)</span>
              <span>Basic (pH 12)</span>
            </span>
          }
        />
      </div>
      <figcaption>
        <span className="figure-label">Figure 1.</span> A model oxide with its IEP at pH 7 in an indifferent salt. The
        mobility follows Smoluchowski (thin double layer, water at 25 °C): 1 µm·cm/(V·s) ≈ 12.8 mV. Stable here
        means |ζ| &gt; {STABLE_ZETA} mV and fast agglomeration |ζ| &lt; {UNSTABLE_ZETA} mV; both are rules of thumb that
        depend on salt and particle size.
      </figcaption>
    </figure>
  )
}
