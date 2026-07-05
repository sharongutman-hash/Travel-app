// Optional post-build smoke test (requires Playwright: `npm i -D @playwright/test`).
// Run: npx playwright test scripts/smoke.mjs  (start `npm run preview` first, or
// point BASE at a running dev server). Asserts core routes render error-free.
import { test, expect } from '@playwright/test'
import { trip } from '../src/tripData.js'

const BASE = process.env.BASE || 'http://localhost:4173'
const base = process.env.VITE_BASE || '/'
const url = p => new URL(base.replace(/\/$/, '') + p, BASE).toString()

for (const path of ['/', `/trip/${trip.slug}`, `/trip/${trip.slug}/day/1`]) {
  test(`renders ${path} without console errors`, async ({ page }) => {
    const errors = []
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    page.on('pageerror', e => errors.push(String(e)))
    await page.goto(url(path), { waitUntil: 'networkidle' })
    await expect(page.locator('body')).toBeVisible()
    expect(errors, errors.join('\n')).toHaveLength(0)
  })
}
