# Interface Engineering Lab

Interactive educational tools for **Interface Engineering in Clean Energy Processes (CEP)**.

Live site: <https://snezhanatuneska-maker.github.io/interface-lab/>

The homepage groups the tools by course topic. The Tools tab lists the finished pages; the Upcoming Projects tab lists
the subtopics that do not have a page yet (and disappears once every subtopic has one). Both are built from
`src/data/subtopics.ts`: to publish a new page, add its route as `href` there and it moves to Tools by itself.

**Site navigation.** Every page has a side menu: a sticky sidebar on desktop, and on narrower screens a drawer opened
from the ☰ button in the header (closed by Esc, the × button, the backdrop or following a link; the rest of the page
is inert while it is open). On desktop the sidebar folds away to the side with "« Hide menu" or the ☰ button, which
brings it back; the choice is remembered in the browser (`src/lib/menu.ts`). It lists the finished pages grouped under the five course topics, highlights the current
page, and ends with a Training section. It is built from `src/data/subtopics.ts` and `src/data/trainers.ts`, so a new
page appears there by itself. The header links to the main site sections (`src/data/nav.ts`) and has the theme toggle.

**Demo library** (`#/demos`). Cards for every finished page, grouped by topic with a count per group; each shows the
title, description, concept tags, the lecture chapter (when `chapter` is set in `subtopics.ts`) and a Launch link.
A search box filters by title, description and concept tags (press `/` to jump to it, Esc to clear it), and chips
filter by topic, each with its number of matches. The search logic is in `src/lib/demos.ts`.

**Training** (`#/training`). All practice lives here: the topic pages have no question sections, only a
"Practise this topic" link under each page to its trainers (`src/components/PracticeLinks.tsx`). There is at least
one trainer for every finished topic, grouped by topic on `#/training`. Most mix randomized numeric problems with the
topic's concept questions (`src/data/practice/`, the questions that used to be on the pages). Every trainer
has Easy / Medium / Hard, a Generate problem button, four answers (click or keys 1–4; Space loads the next problem),
the current and best streak per trainer (saved in localStorage when available), a Reset button, and after each
answer the worked solution step by step. **Exam mode** asks 10 questions without feedback, then shows the score and
a review of every question with its solution. Problems come from a seeded random generator (`src/lib/random.ts`), so
each is reproducible from the number shown above it. The trainers:

- **Liquid Interfaces:** Surfactants & CMC (Klevens rule, area per molecule), Wetting (Young, Wenzel, Cassie–Baxter
  angles and the favoured state), Capillary Pressure (Young–Laplace pressure and pore radius), Mercury Porosimetry
  (Washburn pore diameter and pressure).
- **Solid Interfaces:** BET Training (a noisy N₂ dataset as a table and straight-line BET plot; find Vₘ, C or m²/g;
  wrong answers are typical mistakes; on Hard the slope and intercept are read off the plot), Isotherm Recognition
  (Langmuir, BET, IUPAC I–IV; harder levels pick curves that look more alike), Zisman Plot (γ_c from the contact
  angles of four test liquids).
- **Molecular & Macroscopic Interactions:** Van der Waals (r⁻⁶ scaling, Keesom ∝ 1/T).
- **Colloidal Systems:** Double Layer (Debye length, Stern capacitance, capacitors in series), Zeta Potential
  (Smoluchowski ζ from mobility, the isoelectric point), Colloid Stability (stable or coagulating from a DLVO curve,
  CCC ∝ 1/z⁶).
- **Nucleation & Growth:** Nucleation (d*, f(θ), barrier scaling), Phase Separation (spinodal composition; stable,
  metastable or unstable), Crystal Growth (which faces survive).

**About** (`#/about`, linked from the header and the footer): what the site is, who made it, the course it supports,
and links to the GitHub repository and Issues for feedback.

The first tool is a **Langmuir vs BET adsorption** simulator for bachelor students:

- An animated **molecular view**: a kinetic simulation where gas molecules fly with Maxwell–Boltzmann speeds and
  stick to and desorb from a solid surface. In Langmuir mode each site holds at most one molecule; in BET mode
  molecules stack into multilayers, coloured by layer (1, 2, 3+). The simulation starts at equilibrium, and its
  desorption rates follow K and C, so its running average matches the equation. After a big change of setting it
  needs time to catch up; **Jump to equilibrium** restarts it at equilibrium for the current setting.
