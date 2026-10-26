import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '../../components/Controls';
import { useThemeColors } from '../../lib/themeColors';
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas';

const W = 380;
const H = 230;

type Substrate = 'teflon' | 'pe' | 'nylon';
/** Zisman critical surface tensions, mN/m. */
const GAMMA_C: Record<Substrate, number> = { teflon: 18, pe: 31, nylon: 42 };
const SUBSTRATE_NAME: Record<Substrate, string> = { teflon: 'PTFE', pe: 'PE', nylon: 'Nylon 6,6' };

export const ZismanTryThis: React.FC = () => {
  const [substrate, setSubstrate] = useState<Substrate>('teflon');
  const [liquidGamma, setLiquidGamma] = useState<number>(40); // mN/m
  const theme = useThemeColors();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gammaC = GAMMA_C[substrate];
  const b = 0.03; // typical Zisman slope, (mN/m)⁻¹
  const cosTheta = Math.min(1.0, Math.max(-1.0, 1 - b * (liquidGamma - gammaC)));
  const contactAngleDeg = Math.acos(cosTheta) * (180 / Math.PI);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.plotBg;
    ctx.fillRect(0, 0, W, H);

    // Zisman plot: γ_lv 10–80 mN/m → x 40–180; cos θ +1 … −1 → y 20 … 200.
    const px = (g: number) => 40 + (g - 10) * 2;
    const py = (c: number) => 110 - c * 90;
    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 200);
    ctx.lineTo(220, 200);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(40, py(0));
    ctx.lineTo(220, py(0));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = theme.muted;
    ctx.font = `11px ${CANVAS_FONT}`;
    ctx.fillText('cos θ', 4, 14);
    ctx.fillText('1', 28, py(1) + 4);
    ctx.fillText('0', 28, py(0) + 4);
    ctx.fillText('−1', 22, py(-1));
    ctx.fillText('γ_lv (mN/m)', 110, 218);

    // The line reaches cos θ = 1 at γ_c and is clipped at cos θ = −1.
    const gEnd = Math.min(80, gammaC + 2 / b);
    ctx.strokeStyle = theme.data1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px(gammaC), py(1));
    ctx.lineTo(px(gEnd), py(1 - b * (gEnd - gammaC)));
    ctx.stroke();

    ctx.fillStyle = theme.data2;
    ctx.beginPath();
    ctx.arc(px(liquidGamma), py(cosTheta), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.plotBg;
    ctx.stroke();

    // Drop: a spherical cap meeting the solid at θ (through the liquid).
    const dropX = 300;
    const surfaceY = 140;
    ctx.fillStyle = theme.solid;
    ctx.fillRect(240, surfaceY, 120, 10);
    ctx.strokeStyle = theme.solidLine;
    ctx.lineWidth = 1;
    ctx.strokeRect(240, surfaceY, 120, 10);

    const th = Math.max(contactAngleDeg, 2) * (Math.PI / 180);
    const R = th < Math.PI / 2 ? 45 / Math.sin(th) : 35; // fixed base below 90°, fixed radius above
    const a = R * Math.sin(th); // half-width of the base
    const cy = surfaceY + R * Math.cos(th); // centre (canvas y points down)
    ctx.fillStyle = theme.data1;
    ctx.beginPath();
    ctx.arc(dropX, cy, R, Math.atan2(surfaceY - cy, -a), Math.atan2(surfaceY - cy, a), false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = theme.text;
    ctx.font = `13px ${CANVAS_FONT}`;
    ctx.fillText(`Substrate: ${SUBSTRATE_NAME[substrate]}`, 240, 40);
    ctx.fillText(`θ = ${contactAngleDeg.toFixed(1)}°`, 270, 64);

  }, [substrate, liquidGamma, gammaC, contactAngleDeg, theme]);

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Interactive Zisman Plot Simulator">
      <div className="sim-grid">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={`Zisman plot and drop on ${substrate}: contact angle ${contactAngleDeg.toFixed(1)} degrees`}
        />
        <dl className="results">
          <div>
            <dt>Critical Surface Tension (&gamma;<sub>c</sub>):</dt>{' '}
            <dd>{gammaC} mN/m</dd>
          </div>
          <div>
            <dt>Contact Angle (&theta;):</dt>{' '}
            <dd>{contactAngleDeg.toFixed(1)}&deg;</dd>
          </div>
          <div>
            <dt>Wetting State:</dt>{' '}
            <dd className={contactAngleDeg > 90 ? 'lang-ink' : 'state-ok'}>{contactAngleDeg === 0 ? 'Spreads completely' : contactAngleDeg > 90 ? 'Non-wetting (θ > 90°)' : 'Partially wetting (θ < 90°)'}</dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls select-controls">
        <label className="select">
          <span className="control-label">Select Solid Substrate</span>{' '}
          <select
            value={substrate}
            onChange={(e) => setSubstrate(e.target.value as Substrate)}
          >
            <option value="teflon">PTFE / Teflon (Low Energy, γ_c ≈ 18 mN/m)</option>
            <option value="pe">Polyethylene (Medium Energy, γ_c ≈ 31 mN/m)</option>
            <option value="nylon">Nylon 6,6 (Higher Energy, γ_c ≈ 42 mN/m)</option>
          </select>
        </label>

        <Slider
          id="zisman-gamma"
          label={<>Liquid Surface Tension (&gamma;<sub>lv</sub>):{' '}</>}
          value={`${liquidGamma} mN/m`}
          min={20}
          max={75}
          step={1}
          pos={liquidGamma}
          onChange={setLiquidGamma}
        />
      </div>
      <figcaption>
        <span className="figure-label">Figure 1.</span> Left: Zisman line cos θ = 1 − b(γ<sub>lv</sub> − γ<sub>c</sub>)
        with a typical slope b = 0.03 m/mN. Right: the drop at that angle. The straight line holds for non-polar
        liquids; polar liquids such as water bend the plot, so the line overestimates their angle (it gives about 130°
        for water on PTFE; the measured value is about 110°). Clean glass and metals are high-energy surfaces on which
        all test liquids spread, so no γ<sub>c</sub> can be read for them.
      </figcaption>
    </figure>
  );
};
