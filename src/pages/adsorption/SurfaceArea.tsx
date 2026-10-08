import { useMemo, useState } from 'react'
import type { Data, Shape } from 'plotly.js'
import Plot from '../../components/Plot'
import Tex from '../../components/Tex'
import { LogSlider, Slider } from '../../components/Controls'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import type { ThemeColors } from '../../lib/themeColors'
import {
  AREA_PER_VM,
  betFromLine,
  betLoading,
  betTransform,
  BET_FIT_RANGE,
  C_MIN_VALID,
  C_RANGE,
  fitLine,
  ptAreaPerGram,
  SAMPLES,
  SIGMA_N2,
  surfaceArea,
  V_MOLAR_STP,
} from '../../lib/adsorption'

// "Measured" points: the BET equation evaluated at the usual pressures of a BET measurement.
const FIT_XS = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35]
const Y_SCALE = 1000 // plot the BET transform in 10⁻³ g/cm³

interface Props {
  c: number
  setC: (c: number) => void
  sampleId: string
  setSampleId: (id: string) => void
  theme: ThemeColors
}

const sig = (v: number, digits = 3) => Number(v.toPrecision(digits)).toLocaleString('en')

const PT_D_DEFAULT = 3 // nm, typical Pt/C fuel-cell catalyst

/** Clean-energy hook: smaller Pt particles expose more surface per gram of metal. */
function PtParticles() {
  const [d, setD] = useState(PT_D_DEFAULT)
  const area = ptAreaPerGram(d)
  const black = SAMPLES[0].area
  return (
    <figure className="figure pt-figure">
      <h3>How small should the Pt particles be?</h3>
      <p className="prose">
        For spheres of diameter d, the surface per gram of Pt is A/m = 6/(ρd), with ρ = 21.45 g/cm³. Pt black
        ({black} m²/g) corresponds to particles of about {sig(ptAreaPerGram(1) / black, 2)} nm.
      </p>
      <div className="pt-row">
        <Slider
          id="pt-d"
          label={<>Pt particle diameter d</>}
          value={`${d.toFixed(1)} nm`}
          min={1}
          max={10}
          step={0.5}
          pos={d}
          onChange={setD}
          hint="fuel-cell Pt/C catalysts: typically 2–5 nm"
        />
        <dl className="results">
          <div className="result-main">
            <dt>Pt surface per gram of Pt</dt>
            <dd>{sig(area, 2)} m²/g</dd>
          </div>
          <div>
            <dt>compared with Pt black</dt>
            <dd>×{sig(area / black, 2)}</dd>
          </div>
        </dl>
      </div>
      <figcaption>
        <span className="figure-label">Langmuir link:</span> in a fuel-cell lab the Pt area is measured
        electrochemically (ECSA): hydrogen adsorbs as one monolayer, one H atom per surface Pt atom, and the charge
        to strip it (210 µC per cm² of Pt) counts the sites. Measured ECSA is lower than 6/(ρd) because particles
        touch the support and each other.
      </figcaption>
    </figure>
  )
}

