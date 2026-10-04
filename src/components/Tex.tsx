import { useEffect, useState, type ReactNode } from 'react'

// KaTeX is loaded from a CDN on first use, so only pages with equations pay for it.
const KATEX_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/'

interface KatexApi {
  renderToString(tex: string, options?: { displayMode?: boolean; throwOnError?: boolean }): string
}

declare global {
  interface Window {
    katex?: KatexApi
  }
}

let katexPromise: Promise<KatexApi | null> | null = null

function loadKatex(): Promise<KatexApi | null> {
  if (window.katex) return Promise.resolve(window.katex)
  katexPromise ??= new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${KATEX_BASE}katex.min.css`
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = `${KATEX_BASE}katex.min.js`
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve(window.katex ?? null)
    script.onerror = () => resolve(null) // offline: keep the HTML fallback
    document.head.appendChild(script)
  })
  return katexPromise
}

function useKatex(): KatexApi | null {
  const [katex, setKatex] = useState<KatexApi | null>(() => window.katex ?? null)
  useEffect(() => {
    if (katex) return
    let alive = true
    loadKatex().then((k) => alive && setKatex(k))
    return () => {
      alive = false
    }
  }, [katex])
  return katex
}

interface TexProps {
  tex: string
  display?: boolean
  /** Shown until KaTeX has loaded, or if the CDN is unreachable. */
  fallback: ReactNode
}

/** Renders a LaTeX string with KaTeX (inline by default). */
export default function Tex({ tex, display = false, fallback }: TexProps) {
  const katex = useKatex()
  if (!katex) return <span className={display ? 'tex-display tex-fallback' : 'tex-fallback'}>{fallback}</span>
  return (
    <span
      className={display ? 'tex-display' : undefined}
      dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: display, throwOnError: false }) }}
    />
  )
}

/** HTML fraction used in fallbacks. */
export function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className="frac">
      <span>{n}</span>
      <span>{d}</span>
    </span>
  )
}
