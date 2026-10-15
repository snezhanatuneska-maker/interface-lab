import { lazy, Suspense } from 'react';
import HomePage from './pages/HomePage';
import ThemeToggle from './components/ThemeToggle';
import { useHashRoute } from './lib/useHashRoute';
import { COURSE } from './siteConfig';

// Loaded on demand
const AdsorptionPage = lazy(() => import('./pages/AdsorptionPage'));
const CapillaryPage = lazy(() => import('./pages/CapillaryPage'));
const SurfactantPage = lazy(() => import('./pages/SurfactantPage'));
const WettingPage = lazy(() => import('./pages/WettingPage'));
const VdwPage = lazy(() => import('./pages/VdwPage'));

export default function App() {
  const route = useHashRoute();

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <a className="site-title" href="#/">
            Interface Engineering Lab
          </a>
          <span className="site-subtitle">Interactive tools for Clean Energy Processes (CEP)</span>

          <ThemeToggle />
        </div>
      </header>

      <main className="container">
        {route === '/capillary' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <CapillaryPage />
          </Suspense>
        ) : route === '/surfactants' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <SurfactantPage />
          </Suspense>
        ) : route === '/wetting' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <WettingPage />
          </Suspense>
        ) : route === '/van-der-waals' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <VdwPage />
          </Suspense>
        ) : route === '/adsorption' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <AdsorptionPage />
          </Suspense>
        ) : (
          <HomePage />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>{COURSE}</span>
        </div>
      </footer>
    </div>
  );
}
