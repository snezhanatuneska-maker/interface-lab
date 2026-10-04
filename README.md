# Interface Engineering Lab

Interactive educational tools for interface engineering in clean energy processes.

The first tool (in progress) is a **Langmuir vs BET adsorption isotherm** simulator.
Right now the page only shows a placeholder curve with one slider, to prove that the
interactive plotting works. No adsorption physics is implemented yet.

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
src/App.tsx                    Site layout: header, main area, footer
src/pages/AdsorptionPage.tsx   "Langmuir vs BET Adsorption" page (placeholder curve + slider)
src/components/Plot.tsx        Plotly wrapper (uses the smaller "basic" Plotly bundle)
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
