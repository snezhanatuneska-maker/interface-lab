import React, { useState, useRef, useEffect } from 'react';
import { Segmented } from '../../components/Controls';
import { useThemeColors } from '../../lib/themeColors';
import { CANVAS_FONT, setupCanvas } from '../../lib/canvas';

const W = 380;
const H = 230;

export const SurfaceExplorerTryThis: React.FC = () => {
  const [mode, setMode] = useState<'sem' | 'afm' | 'xps'>('sem');
  const theme = useThemeColors();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.plotBg;
    ctx.fillRect(0, 0, W, H);

    if (mode === 'sem') {
      // SEM grayscale secondary electron look
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, W, H);
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
      // The SEM image fills the canvas, so its label stays light on dark in both themes.
      ctx.fillStyle = '#ffffff';
      ctx.font = `12px ${CANVAS_FONT}`;
      ctx.fillText('SEM View: Secondary Electron Topography (Resolution: ~2 nm)', 20, 30);

    } else if (mode === 'afm') {
      // AFM false-color height map look
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = grad;
      ctx.fillRect(20, 40, W - 40, H - 60);

      // Cantilever tip illustration overlay
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 10);
      ctx.lineTo(190, 80);
      ctx.lineTo(210, 80);
      ctx.stroke();

      ctx.fillStyle = theme.text;
      ctx.font = `12px ${CANVAS_FONT}`;
      ctx.fillText('AFM View: Cantilever Tip & 3D Height Map (Vertical Z: < 0.1 nm)', 20, 30);

    } else {
      // XPS spectrum graph view
      ctx.strokeStyle = theme.data1;
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

      ctx.fillStyle = theme.text;
      ctx.font = `12px ${CANVAS_FONT}`;
      ctx.fillText('XPS View: Binding Energy Spectra (~1-10 nm Depth)', 20, 30);
      ctx.fillStyle = theme.muted;
      ctx.fillText('Intensity (Counts)', 25, 215);
      ctx.fillText('Binding Energy (eV)', 240, 215);
    }
  }, [mode, theme]);

  return (
    <figure id="sim-figure" className="figure hero" aria-label="Interactive Characterization Viewer">
      <div className="sim-grid">
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          role="img"
          aria-label={`${mode.toUpperCase()} view of the catalyst surface`}
        />
        <dl className="results">
          <div>
            <dt>Active Technique:</dt>{' '}
            <dd>{mode.toUpperCase()}</dd>
          </div>
          <div>
            <dt>Primary Strength:</dt>{' '}
            <dd>{mode === 'sem' ? 'High lateral resolution morphology' : mode === 'afm' ? 'Sub-nanometer vertical roughness profiling' : 'Surface chemical state & stoichiometry'}</dd>
          </div>
          <div>
            <dt>Information Depth:</dt>{' '}
            <dd>{mode === 'xps' ? '~1–10 nm (Surface sensitive)' : 'Topographical surface view'}</dd>
          </div>
        </dl>
      </div>

      <div className="figure-controls hero-controls wrap-controls">
        <div className="model-control">
          <span className="control-label">Select Analytical Technique</span>
          <Segmented
            label="Select Analytical Technique"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'sem', label: 'SEM' },
              { value: 'afm', label: 'AFM' },
              { value: 'xps', label: 'XPS' },
            ]}
          />
        </div>
      </div>
      <figcaption>
        <span className="figure-label">Interactive Characterization Viewer</span>
      </figcaption>
    </figure>
  );
};