export default function SurfaceArea({ c, setC, sampleId, setSampleId, theme }: Props) {
  const sample = SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[0]
  const VmTrue = sample.area / AREA_PER_VM

  const valid = c >= C_MIN_VALID

  const fit = useMemo(() => {
    const V = FIT_XS.map((x) => VmTrue * betLoading(x, c)) // cm³(STP)/g
    const ys = FIT_XS.map((x, i) => betTransform(x, V[i]))
    const line = fitLine(FIT_XS, ys)
    const { Vm, C } = betFromLine(line.slope, line.intercept)
    return { V, ys, ...line, Vm, C, area: surfaceArea(Vm) }
  }, [VmTrue, c])

  const data: Data[] = [
    {
      x: [0, BET_FIT_RANGE[1]],
      y: [fit.intercept * Y_SCALE, (fit.intercept + fit.slope * BET_FIT_RANGE[1]) * Y_SCALE],
      type: 'scatter',
      mode: 'lines',
      name: 'straight-line fit',
      line: { color: theme.data2, width: 2 },
    },
    {
      x: FIT_XS,
      y: fit.ys.map((y) => y * Y_SCALE),
      type: 'scatter',
      mode: 'markers',
      name: 'data points',
      marker: { size: 9, color: theme.plotBg, line: { color: theme.data2, width: 2 } },
    },
    {
      x: [0],
      y: [fit.intercept * Y_SCALE],
      type: 'scatter',
      mode: 'markers',
      name: 'intercept 1/(VₘC)',
      marker: { size: 9, symbol: 'diamond', color: theme.text },
    },
  ]
  const shapes: Partial<Shape>[] = [
    {
      type: 'rect',
      xref: 'x',
      yref: 'paper',
      x0: BET_FIT_RANGE[0],
      x1: BET_FIT_RANGE[1],
      y0: 0,
      y1: 1,
      layer: 'below',
      fillcolor: theme.data2Soft,
      line: { width: 0 },
    },
  ]
  // With C < 1 the slope is negative, so the top of the axis is set by whichever end of the line is higher.
  const yTop = Math.max(fit.intercept, fit.intercept + fit.slope * BET_FIT_RANGE[1]) * Y_SCALE * 1.1

  return (
    <section id="bet-plot" className="section" aria-labelledby="area-title">
      <h2 id="area-title" className="section-title">
        From the BET plot to surface area
      </h2>
      <div className="prose">
        <p>
          In the lab a weighed powder is cooled to 77 K and N₂ is dosed step by step. At each relative pressure the
          instrument records the adsorbed volume V in cm³(STP) per gram. Rearranging the BET equation gives a
          straight line:
        </p>
      </div>
      <div className="formula">
        <div className="formula-body">
          <Tex
            display
            tex={String.raw`\frac{p/p_0}{V\,(1 - p/p_0)} = \underbrace{\frac{C - 1}{V_m\,C}}_{\text{slope}}\;\frac{p}{p_0} + \underbrace{\frac{1}{V_m\,C}}_{\text{intercept}}`}
          />
        </div>
        <span className="formula-number">(3)</span>
      </div>

      <figure className="figure">
        <div className="area-controls">
          <label className="select">
            <span className="control-label">Sample (N₂ at 77 K)</span>
            <select value={sample.id} onChange={(e) => setSampleId(e.target.value)}>
              {SAMPLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}: {s.role}
                </option>
              ))}
            </select>
          </label>
          <LogSlider
            id="c-area"
            label={<>BET constant <em>C</em></>}
            range={C_RANGE}
            value={c}
            onChange={setC}
            hint="same C as in the simulation above"
          />
        </div>
        <div className="area-grid">
          <div
            role="img"
            aria-label={`BET plot: seven points between p/p₀ 0.05 and 0.35 on a straight line with slope ${sig(fit.slope * Y_SCALE)} and intercept ${sig(fit.intercept * Y_SCALE)}, in 10⁻³ g/cm³.`}
          >
            <Plot
              data={data}
              layout={{
                ...baseLayout(theme),
                xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 0.36] },
                yaxis: {
                  ...axis(theme),
                  title: { text: '(p/p₀) / [V(1 − p/p₀)]   [10⁻³ g/cm³]' },
                  range: [0, yTop],
                },
                shapes,
              }}
              config={staticConfig}
              useResizeHandler
              className="plot"
            />
          </div>
          <div>
            <dl className="results" aria-live="polite">
              <div>
                <dt>Slope</dt>
                <dd>{sig(fit.slope * Y_SCALE)} × 10⁻³ g/cm³</dd>
              </div>
              <div>
                <dt>Intercept</dt>
                <dd>{sig(fit.intercept * Y_SCALE)} × 10⁻³ g/cm³</dd>
              </div>
              <div>
                <dt>
                  V<sub>m</sub> = 1/(slope + intercept)
                </dt>
                <dd>{sig(fit.Vm)} cm³(STP)/g</dd>
              </div>
              <div>
                <dt>C = slope/intercept + 1</dt>
                <dd>{sig(fit.C)}</dd>
              </div>
              <div className={`result-main${valid ? '' : ' invalid'}`}>
                <dt>Specific surface area A/m</dt>
                <dd>{sig(fit.area)} m²/g</dd>
              </div>
            </dl>
            {!valid && (
              <p className="result-warning" role="note">
                <strong>⚠ Not a valid BET result.</strong> With C &lt; {C_MIN_VALID} the isotherm has no knee (type III)
                {fit.slope < 0 ? ' and the BET line slopes downward' : ''}, so there is no monolayer to count. A lab
                would not report this area.
              </p>
            )}
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 2.</span> BET plot for {sample.name} ({sample.role}). The points
          are the BET equation itself, so they fall exactly on a line. Real data bend away below p/p₀ ≈ 0.05
          (uneven, high-energy sites fill first) and above ≈ 0.35 (capillary condensation in pores), which is why
          only the shaded range is fitted.
        </figcaption>
      </figure>

      <div className="prose">
        <p>
          From V<sub>m</sub> to area: V<sub>m</sub> cm³(STP) of gas is V<sub>m</sub>/V<sub>mol</sub> moles of
          molecules, each covering σ = {SIGMA_N2} nm² (N₂ at 77 K):
        </p>
      </div>
      <div className="formula">
        <div className="formula-body">
          <Tex
            display
            tex={String.raw`\frac{A}{m} = \frac{V_m\,N_A\,\sigma}{V_{mol}} = V_m \cdot \frac{6.022\times10^{23}\,\text{mol}^{-1}\cdot 0.162\times10^{-18}\,\text{m}^2}{${V_MOLAR_STP}\,\text{cm}^3/\text{mol}} \approx V_m \cdot ${AREA_PER_VM.toFixed(2)}\,\frac{\text{m}^2}{\text{cm}^3}`}
          />
        </div>
        <span className="formula-number">(4)</span>
      </div>
      <p className="callout">
        <strong>Why the number matters:</strong> unsupported Pt black offers only about {SAMPLES[0].area} m²/g. Spread
        the same Pt as 2–5 nm particles over a high-area carbon such as Vulcan ({SAMPLES[2].area} m²/g) or
        Ketjenblack ({SAMPLES[3].area} m²/g) and far more of the expensive metal touches the reactants. For scarce
        iridium in PEM electrolyzer anodes, area per gram is a direct cost lever. Values are typical and rounded;
        real powders vary by supplier and treatment.
      </p>

      <PtParticles />
    </section>
  )
}
