import { useEffect, useRef } from 'react'
import { SUBTOPICS } from '../data/subtopics'
import { TRAINERS } from '../data/trainers'
import { SITE_LINKS } from '../data/nav'
import { buildMenu, isCurrent, type MenuLink } from '../lib/menu'

const SECTIONS = buildMenu(SUBTOPICS, TRAINERS)

/** Below this width the menu is a drawer opened from the header; above it, a sticky sidebar. Matches index.css. */
export const DRAWER_QUERY = '(max-width: 1023px)'

function Links({ links, route }: { links: MenuLink[]; route: string }) {
  return (
    <ul className="menu-links">
      {links.map((l) => {
        const current = isCurrent(l.href, route)
        return (
          <li key={l.href}>
            <a href={l.href} className={current ? 'current' : undefined} aria-current={current ? 'page' : undefined}>
              {l.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

interface SideMenuProps {
  route: string
  /** Drawer state (phones and tablets); ignored on desktop, where the menu is always shown. */
  open: boolean
  /** `restoreFocus`: send focus back to the menu button (not when the drawer closes because a link was followed). */
  onClose: (restoreFocus: boolean) => void
  /** Desktop: fold the sidebar away to the side. */
  onHide: () => void
  /** Desktop: the sidebar is folded away (its links are then out of the tab order too). */
  hidden: boolean
}

/**
 * The site menu: every finished page grouped by topic, then the trainers. On desktop it is a sticky sidebar that
 * folds away to the side (header menu button or "Hide menu"); on narrow screens a drawer. While the drawer is open the rest of the page is inert (App.tsx),
 * so Tab stays inside it; Esc, the close button, the backdrop and following a link all close it.
 */
export default function SideMenu({ route, open, onClose, onHide, hidden }: SideMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {open && <div className="menu-backdrop" onClick={() => onClose(true)} aria-hidden="true" />}
      <nav
        id="site-menu"
        className={open ? 'side-menu open' : 'side-menu'}
        aria-label="Site menu"
        inert={hidden}
        onClick={(e) => {
          // Following a link closes the drawer (the route change does too, but not when the link is the current page).
          if ((e.target as HTMLElement).closest('a')) onClose(false)
        }}
      >
        <div className="menu-drawer-head">
          <span className="menu-drawer-title">Menu</span>
          <button ref={closeRef} type="button" className="menu-close" onClick={() => onClose(true)} aria-label="Close menu">
            ×
          </button>
        </div>
        <button type="button" className="menu-hide" onClick={onHide}>
          <span aria-hidden="true">«</span> Hide menu
        </button>
        <div className="menu-section menu-site-links">
          <Links links={SITE_LINKS} route={route} />
        </div>
        {SECTIONS.map((s) => (
          <div key={s.heading} className="menu-section">
            <h2 className="menu-heading">{s.heading}</h2>
            {s.links.length > 0 ? <Links links={s.links} route={route} /> : <p className="menu-empty">Coming soon</p>}
          </div>
        ))}
      </nav>
    </>
  )
}
