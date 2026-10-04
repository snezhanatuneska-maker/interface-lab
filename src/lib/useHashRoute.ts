import { useEffect, useState } from 'react'

// Minimal hash router: "#/adsorption" → "/adsorption". Hash URLs work on GitHub Pages
// without any server-side rewrite rules.
function current(): string {
  const h = window.location.hash.replace(/^#/, '')
  return h === '' ? '/' : h
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const onChange = () => {
      setRoute(current())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
