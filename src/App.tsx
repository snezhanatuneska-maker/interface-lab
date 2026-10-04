import { lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import { useHashRoute } from './lib/useHashRoute'
import { AUTHOR, COURSE } from './siteConfig'

// Loaded on demand so the homepage does not pull in Plotly.
const AdsorptionPage = lazy(() => import('./pages/AdsorptionPage'))

export default function App() {
  const route = useHashRoute()

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <a className="site-title" href="#/">
            Interface Engineering Lab
          </a>
          <span className="site-subtitle">Interactive tools for CEP</span>
        </div>
      </header>

      <main className="container">
        {route === '/adsorption' ? (
          <Suspense fallback={<p className="loading">Loading simulator…</p>}>
            <AdsorptionPage />
          </Suspense>
        ) : (
          <HomePage />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>{AUTHOR}</span>
          <span>{COURSE}</span>
        </div>
      </footer>
    </div>
  )
}
