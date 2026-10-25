import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import HomePage from './pages/HomePage';
import ThemeToggle from './components/ThemeToggle';
import SideMenu, { DRAWER_QUERY } from './components/SideMenu';
import { SITE_LINKS } from './data/nav';
import { inSection, loadMenuHidden, saveMenuHidden } from './lib/menu';
import { trainerAt } from './data/trainers';
import PracticeLinks from './components/PracticeLinks';
import { useHashRoute } from './lib/useHashRoute';
import { COURSE } from './siteConfig';
import { ZismanPage } from './pages/zisman/ZismanPage';

// Loaded on demand
const AdsorptionPage = lazy(() => import('./pages/AdsorptionPage'));
const CapillaryPage = lazy(() => import('./pages/CapillaryPage'));
const SurfactantPage = lazy(() => import('./pages/SurfactantPage'));
const WettingPage = lazy(() => import('./pages/WettingPage'));
const VdwPage = lazy(() => import('./pages/VdwPage'));
const ZetaPage = lazy(() => import('./pages/zeta/ZetaPage').then((m) => ({ default: m.ZetaPage })));
const DlvoPage = lazy(() => import('./pages/dlvo/DlvoPage').then((m) => ({ default: m.DlvoPage })));
const EdlPage = lazy(() => import('./pages/EdlPage'));
const CrystalPage = lazy(() => import('./pages/CrystalPage'));
const PhaseSeparationPage = lazy(() => import('./pages/PhaseSeparationPage'))
const NucleationPage = lazy(() => import('./pages/NucleationPage'));
const DemosPage = lazy(() => import('./pages/DemosPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const TrainerPage = lazy(() => import('./pages/training/TrainerPage'));
const MipsPage = lazy(() => import('./pages/mips/MipsPage').then((m) => ({ default: m.MipsPage })));
const SurfaceExplorerPage = lazy(() => import('./pages/surface-explorer/SurfaceExplorerPage').then((m) => ({ default: m.SurfaceExplorerPage })));

export default function App() {
  const route = useHashRoute();
  const trainer = trainerAt(route);
  const [menuOpen, setMenuOpen] = useState(false); // drawer, below 1024 px
  const [menuHidden, setMenuHidden] = useState(loadMenuHidden); // sidebar folded away, desktop
  const [isDrawer, setIsDrawer] = useState(() => window.matchMedia(DRAWER_QUERY).matches);
  const menuButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  const closeMenu = useCallback((restore: boolean) => {
    restoreFocus.current = restore;
    setMenuOpen(false);
  }, []);
  // Focus goes back to the menu button once the header is no longer inert, i.e. after the re-render.
  useEffect(() => {
    if (menuOpen || !restoreFocus.current) return;
    restoreFocus.current = false;
    menuButton.current?.focus();
  }, [menuOpen]);

  // The drawer closes on navigation, and when the window grows wide enough for the sidebar.
  useEffect(() => setMenuOpen(false), [route]);
  useEffect(() => {
    const mq = window.matchMedia(DRAWER_QUERY);
    const onChange = () => {
      setIsDrawer(mq.matches);
      if (!mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setHidden = (hidden: boolean) => {
    setMenuHidden(hidden);
    saveMenuHidden(hidden);
  };
  // On narrow screens the menu button opens the drawer; on desktop it folds the sidebar away and back.
  const onMenuButton = () => (isDrawer ? setMenuOpen(true) : setHidden(!menuHidden));
  const hideSidebar = () => {
    setHidden(true);
    menuButton.current?.focus();
  };

  return (
    <div className="app">
      <header className="site-header" inert={menuOpen}>
        <div className="container wide">
          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={isDrawer ? menuOpen : !menuHidden}
            aria-controls="site-menu"
            title={isDrawer ? 'Menu' : menuHidden ? 'Show menu' : 'Hide menu'}
            onClick={onMenuButton}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="visually-hidden">{isDrawer ? 'Menu' : menuHidden ? 'Show menu' : 'Hide menu'}</span>
          </button>
          <a className="site-title" href="#/">
            Interface Engineering Lab
          </a>
          <span className="site-subtitle">Interactive tools for Clean Energy Processes (CEP)</span>

          <nav className="header-nav" aria-label="Main">
            {SITE_LINKS.map((l) => (
              <a key={l.href} href={l.href} aria-current={inSection(l.href, route) ? 'page' : undefined}>
                {l.title}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <div className={menuHidden ? 'layout menu-hidden' : 'layout'}>
        <SideMenu route={route} open={menuOpen} onClose={closeMenu} onHide={hideSidebar} hidden={menuHidden && !isDrawer} />
        <main className="layout-main" inert={menuOpen}>
          {route === '/demos' ? (
            <Suspense fallback={<p className="loading">Loading demos...</p>}>
              <DemosPage />
            </Suspense>
          ) : route === '/about' ? (
            <Suspense fallback={<p className="loading">Loading...</p>}>
              <AboutPage />
            </Suspense>
          ) : route === '/training' ? (
            <Suspense fallback={<p className="loading">Loading training...</p>}>
              <TrainingPage />
            </Suspense>
          ) : trainer ? (
            <Suspense fallback={<p className="loading">Loading trainer...</p>}>
              <TrainerPage id={trainer.id} />
            </Suspense>
          ) : route === 'surface-characterisation' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <SurfaceExplorerPage />
            </Suspense>
          ) : route === '/zisman' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <ZismanPage />
            </Suspense>
          ) : route === '/crystal-growth' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <CrystalPage />
            </Suspense>
          ) : route === '/phase-separation' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <PhaseSeparationPage />
            </Suspense>
          ) : route === '/nucleation' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <NucleationPage />
            </Suspense>
          ) : route === '/double-layer' ? (
            <Suspense fallback={<p className="loading">Loading simulator...</p>}>
              <EdlPage />
            </Suspense>
          ) : route === '/mips' ? (
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
          <PracticeLinks route={route} />
        </main>
      </div>

      <footer className="site-footer" inert={menuOpen}>
        <div className="container wide">
          <span>{COURSE}</span>
          <a href="#/about">About</a>
        </div>
      </footer>
    </div>
  );
}
