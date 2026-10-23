import { lazy, Suspense } from 'react';
import HomePage from './pages/HomePage';
import ThemeToggle from './components/ThemeToggle';
import { useHashRoute } from './lib/useHashRoute';
import { COURSE } from './siteConfig';
import { ZetaPage } from './pages/zeta/ZetaPage';
import { DlvoPage } from './pages/dlvo/DlvoPage';
import { MipsPage } from './pages/mips/MipsPage';

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
          
          {/* Navigation Links */}
          <nav className="mt-2 space-x-4">
            <a href="#/adsorption" className="text-blue-600 hover:underline font-medium">Adsorption Lab</a>
            <a href="#/capillary" className="text-blue-600 hover:underline font-medium">Capillary Pressure</a>
            <a href="#/zeta" className="text-blue-600 hover:underline font-medium">Zeta Potential</a>
            <a href="#/dlvo" className="text-blue-600 hover:underline font-medium">DLVO Theory</a>
            <a href="#/mips" className="text-blue-600 hover:underline font-medium">Mercury Porosimetry</a>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="container">
        {route === '/mips' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <MipsPage />
          </Suspense>
        ) : route === '/dlvo' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <DlvoPage />
          </Suspense>
        ) : route === '/zeta' ? (
          <Suspense fallback={<p className="loading">Loading simulator...</p>}>
            <ZetaPage />
          </Suspense>
        ) : route === '/capillary' ? (
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
        ) :  (
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