- An **isotherm** plot (V/Vₘ against p/p₀, fixed 0–3 monolayers) with the current pressure marked, the knee
  **B** (one monolayer's worth, p/p₀ = 1/(1 + √C)), the BET fit range (0.05–0.35) shaded, p₀ marked, and an
  "off scale" marker when the point is above the plot.
- Controls: model (Langmuir / BET; the pressure is kept when switching), pressure p/p₀, log-scale sliders for
  K (0.5–200) and C (0.5–500; C < 2 gives a type III isotherm), both always adjustable (the other model's is
  dimmed) and starting equal (K = C = 50), Pause/Play and Reset. A one-line explanation
  under the controls changes with the setting.
- **The equations**, in the course notation (θ = V/Vₘ, C), rendered with KaTeX (bundled, so it works offline),
  with every term and assumption explained, and the Langmuir straight-line form.
- **From the BET plot to surface area**: the straight-line BET plot for an example powder (Pt black, IrO₂,
  Vulcan XC-72, Ketjenblack), the slope and intercept, Vₘ and C recovered from them, and the specific surface area
  in m²/g, with a warning when C < 2 makes the BET result invalid. Below it, a Pt particle-size slider shows the
  Pt surface per gram, 6/(ρd), and how it links to the electrochemical (ECSA) measurement.
- **Beyond BET**: the IUPAC isotherm types I–IV and what each says about the surface.
- **Why it matters for clean energy**: fuel-cell catalysts, catalyst layers, H₂ storage and CO₂ capture.

The **Surfactants & Micelle Formation** tool (`#/surfactants`) shows how surfactant first adsorbs at the air–water
interface and then forms micelles above the CMC: an animated beaker, surface tension against log c, conductivity,
osmotic pressure, turbidity and self-diffusion around the CMC, controls for surfactant (SDS, CTAB, Tween 20, C12
betaine, Custom), tail length, head type and NaCl, plus theory and equations. All constants
and equations are in `src/lib/surfactants.ts`; values marked ESTIMATED there should be checked against course notes.

The **Phase Separation** tool (`#/phase-separation`) contrasts nucleation and spinodal decomposition: drag a point
on a regular-solution phase diagram (binodal, spinodal, three shaded regions) linked to G(x) with its common tangent
and inflection points; side-by-side 1D concentration profiles (scripted nuclei vs a Cahn–Hilliard simulation); the
nucleation barrier ΔG(d) with sliders for S and γ; and CEP examples.

The **Wetting & Contact Angle** tool (`#/wetting`) compares Young, Wenzel and Cassie–Baxter: pick one model at a
time and see a droplet drawn to scale on a smooth surface, with liquid filling the grooves, or on trapped air, with a
zoomed view of the contact area. θ_Y is set directly or from γ_SV, γ_SL, γ_LV; sliders for roughness r and solid
fraction f_s, presets (glass, PTFE, lotus leaf), which state is favored, and why it matters for clean energy. Equations in
`src/lib/wetting.ts` (tests: `wetting.test.ts`).

The **Van der Waals Forces** tool (`#/van-der-waals`) splits the attraction between two identical neutral molecules
into Keesom, Debye and London (all −C/r⁶): pick a molecule (Ar, H₂, CH₄, CO, HCl, NH₃, H₂O or Custom), set T and r,
and see each term's share of C_vdW, the C values, and φ(r) against kT. Plus key takeaways and the H₂ storage link. Constants and formulas in `src/lib/vdw.ts` (tests: `vdw.test.ts`).

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
src/App.tsx                      Site layout: header, side menu, hash routing (#/, #/demos, #/training, #/training/<trainer>, #/about, #/adsorption, #/capillary, #/surfactants, #/wetting, #/van-der-waals, #/nucleation, …), footer (with an About link)
src/siteConfig.ts                Course name shown in the footer; GitHub repository URL (About page)
src/design-tokens.css            Colours, type scale and spacing (light and dark)
src/index.css                    Global and component styles
src/data/subtopics.ts            Course topics and every subtopic on the homepage (href = finished page, chapter = lecture chapter)
src/data/trainers.ts             Trainers, one or more per finished topic; listed on #/training, in the side menu and under
                                 each topic page (tests: trainers.test.ts)
src/data/practice/               Concept questions per topic, mixed into the trainers (tests: practice.test.ts)
src/components/PracticeLinks.tsx "Practise this topic" links under each topic page
src/data/nav.ts                  Header links: Home, Demos, Training, About (tests: nav.test.ts)
src/components/SideMenu.tsx      Side menu: sticky sidebar on desktop (folds away), drawer on narrow screens
src/lib/menu.ts                  Builds the side menu from subtopics and trainers; current-route check; remembers whether
                                 the sidebar is hidden (tests: menu.test.ts)
src/pages/HomePage.tsx           Homepage: Tools and Upcoming Projects tabs
src/pages/DemosPage.tsx          Demo library (#/demos): searchable, filterable cards of every finished page
src/lib/demos.ts                 Demo search and topic filter, chip counts (tests: demos.test.ts)
src/pages/AboutPage.tsx          About page (#/about)
src/pages/TrainingPage.tsx       Training index (#/training): one card per trainer, grouped by topic
src/pages/training/              TrainerPage (one page for every trainer), configs.tsx (each trainer's generator, intro and
                                 figure) and figures.tsx (BET, isotherm, DLVO and Zisman plots)
src/components/training/         Training framework: Trainer (difficulty, streaks, keys, exam mode), Options,
                                 Solution (worked steps in KaTeX), RichText (text with inline $…$ TeX)
src/lib/random.ts                Seeded random generator (tests: random.test.ts)
src/lib/training.ts              Problem type, answer options from typical mistakes, number formatting (tests: training.test.ts)
src/lib/streak.ts                Current and best streak per trainer in localStorage (tests: streak.test.ts)
src/lib/train*.ts                Problem generators: trainBet, trainIsotherm, trainWetting, trainColloid (own tests), and
                                 trainSurfactant, trainCapillary, trainMips, trainZisman, trainVdw, trainEdl, trainZeta,
                                 trainNucleation, trainPhase, trainCrystal (tests: trainTopics.test.ts). Each test checks the
                                 answer is among four distinct options and the numbers stay physical (checkGenerator.ts)
src/lib/bank.ts                  Concept-question banks as generators, and mixing generators (tests: bank.test.ts)
src/lib/dlvo.ts                  DLVO energy of two spheres, barrier height, CCC (tests: dlvo.test.ts)
src/pages/AdsorptionPage.tsx     Langmuir vs BET page: simulation, isotherm and controls
src/pages/adsorption/            Sections of that page: equations, BET plot and surface area,
                                 isotherm types, and the contextual explanations (insight.tsx)
src/components/SurfaceView.tsx   Animated canvas: gas molecules adsorbing on the surface
src/components/Controls.tsx      Shared controls: Slider, LogSlider, Segmented (radio group)
src/components/Plot.tsx          Loads Plotly on demand, with a same-size "Loading plot…" placeholder
src/components/PlotlyPlot.tsx    Plotly component (uses the smaller "basic" Plotly bundle)
src/components/Tex.tsx           KaTeX equation component
src/components/ThemeToggle.tsx   Light/dark switch in the header
src/pages/SurfactantPage.tsx     Surfactants & CMC page; its sections live in src/pages/surfactants/
src/pages/WettingPage.tsx        Wetting page; its sections (droplet, theory) live in src/pages/wetting/
src/pages/VdwPage.tsx            Van der Waals page; its sections (cards, theory) live in src/pages/vdw/
src/pages/CrystalPage.tsx        Crystal Growth & Shape page (#/crystal-growth); its sections (facet and DLA canvases,
                                 G vs S plot, equations) live in src/pages/crystal/
src/lib/crystal.ts               Facet geometry, Wulff shape, BCF/diffusion rate sketches (tests: crystal.test.ts)
src/pages/PhaseSeparationPage.tsx  Nucleation vs spinodal page (#/phase-separation); sections in src/pages/phase/
src/lib/phase.ts                 Regular solution, binodal/spinodal, Cahn–Hilliard, nucleation barrier (tests: phase.test.ts)
src/pages/NucleationPage.tsx     Classical nucleation page; its sections (equations, cap sketch, theory) live in src/pages/nucleation/
src/lib/nucleation.ts            ΔG(d), d*, ΔG*, shape factor f(θ), log rate (tests: nucleation.test.ts)
src/lib/vdw.ts                   Keesom, Debye, London coefficients, molecule presets, constants (tests: vdw.test.ts)
src/lib/wetting.ts               Young, Wenzel, Cassie–Baxter, critical angle, presets (tests: wetting.test.ts)
src/lib/surfactants.ts           CMC, surface tension and property models, all constants (tests: surfactants.test.ts)
src/lib/adsorption.ts            Isotherm equations, BET fit, surface area, example samples (tests: adsorption.test.ts)
src/lib/plotTheme.ts             Shared Plotly layout and axis styling
src/lib/theme.ts, themeColors.ts Light/dark theme and its colours for canvas and Plotly
src/lib/useHashRoute.ts          Tiny hash-based router (works on GitHub Pages)
.github/workflows/deploy.yml     GitHub Pages deployment workflow (tests, build, deploy)
.github/workflows/ci.yml         Tests and build on every pull request
```

## Deployment (GitHub Pages)

Deployment is automatic. On every push to `main`, the workflow in
`.github/workflows/deploy.yml`:

1. checks out the code and installs dependencies with `npm ci`,
2. runs `npm test`; if a test fails, nothing is deployed,
3. runs `npm run build` to produce the static site in `dist/`,
4. uploads `dist/` as a Pages artifact and publishes it with `actions/deploy-pages`.

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
