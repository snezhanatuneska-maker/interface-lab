import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '../../components/Controls';
import { useThemeColors } from '../../lib/themeColors';
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas';

const W = 380;
const H = 230;

export const ZismanTryThis: React.FC = () => {
  const [substrate, setSubstrate] = useState<'teflon' | 'pe' | 'glass'>('teflon');
  const [liquidGamma, setLiquidGamma] = useState<number>(40); // mN/m
  const theme = useThemeColors();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gammaC = substrate === 'teflon' ? 18 : substrate === 'pe' ? 31 : 72;
  const b = 0.03;
  const cosTheta = Math.min(1.0, Math.max(-1.0, 1 - b * (liquidGamma - gammaC)));
  const contactAngleDeg = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.plotBg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 200);
    ctx.lineTo(220, 200);
    ctx.stroke();

    ctx.fillStyle = theme.muted;
    ctx.font = `11px ${CANVAS_FONT}`;
    ctx.fillText('cos(θ) = 1.0', 10, 25);
    ctx.fillText('0', 30, 205);
    ctx.fillText('γ_lv (mN/m)', 120, 218);

    ctx.strokeStyle = theme.data1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const startX = 40 + (gammaC - 10) * 2;
    const startY = 20;
    const endX = 40 + (80 - 10) * 2;
    const endY = 200 - (1 - b * (80 - gammaC)) * 180;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const currentX = 40 + (liquidGamma - 10) * 2;
    const currentY = 200 - ((1 - b * (liquidGamma - gammaC))) * 180;
    ctx.fillStyle = theme.data2;
    ctx.beginPath();
    ctx.arc(currentX, Math.max(20, Math.min(200, currentY)), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.plotBg;
    ctx.stroke();

    const dropX = 300;
    const dropY = 140;
    ctx.fillStyle = theme.solid;
    ctx.fillRect(240, 140, 120, 10);
    ctx.strokeStyle = theme.solidLine;
    ctx.lineWidth = 1;
    ctx.strokeRect(240, 140, 120, 10);

    ctx.fillStyle = theme.data1;
    ctx.beginPath();
    ctx.arc(dropX, dropY, 35, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = theme.text;
    ctx.font = `13px ${CANVAS_FONT}`;
    ctx.fillText(`Substrate: ${substrate.toUpperCase()}`, 245, 40);
    ctx.fillText(`θ = ${contactAngleDeg.toFixed(1)}°`, 270, 70);

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
            <dd className={contactAngleDeg > 90 ? 'lang-ink' : 'state-ok'}>{contactAngleDeg > 90 ? "Hydrophobic / Non-Wetting" : "Hydrophilic / Wetting"}</dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls select-controls">
        <label className="select">
          <span className="control-label">Select Solid Substrate</span>{' '}
          <select
            value={substrate}
            onChange={(e) => setSubstrate(e.target.value as 'teflon' | 'pe' | 'glass')}
          >
            <option value="teflon">PTFE / Teflon (Low Energy, γ_c ≈ 18 mN/m)</option>
            <option value="pe">Polyethylene (Medium Energy, γ_c ≈ 31 mN/m)</option>
            <option value="glass">Clean Glass (High Energy, γ_c ≈ 72 mN/m)</option>
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
        <span className="figure-label">Interactive Zisman Plot Simulator</span>
      </figcaption>
    </figure>
  );
};
