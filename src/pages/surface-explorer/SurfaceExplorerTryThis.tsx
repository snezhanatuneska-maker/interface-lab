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
      // XPS survey of a Pt/C catalyst: binding energy runs from high (left) to low (right), as spectra are plotted.
      // Gaussian peaks at their literature positions on a background that steps up on the high-BE side of each peak
      // (inelastically scattered electrons).
      const BE_MAX = 600;
      const x0 = 30;
      const x1 = 350;
      const base = 185;
      const bx = (be: number) => x0 + ((BE_MAX - be) / BE_MAX) * (x1 - x0);
      const peaks = [
        { be: 531, h: 45, w: 2.5, label: 'O 1s' },
        { be: 284.5, h: 110, w: 2, label: 'C 1s' },
        { be: 74.5, h: 45, w: 1.5, label: '' },
        { be: 71.2, h: 60, w: 1.5, label: 'Pt 4f' },
      ];
      const signal = (be: number) =>
        peaks.reduce((sum, p) => sum + p.h * Math.exp(-(((be - p.be) / p.w) ** 2) / 2) + (be > p.be ? 0.12 * p.h : 0), 0);
      ctx.strokeStyle = theme.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, 45);
      ctx.lineTo(x0, base);
      ctx.lineTo(x1, base);
      ctx.stroke();
      ctx.strokeStyle = theme.data1;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let be = BE_MAX; be >= 0; be -= 0.5) {
        const x = bx(be);
        const y = base - 4 - signal(be);
        if (be === BE_MAX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = theme.text;
      ctx.font = `11px ${CANVAS_FONT}`;
      for (const p of peaks) if (p.label) ctx.fillText(p.label, bx(p.be) + 5, base - signal(p.be) + 4);
      ctx.fillStyle = theme.muted;
      for (const be of [600, 400, 200, 0]) ctx.fillText(String(be), bx(be) - 8, base + 13);

      ctx.fillStyle = theme.text;
      ctx.font = `12px ${CANVAS_FONT}`;
      ctx.fillText('XPS View: survey of a Pt/C catalyst (~1–10 nm depth)', 20, 30);
      ctx.fillStyle = theme.muted;
      ctx.fillText('Intensity', 25, 222);
      ctx.fillText('Binding energy (eV)', 220, 222);
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
