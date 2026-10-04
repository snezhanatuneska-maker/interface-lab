import AdsorptionPage from './pages/AdsorptionPage'

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <span className="site-title">Interface Engineering Lab</span>
          <span className="site-subtitle">Interactive tools for clean energy processes</span>
        </div>
      </header>

      <main className="container">
        <AdsorptionPage />
      </main>

      <footer className="site-footer">
        <div className="container">Interface Engineering Lab · educational use</div>
      </footer>
    </div>
  )
}
