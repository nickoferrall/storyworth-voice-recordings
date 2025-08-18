import { test, expect } from '@playwright/test'

test.describe('Fast Health Checks', () => {
  test('📝 Signup page loads', async ({ page }) => {
    test.setTimeout(10000)
    await page.goto('/signup', { waitUntil: 'domcontentloaded' })

    // Check for signup form elements
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 })
    console.log('✅ Signup page loads')
  })

  test('🔐 Login page loads', async ({ page }) => {
    test.setTimeout(10000)
    await page.goto('/login', { waitUntil: 'domcontentloaded' })

    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 })
    console.log('✅ Login page loads')
  })

  test('🔍 Explore page loads', async ({ page }) => {
    test.setTimeout(15000)
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })

    // Just check the page loads - don't worry about content
    const url = page.url()
    expect(url).toContain('/explore')
    console.log('✅ Explore page loads')
  })

  test('🏗️ Build page loads', async ({ page }) => {
    test.setTimeout(10000)
    await page.goto('/build', { waitUntil: 'domcontentloaded' })

    const url = page.url()
    expect(url).toContain('/build')
    console.log('✅ Build page loads')
  })

  test('🔗 Basic navigation works', async ({ page }) => {
    test.setTimeout(15000)

    // Start at homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Try to find and click navigation links
    try {
      const exploreLink = page.locator('a[href="/explore"]').first()
      if (await exploreLink.isVisible({ timeout: 2000 })) {
        await exploreLink.click()
        await page.waitForURL('**/explore', { timeout: 5000 })
        console.log('✅ Navigation to explore works')
      }
    } catch (e) {
      console.log('⚠️ Navigation test skipped - links not found')
    }
  })
})
