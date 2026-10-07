# Interface Engineering Lab

Interactive educational tools for **Interface Engineering in Clean Energy Processes (CEP)**,
by Snezhana Tuneska.

Live site: <https://snezhanatuneska-maker.github.io/interface-lab/>

The homepage lists the live tools; the Upcoming Projects tab shows the tools being built next and the full roadmap.
The first tool is a **Langmuir vs BET adsorption** simulator for bachelor students:

- An animated **molecular view**: a kinetic simulation where gas molecules fly with Maxwell–Boltzmann speeds and
  stick to and desorb from a solid surface. In Langmuir mode each site holds at most one molecule; in BET mode
  molecules stack into multilayers, coloured by layer (1, 2, 3+). The simulation starts at equilibrium, and its
  desorption rates follow K and C, so its running average matches the equation. Far from equilibrium (near p₀,
  or after the pressure drops to 0) it fast-forwards (×16, then ×64) until it catches up; **Jump to equilibrium**
  restarts it at equilibrium for the current setting. Bars under it show the share of sites that are bare or
  1, 2, 3+ layers deep, in the simulation and from the equation.
- An **isotherm** plot (θ = V/Vₘ against p/p₀, 0–3 or 0–25 layers) with the current pressure marked, the knee
  **B** (one monolayer's worth, p/p₀ = 1/(1 + √C)), the BET fit range (0.05–0.35) shaded, p₀ marked, and an
  "off scale" marker when the point is above the plot.
- Controls: model (Langmuir / BET; the pressure is kept when switching), pressure p/p₀, log-scale sliders for
  K (0.5–200) and C (0.5–500; C < 2 gives a type III isotherm), Pause/Play and Reset. A one-line explanation
  under the controls changes with the setting.
- **Try this**: five multiple-choice questions, each with a "Set it up" button that prepares the simulation.
- **The equations**, in the course notation (θ = V/Vₘ, C), rendered with KaTeX (bundled, so it works offline),
  with every term and assumption explained.
- **From the BET plot to surface area**: the straight-line BET plot for an example powder (Pt black, IrO₂,
  Vulcan XC-72, Ketjenblack), the slope and intercept, Vₘ and C recovered from them, and the specific surface area
  in m²/g, with a warning when C < 2 makes the BET result invalid. Below it, a Pt particle-size slider shows the
  Pt surface per gram, 6/(ρd), and how it links to the electrochemical (ECSA) measurement.
- **Beyond BET**: the IUPAC isotherm types I–IV and what each says about the surface.
- **Why it matters for clean energy**: fuel-cell catalysts, catalyst layers, H₂ storage and CO₂ capture.

**Stack:** [Vite](https://vite.dev) + React + TypeScript, plots with
[Plotly.js](https://plotly.com/javascript/) via `react-plotly.js`.

## Run locally

You need Node.js 20 or newer (22 recommended).

```bash
npm install        # install dependencies (first time only)
npm run dev        # start the dev server with hot reload
```

Open the URL Vite prints, usually <http://localhost:5173/interface-lab/>.
The `/interface-lab/` path is there on purpose: it matches the GitHub Pages URL (see below).

Other commands:

```bash
npm test           # unit tests for the isotherm equations (Vitest)
npm run build      # type-check, then build the production site into dist/
npm run preview    # serve the dist/ build locally to check it before deploying
```

## Project layout

```
index.html                       HTML entry point (meta tags, theme set before first paint)
vite.config.ts                   Vite config (sets base: "/interface-lab/")
public/                          favicon and og-image.png (link preview)
src/main.tsx                     React entry
src/App.tsx                      Site layout: header, hash routing (#/ and #/adsorption), footer
src/siteConfig.ts                Author and course shown in the footer
src/design-tokens.css            Colours, type scale and spacing (light and dark)
src/index.css                    Global and component styles
src/data/upcomingProjects.ts     Every tool on the homepage (live and planned) in one list
src/pages/HomePage.tsx           Homepage: Tools and Upcoming Projects tabs
src/pages/AdsorptionPage.tsx     Langmuir vs BET page: simulation, isotherm and controls
src/pages/adsorption/            Sections of that page: Try this, equations, BET plot and surface area,
                                 isotherm types, and the contextual explanations (insight.ts)
src/components/SurfaceView.tsx   Animated canvas: gas molecules adsorbing on the surface
src/components/Controls.tsx      Shared controls: Slider, LogSlider, Segmented (radio group)
src/components/Plot.tsx          Plotly wrapper (uses the smaller "basic" Plotly bundle)
src/components/Tex.tsx           KaTeX equation component
src/components/ThemeToggle.tsx   Light/dark switch in the header
src/components/UpcomingProjects.tsx  Upcoming Projects tab
src/lib/adsorption.ts            Isotherm equations, BET fit, surface area, example samples (tests: adsorption.test.ts)
src/lib/plotTheme.ts             Shared Plotly layout and axis styling
src/lib/theme.ts, themeColors.ts Light/dark theme and its colours for canvas and Plotly
src/lib/useHashRoute.ts          Tiny hash-based router (works on GitHub Pages)
.github/workflows/deploy.yml     GitHub Pages deployment workflow
.github/workflows/ci.yml         Tests and build on every pull request
```

## Deployment (GitHub Pages)

Deployment is automatic. On every push to `main`, the workflow in
`.github/workflows/deploy.yml`:

1. checks out the code and installs dependencies with `npm ci`,
2. runs `npm run build` to produce the static site in `dist/`,
3. uploads `dist/` as a Pages artifact and publishes it with `actions/deploy-pages`.

You can also run it by hand from the **Actions** tab (**Deploy to GitHub Pages** → **Run workflow**).

The live site is served at:

```
https://snezhanatuneska-maker.github.io/interface-lab/
```

Because the site lives under `/interface-lab/` rather than the domain root, `vite.config.ts`
sets `base: "/interface-lab/"` so the built JS and CSS paths point to the right place.
**If you rename the repository, update `base` to the new name.**

### One-time setup

In the repository on GitHub, go to **Settings → Pages**, and under
**Build and deployment → Source** choose **GitHub Actions**. After that, each push to
`main` deploys the site.
