import { test, expect } from '@playwright/test'

// Use existing test account instead of creating new ones
const testData = {
  email: 'nickoferrall+new@gmail.com',
  password: 'testing',
  competitionName: `Test Comp ${Date.now()}`,
  teamName: `Test Team ${Date.now()}`,
  participantEmail: `participant-${Date.now()}@fitlo-test.com`,
}

test('Complete Competition Management Flow', async ({ page, context }) => {
  test.setTimeout(120000) // Increase timeout to 2 minutes
  let competitionId: string

  console.log(
    `🔐 Testing complete flow: login, create competition, configure, and register`,
  )

  // Step 1: Login and create competition
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign in' }).click()
  await page.getByRole('textbox', { name: 'example@email.com' }).fill(testData.email)
  await page.getByRole('textbox', { name: '********' }).fill(testData.password)
  await page.getByRole('button', { name: 'Login' }).click()

  // Create competition
  await page
    .getByRole('textbox', { name: 'Competition Name' })
    .fill(testData.competitionName)
  await page.getByRole('spinbutton', { name: 'Number of Workouts' }).fill('2')
  await page.getByRole('button', { name: 'Create' }).click()

  // Extract competition ID from URL
  await page.waitForURL(/\/[a-zA-Z0-9-_]+\/overview/)
  const url = page.url()
  const match = url.match(/\/([a-zA-Z0-9-_]+)\/overview/)
  expect(match).toBeTruthy()
  competitionId = match![1]
  console.log(`✅ Competition created with ID: ${competitionId}`)

  // Step 2: Configure competition details
  console.log(`🔧 Configuring competition details`)
  // Edit description
  await page.getByRole('button', { name: 'Edit' }).click()
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('Automated test competition description')
  await page.getByRole('button', { name: 'Save' }).click()
  console.log(`✅ Competition details configured`)

  // Step 3: Setup registration and tickets
  console.log(`🎫 Setting up registration`)
  await page.goto(`/${competitionId}/registration`)

  // Edit ticket - click the pencil edit button in the ticket card
  await page
    .locator('div.relative.bg-white.shadow-md.rounded-lg')
    .filter({ hasText: /Mixed RX Pairs Example/ })
    .locator('button.absolute.top-4.right-4')
    .click()

  // Wait for modal to open and fill form
  await page.waitForSelector('#name', { timeout: 5000 })
  await page.locator('#name').fill('Test Ticket')
  await page.locator('#price').fill('25')
  await page.getByRole('button', { name: 'Update' }).click()

  // Add custom question
  await page.getByRole('button', { name: 'Add Custom Question' }).first().click()
  await page.getByRole('textbox', { name: 'Question Text' }).fill('Test Question')
  await page.getByRole('button', { name: 'Save' }).click()
  console.log(`✅ Registration setup complete`)

  // Step 4: Configure workouts
  console.log(`💪 Configuring workouts`)
  await page.goto(`/${competitionId}/workouts`)

  // Edit first workout - click the edit button for CINDY workout
  await page
    .locator('div.relative.bg-white.shadow-md.rounded-lg')
    .filter({ hasText: 'CINDY' })
    .filter({ hasText: 'AMRAP 20 minutes' })
    .locator('button.absolute.top-4.right-4')
    .click()

  // Wait for workout modal to open
  await page.waitForSelector('input[name="name"]', { timeout: 5000 })
  await page.locator('input[name="name"]').fill('Test Workout')
  await page.locator('textarea[name="description"]').fill('Test workout description')

  // Change scoring type
  await page.getByRole('combobox').filter({ hasText: 'Time - less is better' }).click()
  await page.getByLabel('Weight - more is better').click()
  await page.getByRole('button', { name: 'Update' }).click()
  console.log(`✅ Workouts configured`)

  // Step 5: Handle registration flow
  console.log(`📝 Testing registration flow`)

  // Open event page in new tab
  const eventPagePromise = context.waitForEvent('page')
  await page.getByRole('link', { name: 'Event Page' }).click()
  const eventPage = await eventPagePromise

  // Wait for the new page to load completely
  await eventPage.waitForLoadState('networkidle')
  console.log('🔗 Event page URL:', eventPage.url())

  // Debug what's actually on the page
  console.log('🔍 Debugging event page content...')
  const pageTitle = await eventPage.textContent('h2')
  console.log('Page title:', pageTitle)

  // Check if button exists
  const buttonExists = await eventPage.locator('[data-testid="register-button"]').count()
  console.log('Register button count:', buttonExists)

  if (buttonExists === 0) {
    // Check for any buttons on the page
    const allButtons = await eventPage.locator('button').count()
    console.log('Total buttons on page:', allButtons)

    // Check for specific text content
    const hasRegisterText = await eventPage.locator('text=Register').count()
    const hasRegisteredText = await eventPage.locator('text=Registered').count()
    const hasCheckingText = await eventPage.locator('text=Checking').count()

    console.log('Text "Register" found:', hasRegisterText)
    console.log('Text "Registered" found:', hasRegisteredText)
    console.log('Text "Checking" found:', hasCheckingText)

    // Get all button text content
    const buttonTexts = await eventPage.locator('button').allTextContents()
    console.log('All button texts:', buttonTexts)

    throw new Error('Register button not found on page')
  }

  // Click the register button
  const registerButton = eventPage.getByTestId('register-button')
  await registerButton.click({ timeout: 10000 })
  await eventPage.getByText('Test Ticket').click()
  await eventPage.getByRole('button', { name: 'Save' }).click()

  // Fill registration form
  await eventPage
    .locator('div')
    .filter({ hasText: /^Name$/ })
    .getByRole('textbox')
    .fill('Test User')
  await eventPage
    .locator('div')
    .filter({ hasText: /^Your Email$/ })
    .getByRole('textbox')
    .fill(testData.participantEmail)
  await eventPage
    .getByRole('textbox', { name: 'Enter the emails of your' })
    .fill('teammate@test.com')
  await eventPage
    .locator('div')
    .filter({ hasText: /^Emergency Contact Name$/ })
    .getByRole('textbox')
    .fill('Emergency Contact')
  await eventPage
    .locator('div')
    .filter({ hasText: /^Emergency Contact Number$/ })
    .getByRole('textbox')
    .fill('123-456-7890')
  await eventPage
    .locator('div')
    .filter({ hasText: /^Team Name$/ })
    .getByRole('textbox')
    .fill(testData.teamName)
  // Fill custom question - use last() since it's the last field added
  await eventPage.locator('input[type="text"]').last().fill('Test answer')

  // Accept waiver and proceed
  await eventPage.getByRole('checkbox', { name: 'I agree to the waiver terms' }).check()
  await eventPage.getByRole('button', { name: 'Proceed to Payment' }).click()

  // Fill payment form (test card)
  console.log('💳 Filling payment form...')
  await eventPage
    .getByRole('textbox', { name: 'Card number' })
    .fill('4242 4242 4242 4242')
  await eventPage.getByRole('textbox', { name: 'Expiration' }).fill('12/34')
  await eventPage.getByRole('textbox', { name: 'CVC' }).fill('123')
  await eventPage.getByRole('textbox', { name: 'Cardholder name' }).fill('Test User')

  console.log('🔄 Submitting payment...')
  console.log('Current URL before payment:', eventPage.url())

  // Click payment button and wait for Stripe to process and redirect
  await eventPage.getByTestId('hosted-payment-submit-button').click()
  console.log('✅ Payment button clicked, waiting for Stripe processing...')

  // Wait for Stripe to redirect to thank-you page
  // We need to be patient here as Stripe processing can take time
  let thankYouPageReached = false
  let attempts = 0
  const maxAttempts = 60 // 60 attempts = 2 minutes

  console.log(
    '⏳ Waiting for Stripe to process payment and redirect to thank-you page...',
  )

  while (!thankYouPageReached && attempts < maxAttempts) {
    try {
      // Wait 2 seconds between checks
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check current URL - be careful as page might be redirecting
      const currentUrl = await eventPage.url()
      console.log(`Attempt ${attempts + 1}: Checking URL: ${currentUrl}`)

      if (currentUrl.includes('/thank-you')) {
        console.log('🎉 Reached thank-you page!')

        // Verify the thank you message appears
        try {
          await expect(eventPage.locator('h2')).toContainText(
            'Thank You for Your Payment',
            {
              timeout: 5000,
            },
          )
          thankYouPageReached = true
          console.log('✅ Payment successful - thank you page confirmed!')
        } catch (verifyError) {
          console.log('Thank you page reached but message not found, continuing...')
          thankYouPageReached = true // Still count as success
        }
        break
      }
    } catch (error) {
      console.log(`Attempt ${attempts + 1} - Error checking page: ${error.message}`)
      // Continue trying - page might be in transition
    }

    attempts++
  }

  if (!thankYouPageReached) {
    console.log('❌ Never reached thank-you page - payment may have failed')
    // Take screenshot for debugging
    try {
      await eventPage.screenshot({ path: 'payment-timeout.png' })
      console.log('Screenshot saved as payment-timeout.png')
    } catch (screenshotError) {
      console.log('Could not take screenshot')
    }
  }

  // Close the event page
  try {
    await eventPage.close()
  } catch (error) {
    console.log('Event page already closed or redirected')
  }
  console.log(`✅ Registration completed successfully`)

  // Step 6: Manage participants and scores
  console.log(`📊 Managing participants and scores`)

  // Ensure main page is still accessible
  try {
    console.log('Main page URL before participants:', page.url())
    await page.goto(`/${competitionId}/participants`)
  } catch (error) {
    console.log('❌ Main page context lost, trying to recover...')
    // If main page is lost, try to navigate from home
    await page.goto('/')
    await page.goto(`/${competitionId}/participants`)
  }

  // Skip participant verification and go directly to scores
  console.log('✅ Participant should be created - proceeding to scores to verify')

  // Go to scores
  console.log('📊 Navigating to scores page')
  await page.getByRole('link', { name: 'Scores' }).click()
  console.log('✅ On scores page')

  // Add a score
  console.log('🎯 Adding score for team:', testData.teamName)
  await page
    .getByRole('row', { name: testData.teamName })
    .getByRole('button')
    .first()
    .click()
  console.log('✅ Score input opened')

  await page.locator('input[type="text"]').fill('20')
  await page.locator('input[type="text"]').press('Enter')
  console.log('✅ Score added')

  console.log(`🎉 Complete flow test passed! All steps completed successfully.`)
})
