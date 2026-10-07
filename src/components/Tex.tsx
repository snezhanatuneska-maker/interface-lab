import katex from 'katex'
import 'katex/dist/katex.min.css'

// KaTeX is bundled (not loaded from a CDN), so equations render on the first paint and offline.
// Only pages with equations import this module, so the homepage does not pay for it.

interface TexProps {
  tex: string
  display?: boolean
}

/** Renders a LaTeX string with KaTeX (inline by default). */
export default function Tex({ tex, display = false }: TexProps) {
  return (
    <span
      className={display ? 'tex-display' : undefined}
      dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: display, throwOnError: false }) }}
    />
  )
}
