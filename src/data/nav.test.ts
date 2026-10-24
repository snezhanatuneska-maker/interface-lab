import { describe, expect, it } from 'vitest'
import appSource from '../App.tsx?raw'
import { SITE_LINKS } from './nav'

describe('header links', () => {
  it('are Home, Demos, Training and About, each a route App.tsx renders', () => {
    expect(SITE_LINKS.map((l) => l.title)).toEqual(['Home', 'Demos', 'Training', 'About'])
    for (const l of SITE_LINKS.slice(1)) expect(appSource).toContain(`route === '${l.href.slice(1)}'`)
    expect(appSource).toContain('href="#/about"') // footer link
  })
})
