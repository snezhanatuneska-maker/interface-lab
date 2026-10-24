import React, { useState, useRef, useEffect } from 'react';

export const ZismanTryThis: React.FC = () => {
  const [substrate, setSubstrate] = useState<'teflon' | 'pe' | 'glass'>('teflon');
  const [liquidGamma, setLiquidGamma] = useState<number>(40); // mN/m
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Critical surface tension values (gamma_c)
  const gammaC = substrate === 'teflon' ? 18 : substrate === 'pe' ? 31 : 72;
  
  // Zisman relation: cos(theta) = 1 - b(gamma_lv - gamma_c)
  const b = 0.03;
  const cosTheta = Math.min(1.0, Math.max(-1.0, 1 - b * (liquidGamma - gammaC)));
  const contactAngleDeg = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Zisman plot axes on canvas left
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 200);
    ctx.lineTo(220, 200);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('cos(θ) = 1.0', 10, 25);
    ctx.fillText('0', 30, 205);
    ctx.fillText('γ_lv (mN/m)', 120, 218);

    // Draw Zisman trendline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // maps gamma_c to cos=1, and higher gamma to lower cos
    const startX = 40 + (gammaC - 10) * 2;
    const startY = 20;
    const endX = 40 + (80 - 10) * 2;
    const endY = 200 - (1 - b * (80 - gammaC)) * 180;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Plot current active point
    const currentX = 40 + (liquidGamma - 10) * 2;
    const currentY = 200 - ((1 - b * (liquidGamma - gammaC))) * 180;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(currentX, Math.max(20, Math.min(200, currentY)), 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Droplet schematic on right side
    const dropX = 300;
    const dropY = 140;
    ctx.fillStyle = '#334155';
    ctx.fillRect(240, 140, 120, 10); // Solid surface

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(dropX, dropY, 35, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Substrate: ${substrate.toUpperCase()}`, 245, 40);
    ctx.fillText(`θ = ${contactAngleDeg.toFixed(1)}°`, 270, 70);

  }, [substrate, liquidGamma, gammaC, contactAngleDeg]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive Zisman Plot Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Select Solid Substrate
            </label>
            <select 
              value={substrate} 
              onChange={(e) => setSubstrate(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 text-gray-800"
            >
              <option value="teflon">PTFE / Teflon (Low Energy, γ_c ≈ 18 mN/m)</option>
              <option value="pe">Polyethylene (Medium Energy, γ_c ≈ 31 mN/m)</option>
              <option value="glass">Clean Glass (High Energy, γ_c ≈ 72 mN/m)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Liquid Surface Tension (&gamma;<sub>lv</sub>): {liquidGamma} mN/m
            </label>
            <input 
              type="range" 
              min={20} 
              max={75} 
              value={liquidGamma} 
              onChange={(e) => setLiquidGamma(Number(e.target.value))} 
              className="w-full accent-blue-600" 
            />
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg space-y-1 text-sm">
            <p><strong>Critical Surface Tension (&gamma;<sub>c</sub>):</strong> {gammaC} mN/m</p>
            <p><strong>Contact Angle (&theta;):</strong> {contactAngleDeg.toFixed(1)}&deg;</p>
            <p><strong>Wetting State:</strong> <span className={contactAngleDeg > 90 ? "text-blue-800 font-semibold" : "text-emerald-700 font-semibold"}>{contactAngleDeg > 90 ? "Hydrophobic / Non-Wetting" : "Hydrophilic / Wetting"}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={380} height={230} className="rounded-lg shadow-inner w-full max-w-[380px]" />
        </div>
      </div>
    </div>
  );
};
