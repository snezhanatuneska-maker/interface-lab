import React, { useState, useRef, useEffect } from 'react';

export const MipsTryThis: React.FC = () => {
  const [pressureMPa, setPressureMPa] = useState<number>(20); // MPa
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const equivalentRadius = (1500 / pressureMPa).toFixed(1);
  const intrusionPercentage = Math.min(100, Math.max(5, (pressureMPa / 200) * 100)).toFixed(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#334155';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    const poreSizes = [45, 30, 20, 12, 6];
    poreSizes.forEach((size, idx) => {
      const x = 50 + idx * 60;
      const y = 80;
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - size/2, y, size, 110);

      const thresholdPressure = 1500 / size;
      const isIntruded = pressureMPa >= thresholdPressure;

      if (isIntruded) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x - size/2 + 2, y + 10, size - 4, 95);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText('Filled', x - 14, y + 60);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${size}nm`, x - 12, y + 60);
      }
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(20, 20, canvas.width - 40, 25);
    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Mercury Reservoir (P = ${pressureMPa} MPa)`, 35, 37);

  }, [pressureMPa]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive MIP Intrusion Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Applied Hydraulic Pressure: {pressureMPa} MPa
            </label>
            <input 
              type="range" 
              min={5} 
              max={250} 
              value={pressureMPa} 
              onChange={(e) => setPressureMPa(Number(e.target.value))} 
              className="w-full accent-blue-600" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Pressure (Macropores)</span>
              <span>High Pressure (Nanopores)</span>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg space-y-1 text-sm">
            <p><strong>Equivalent Entry Radius (<span className="font-serif italic">r</span>):</strong> {equivalentRadius} nm</p>
            <p><strong>Cumulative Volume Intrude:</strong> {intrusionPercentage}%</p>
            <p><strong>Washburn Mode:</strong> Non-Wetting (<span className="font-serif italic">&theta; &gt; 90&deg;</span>)</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={380} height={240} className="rounded-lg shadow-inner w-full max-w-[380px]" />
        </div>
      </div>
    </div>
  );
};
