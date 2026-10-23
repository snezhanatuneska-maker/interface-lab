import React, { useState, useRef, useEffect } from 'react';

export const DlvoTryThis: React.FC = () => {
  const [saltConc, setSaltConc] = useState<number>(10); // mM
  const [valency, setValency] = useState<number>(1); // 1 (Monovalent) or 2 (Divalent)
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Approximate calculations
  // Higher salt or higher valency collapses the energy barrier faster (Schulze-Hardy effect ~ z^6)
  const effectiveCoagulationPower = saltConc * Math.pow(valency, 6);
  const barrierHeight = Math.max(0, 25 - (effectiveCoagulationPower / 15)).toFixed(1);
  const isCoagulated = parseFloat(barrierHeight) < 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw interaction energy curve preview (simplified graph on canvas left or background)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 20; x < 200; x++) {
      const dist = (x - 20) / 10;
      // Repulsion term minus attraction term modulated by salt
      const energy = (50 * Math.exp(-dist * (0.5 + saltConc * 0.05 * valency))) - (30 / (dist + 0.5)) + (parseFloat(barrierHeight) * 0.2);
      const y = 130 - energy * 2;
      if (x === 20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw particle dispersion state on right side
    const centerX = 290;
    const centerY = 130;
    const numParticles = 14;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      let x, y;
      if (!isCoagulated) {
        const r = 45 + (i % 2) * 15;
        x = centerX + Math.cos(angle) * r;
        y = centerY + Math.sin(angle) * r;
      } else {
        const r = 12 + (i % 4) * 6;
        x = centerX + Math.cos(angle) * r;
        y = centerY + Math.sin(angle) * r;
      }

      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = isCoagulated ? '#f43f5e' : '#38bdf8';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Energy Barrier: ${barrierHeight} kT`, 20, 30);
    ctx.fillStyle = isCoagulated ? '#fca5a5' : '#86efac';
    ctx.fillText(isCoagulated ? 'State: Coagulated (Flocks)' : 'State: Stable Dispersed', 20, 50);
  }, [saltConc, valency, barrierHeight, isCoagulated]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive DLVO Energy Barrier Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Electrolyte Salt Concentration: {saltConc} mM
            </label>
            <input 
              type="range" 
              min={1} 
              max={100} 
              value={saltConc} 
              onChange={(e) => setSaltConc(Number(e.target.value))} 
              className="w-full accent-blue-600" 
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Counter-ion Valency (<span className="font-serif italic">z</span>): {valency} ({valency === 1 ? 'Monovalent e.g., NaCl' : 'Divalent e.g., CaCl₂'})
            </label>
            <select 
              value={valency} 
              onChange={(e) => setValency(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 text-gray-800"
            >
              <option value={1}>Monovalent (z = 1)</option>
              <option value={2}>Divalent (z = 2)</option>
            </select>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg space-y-1 text-sm">
            <p><strong>Energy Barrier Peak:</strong> {barrierHeight} <span className="font-serif italic">kT</span></p>
            <p><strong>Coagulation Tendency:</strong> <span className={isCoagulated ? "text-rose-700 font-semibold" : "text-emerald-700 font-semibold"}>{isCoagulated ? "High (Barrier Collapsed)" : "Low (Stable Colloid)"}</span></p>
            <p><strong>Schulze-Hardy Scaling:</strong> <span className="font-mono">CCC &propto; 1/z<sup>6</sup></span></p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={380} height={240} className="rounded-lg shadow-inner w-full max-w-[380px]" />
        </div>
      </div>
    </div>
  );
};
