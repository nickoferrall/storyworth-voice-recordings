import { test, expect } from '@playwright/test'

const testData = {
  email: `test-user-${Date.now()}@fitlo-test.com`,
  password: 'testing123',
  firstName: 'Test',
  lastName: 'User',
}

test('User Signup Flow', async ({ page }) => {
  test.setTimeout(60000) // 1 minute timeout

  console.log('🔐 Testing user signup flow')
  console.log('Test email:', testData.email)
  console.log('🌍 Environment check:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NODE_ENV:', process.env.NODE_ENV)

  // Navigate to signup page
  await page.goto('/signup')
  console.log('✅ Navigated to signup page')

  // Fill signup form using placeholder text
  await page.getByPlaceholder('First Name').fill(testData.firstName)
  await page.getByPlaceholder('Last Name').fill(testData.lastName)
  await page.getByPlaceholder('example@email.com').fill(testData.email)
  await page.getByPlaceholder('********').fill(testData.password)
  console.log('✅ Filled signup form')

  // Submit signup form
  await page.getByRole('button', { name: 'Sign Up' }).click()
  console.log('✅ Submitted signup form')

  // Wait for success - signup redirects to /create page
  await page.waitForURL(/\/create/, { timeout: 10000 })
  console.log('✅ Signup completed - redirected to:', page.url())

  // Verify we're on the create page (indicating successful signup)
  expect(page.url()).toContain('/create')
  console.log('🎉 User signup test passed!')
  console.log('📧 User created with email:', testData.email)
})
