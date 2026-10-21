import React, { useState, useRef, useEffect } from 'react';

export const ZetaTryThis: React.FC = () => {
  const [ph, setPh] = useState<number>(7); // pH 2 to 12
  const iep = 7.0; // Isoelectric point of model oxide particle
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculations
  // Zeta potential drops linearly away from IEP: zeta = -12 * (pH - iep)
  const zetaPotential = (-12 * (ph - iep)).toFixed(1);
  const zetaNum = parseFloat(zetaPotential);
  const mobility = (0.8 * zetaNum).toFixed(1); // scaled electrophoretic mobility
  
  const isStable = Math.abs(zetaNum) > 25;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw suspension fluid environment
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw nanoparticles
    const numParticles = 16;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < numParticles; i++) {
      let x, y;
      const angle = (i / numParticles) * Math.PI * 2;
      
      if (isStable) {
        // Particles repel and spread out evenly across the canvas
        const dist = 70 + (i % 3) * 25;
        x = centerX + Math.cos(angle + ph * 0.2) * dist;
        y = centerY + Math.sin(angle + ph * 0.2) * dist;
      } else {
        // Agglomeration / Clumping near center when zeta ~ 0
        const clumpSpread = 18 + Math.abs(zetaNum) * 1.5;
        x = centerX + Math.cos(angle) * (clumpSpread + (i % 4) * 5);
        y = centerY + Math.sin(angle) * (clumpSpread + (i % 4) * 5);
      }

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = zetaNum > 0 ? '#3b82f6' : zetaNum < 0 ? '#ec4899' : '#94a3b8';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    // Status text overlay on canvas
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText(`pH: ${ph.toFixed(1)} | Zeta: ${zetaPotential} mV`, 20, 30);
    ctx.fillStyle = isStable ? '#4ade80' : '#f87171';
    ctx.fillText(`Status: ${isStable ? 'DISPERSED (Stable Ink)' : 'AGGLOMERATED (Flocculated)'}`, 20, 55);
  }, [ph, zetaNum, isStable]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive pH Titration Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Solution pH (<span className="italic font-serif">pH</span>): {ph.toFixed(1)}
            </label>
            <input 
              type="range" 
              min={2} 
              max={12} 
              step={0.1} 
              value={ph} 
              onChange={(e) => setPh(Number(e.target.value))} 
              className="w-full accent-blue-600" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Acidic (pH 2)</span>
              <span>IEP (pH 7)</span>
              <span>Basic (pH 12)</span>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg space-y-1 text-sm">
            <p><strong>Zeta Potential (ζ):</strong> {zetaPotential} mV</p>
            <p><strong>Electrophoretic Mobility (u<sub>e</sub>):</strong> {mobility} (µm/s)/(V/cm)</p>
            <p><strong>Dispersion State:</strong> <span className={isStable ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>{isStable ? "Stable Suspension" : "Flocculated / Settling"}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={380} height={260} className="rounded-lg shadow-inner w-full max-w-[380px]" />
        </div>
      </div>
    </div>
  );
};
