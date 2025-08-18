import { test, expect } from '@playwright/test'

test.describe('Health Checks', () => {
  test('🏠 Testing homepage', async ({ page }) => {
    test.setTimeout(15000) // Reduce from default 60s to 15s
    console.log('🏠 Testing homepage')

    await page.goto('/', { waitUntil: 'domcontentloaded' }) // Faster than networkidle
    await expect(page).toHaveTitle(/Fitlo/)
    console.log('✅ Homepage loads successfully')
  })

  test('📝 Testing signup page', async ({ page }) => {
    test.setTimeout(15000)
    console.log('📝 Testing signup page')

    await page.goto('/signup', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    console.log('✅ Signup page loads successfully')
  })

  test('🔐 Testing login page', async ({ page }) => {
    test.setTimeout(15000)
    console.log('🔐 Testing login page')

    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeVisible()
    console.log('✅ Login page loads successfully')
  })

  test('🔍 Testing explore page', async ({ page }) => {
    test.setTimeout(20000) // Slightly longer for data loading
    console.log('🔍 Testing explore page')

    await page.goto('/explore', { waitUntil: 'domcontentloaded' })

    // Wait for either events to load or loading state to appear
    await Promise.race([
      page.waitForSelector('[data-testid="event-card"]', { timeout: 10000 }),
      page.waitForSelector('.animate-pulse', { timeout: 5000 }), // Loading skeleton
      page.waitForSelector('text=No events', { timeout: 5000 }), // Empty state
    ])

    console.log('✅ Explore page loads successfully')
  })

  test('🔌 Testing GraphQL endpoint', async ({ request }) => {
    test.setTimeout(10000) // API calls should be fast
    console.log('🔌 Testing GraphQL endpoint')

    const response = await request.post('/api/graphql', {
      data: {
        query: `
          query {
            __schema {
              types {
                name
              }
            }
          }
        `,
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.data.__schema.types.length).toBeGreaterThan(0)
    console.log('✅ GraphQL endpoint is working')
  })
})
