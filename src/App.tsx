import { lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import ThemeToggle from './components/ThemeToggle'
import { useHashRoute } from './lib/useHashRoute'
import { AUTHOR, COURSE, REVISED } from './siteConfig'

// Loaded on demand so the homepage does not pull in Plotly.
const AdsorptionPage = lazy(() => import('./pages/AdsorptionPage'))

export default function App() {
  const route = useHashRoute()

  return (
    <div className="app">
      <header className="site-header">
        <div className="sheet-row">
          <a className="site-title" href="#/">
            Interface Engineering Lab
          </a>
          <span className="site-course">{COURSE} · course notes</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="sheet">
        {route === '/adsorption' ? (
          <Suspense fallback={<p className="loading">Loading the simulation...</p>}>
            <AdsorptionPage />
          </Suspense>
        ) : (
          <HomePage />
        )}
      </main>

      <footer className="site-footer">
        <div className="sheet-row">
          <span>{AUTHOR}</span>
          <span>{COURSE}</span>
          <span>rev. {REVISED}</span>
        </div>
      </footer>
    </div>
  )
}
