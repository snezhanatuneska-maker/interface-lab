# Interface Engineering Lab

Course notes with small simulations for Interface Engineering (CEP).

The homepage is a numbered contents list (available simulations, plus a "Planned" tab).
The visual style is a plain lab notebook: paper background with a 5 mm grid, ink colours,
Source Serif 4 for text and IBM Plex Mono for numbers (see `src/design-tokens.css`).
The first tool is a **Langmuir vs BET adsorption** simulator for bachelor students:

- An animated **molecular view** (the main element of the page): a kinetic simulation where gas molecules
  fly with Maxwell–Boltzmann speeds, stick to and desorb from a solid surface. In Langmuir mode each site holds at most one molecule; in BET mode molecules stack into
  multilayers, coloured by layer (1, 2, 3+), with the live coverage θ or n/nₘ shown next to it.
- An **isotherm** plot beside it that tracks the current pressure with a marker. The usual BET fitting range
  (P/P₀ 0.05–0.35) is shaded, and once the simulation settles a "simulation" diamond is drawn
  exactly on the current point of the curve (it disappears as soon as the pressure, model, K/c or Reset changes the setting).
- Controls beneath both: model toggle, pressure P/P₀, a log-scale slider for the active model's constant
  (Langmuir K, 0.5–200, default 10; BET c, 0.5–500, default 50, with c < 2 giving a type III isotherm),
  Pause/Play and Reset. The simulation's desorption rates follow
  K and c, so its average still matches the equation.
- **The equations**: both isotherms rendered with KaTeX (loaded from cdnjs), every term explained,
  assumptions listed, and the one matching the selected model highlighted.
- A short "Why it matters for clean energy" section.

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
npm run build      # type-check, then build the production site into dist/
npm run preview    # serve the dist/ build locally to check it before deploying
```

## Project layout

```
index.html                     HTML entry point
vite.config.ts                 Vite config (sets base: "/interface-lab/")
src/main.tsx                   React entry
src/App.tsx                    Site layout: header, hash routing (#/ and #/adsorption), footer
src/siteConfig.ts              Author, course name and revision date shown in the footer
src/pages/HomePage.tsx         Homepage: contents list and planned topics
src/components/Entry.tsx       Numbered notebook section (margin number and note + content)
src/lib/useHashRoute.ts        Tiny hash-based router (works on GitHub Pages)
src/pages/AdsorptionPage.tsx   "Langmuir vs BET Adsorption" page (molecular view, controls, isotherm, equations)
src/components/SurfaceView.tsx Animated canvas: gas molecules adsorbing on the surface
src/components/Tex.tsx         KaTeX loader (CDN) and equation component
src/components/Plot.tsx        Plotly wrapper (uses the smaller "basic" Plotly bundle)
src/lib/adsorption.ts          Isotherm equations, default K and c and their slider ranges
src/index.css                  Global styles
.github/workflows/deploy.yml   GitHub Pages deployment workflow
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
