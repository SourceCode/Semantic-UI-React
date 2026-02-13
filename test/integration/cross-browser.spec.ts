import { test, expect } from '@playwright/test'

test.describe('Cross-browser component rendering', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Button page renders', async ({ page }) => {
    await page.goto('/elements/button')
    const button = page.locator('.ui.button').first()
    await expect(button).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('a[href="/usage"]').first()
    await link.click()
    await expect(page.locator('h1')).toContainText('Getting Started')
  })
})
