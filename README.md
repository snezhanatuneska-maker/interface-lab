# Interface Engineering Lab

Interactive educational tools for interface engineering in clean energy processes.

The homepage lists the tools as cards (more are marked "coming soon").
The first tool is a **Langmuir vs BET adsorption** simulator for bachelor students:

- An animated **molecular view** (the main element of the page): gas molecules land on and leave a solid
  surface. In Langmuir mode each site holds at most one molecule; in BET mode molecules stack into
  multilayers, coloured by layer (1, 2, 3+), with the live coverage θ or n/nₘ shown next to it.
- Controls under the animation: model toggle, pressure P/P₀, Langmuir K and BET c, plus preset cases.
- A smaller **isotherm** plot that tracks the current pressure with a single marker.
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
src/siteConfig.ts              Author and course name shown in the footer
src/pages/HomePage.tsx         Homepage with tool cards
src/lib/useHashRoute.ts        Tiny hash-based router (works on GitHub Pages)
src/pages/AdsorptionPage.tsx   "Langmuir vs BET Adsorption" page (molecular view, controls, isotherm, equations)
src/components/SurfaceView.tsx Animated canvas: gas molecules adsorbing on the surface
src/components/Tex.tsx         KaTeX loader (CDN) and equation component
src/components/Plot.tsx        Plotly wrapper (uses the smaller "basic" Plotly bundle)
src/lib/adsorption.ts          Isotherm equations and per-site stack heights
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
https://<your-github-username>.github.io/interface-lab/
```

Because the site lives under `/interface-lab/` rather than the domain root, `vite.config.ts`
sets `base: "/interface-lab/"` so the built JS and CSS paths point to the right place.
**If you rename the repository, update `base` to the new name.**

### One-time setup

In the repository on GitHub, go to **Settings → Pages**, and under
**Build and deployment → Source** choose **GitHub Actions**. After that, each push to
`main` deploys the site.
