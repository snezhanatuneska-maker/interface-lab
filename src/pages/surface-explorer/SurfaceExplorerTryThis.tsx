import React, { useState, useRef, useEffect } from 'react';

export const SurfaceExplorerTryThis: React.FC = () => {
  const [mode, setMode] = useState<'sem' | 'afm' | 'xps'>('sem');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === 'sem') {
      // SEM grayscale secondary electron look
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw simulated nanoparticles
      for (let i = 0; i < 20; i++) {
        const cx = 50 + (i * 45) % 320;
        const cy = 60 + Math.sin(i) * 40 + (i * 12) % 120;
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('SEM View: Secondary Electron Topography (Resolution: ~2 nm)', 20, 30);

    } else if (mode === 'afm') {
      // AFM false-color height map look
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = grad;
      ctx.fillRect(20, 40, canvas.width - 40, canvas.height - 60);

      // Cantilever tip illustration overlay
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 10);
      ctx.lineTo(190, 80);
      ctx.lineTo(210, 80);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('AFM View: Cantilever Tip & 3D Height Map (Vertical Z: < 0.1 nm)', 20, 30);

    } else {
      // XPS spectrum graph view
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 200);
      for (let x = 30; x < 350; x += 5) {
        let y = 180;
        if (x > 100 && x < 130) y = 80; // Peak 1 (e.g. Pt 4f)
        if (x > 220 && x < 250) y = 110; // Peak 2 (e.g. O 1s)
        ctx.lineTo(x, y + (Math.random() * 4 - 2));
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('XPS View: Binding Energy Spectra (~1-10 nm Depth)', 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Intensity (Counts)', 25, 215);
      ctx.fillText('Binding Energy (eV)', 240, 215);
    }
  }, [mode]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive Characterization Viewer</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-2">
              Select Analytical Technique
            </label>
            <div className="flex gap-2">
              <button 
                onClick={() => setMode('sem')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${mode === 'sem' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
              >
                SEM
              </button>
              <button 
                onClick={() => setMode('afm')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${mode === 'afm' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
              >
                AFM
              </button>
              <button 
                onClick={() => setMode('xps')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${mode === 'xps' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
              >
                XPS
              </button>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg space-y-1 text-sm">
            <p><strong>Active Technique:</strong> {mode.toUpperCase()}</p>
            <p><strong>Primary Strength:</strong> {mode === 'sem' ? 'High lateral resolution morphology' : mode === 'afm' ? 'Sub-nanometer vertical roughness profiling' : 'Surface chemical state & stoichiometry'}</p>
            <p><strong>Information Depth:</strong> {mode === 'xps' ? '~1–10 nm (Surface sensitive)' : 'Topographical surface view'}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={380} height={230} className="rounded-lg shadow-inner w-full max-w-[380px]" />
        </div>
      </div>
    </div>
  );
};
