import { test, expect } from '@playwright/test'

// Generate unique test data
const generateTestUser = () => ({
  email: `test-${Date.now()}@fitlo-test.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
})

test.describe.serial('Authentication Flow', () => {
  let testUser: ReturnType<typeof generateTestUser>
  let storageState: any

  test.beforeAll(() => {
    testUser = generateTestUser()
  })

  test('should complete signup flow', async ({ page, context }) => {
    console.log(`🧪 Testing signup with: ${testUser.email}`)

    // 1. Go to signup page
    await page.goto('/signup')

    // 2. Verify we're on the right page
    await expect(page.locator('h2:has-text("Sign Up")')).toBeVisible()

    // 3. Fill out signup form
    await page.fill('input[placeholder="First Name"]', testUser.firstName)
    await page.fill('input[placeholder="Last Name"]', testUser.lastName)
    await page.fill('input[placeholder="example@email.com"]', testUser.email)
    await page.fill('input[placeholder="********"]', testUser.password)

    // 4. Submit signup
    await page.click('button[type="submit"]')

    // 5. Wait for redirect (should go to /create based on signup code)
    await page.waitForURL(/\/create/, { timeout: 10000 })

    // 6. Verify we're on the create page
    await expect(page).toHaveURL(/\/create/)

    // 7. Save the storage state (cookies, localStorage, etc.) for next tests
    storageState = await context.storageState()

    console.log(`✅ Signup successful! User redirected to: ${page.url()}`)
  })

  test('should logout successfully', async ({ browser }) => {
    console.log(`🧪 Testing logout flow (using saved session state)`)

    // 1. Create new context with saved storage state
    const context = await browser.newContext({ storageState })
    const page = await context.newPage()

    // 2. Go to create page (user should be logged in from storage state)
    await page.goto('/create')

    // 3. Find and click the avatar button in header
    const headerButtons = page.locator('header button')
    await expect(headerButtons.first()).toBeVisible({ timeout: 5000 })
    await headerButtons.first().click()

    // 4. Wait for dropdown and click logout
    await page.waitForSelector('text=Logout', { timeout: 5000 })
    await page.click('text=Logout')

    // 5. Should be redirected to home page
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')

    // 6. Verify user is logged out - should see "Sign In" link
    await expect(page.locator('text=Sign In')).toBeVisible()

    console.log(`✅ Logout successful! User redirected to: ${page.url()}`)

    await context.close()
  })

  test('should login with existing credentials', async ({ page }) => {
    console.log(`🧪 Testing login with existing user: ${testUser.email}`)

    // 1. Go to login page
    await page.goto('/login')

    // 2. Verify we're on the login page
    await expect(page.locator('h2:has-text("Login")')).toBeVisible()

    // 3. Fill out login form
    await page.fill('input[placeholder="example@email.com"]', testUser.email)
    await page.fill('input[placeholder="********"]', testUser.password)

    // 4. Submit login
    await page.click('button[type="submit"]')

    // 5. Should be redirected to create page (based on login code)
    await page.waitForURL(/\/create/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/create/)

    // 6. Verify user is logged in - avatar should be visible
    const headerButtons = page.locator('header button')
    await expect(headerButtons.first()).toBeVisible({ timeout: 5000 })

    console.log(`✅ Login successful! User redirected to: ${page.url()}`)
  })
})
