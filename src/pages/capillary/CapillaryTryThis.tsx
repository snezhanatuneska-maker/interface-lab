import React, { useState, useRef, useEffect } from 'react';

export const CapillaryTryThis: React.FC = () => {
  const [radius, setRadius] = useState<number>(15);
  const [contactAngle, setContactAngle] = useState<number>(25);
  const [mode, setMode] = useState<'imbibition' | 'drainage'>('imbibition');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gamma = 0.0728;

  const thetaRad = (contactAngle * Math.PI) / 180;
  const rMeters = radius * 1e-9;
  const pcPa = (2 * gamma * Math.cos(thetaRad)) / rMeters;
  const pcKPa = (pcPa / 1e3).toFixed(1);
  const jurinHeight = (1500 / radius).toFixed(1);
  const kelvinRatio = Math.max(0.05, 1 - (35 / radius)).toFixed(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const poreWidth = radius * 6;
    const leftWallX = (canvas.width - poreWidth) / 2;
    const rightWallX = leftWallX + poreWidth;

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, leftWallX, canvas.height);
    ctx.fillRect(rightWallX, 0, canvas.width - rightWallX, canvas.height);

    const fillHeight = mode === 'imbibition' ? canvas.height * 0.65 : canvas.height * 0.35;
    
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(leftWallX, canvas.height - fillHeight, poreWidth, fillHeight);

    ctx.beginPath();
    ctx.moveTo(leftWallX, canvas.height - fillHeight);
    const curvatureDepth = (90 - contactAngle) * 0.6 * (mode === 'imbibition' ? 1 : -1);
    
    ctx.bezierCurveTo(
      leftWallX + poreWidth * 0.25, (canvas.height - fillHeight) - curvatureDepth,
      rightWallX - poreWidth * 0.25, (canvas.height - fillHeight) - curvatureDepth,
      rightWallX, canvas.height - fillHeight
    );
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Pore Radius (r): ${radius} nm`, 16, 28);
    ctx.fillText(`State: ${mode.toUpperCase()}`, 16, 48);
  }, [radius, contactAngle, mode]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Interactive Pore Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">Pore Radius ($r$): {radius} nm</label>
            <input type="range" min={2} max={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">Contact Angle ($\theta$): {contactAngle}°</label>
            <input type="range" min={0} max={85} value={contactAngle} onChange={(e) => setContactAngle(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">Process Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as 'imbibition' | 'drainage')} className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50">
              <option value="imbibition">Imbibition (Filling)</option>
              <option value="drainage">Drainage (Emptying)</option>
            </select>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg space-y-1 text-sm">
            <p><strong>Capillary Pressure ($P_c$):</strong> {pcKPa} kPa</p>
            <p><strong>Jurin Rise Height ($h$):</strong> {jurinHeight} µm</p>
            <p><strong>Kelvin Saturation ($P/P_0$):</strong> {kelvinRatio}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={400} height={300} className="rounded-lg shadow-inner w-full max-w-[400px]" />
        </div>
      </div>
    </div>
  );
};
