import { test, expect } from '@playwright/test'

// Using the existing competition from your URL
const competitionId = 'eErhBY'

test('Athlete Leaderboard View', async ({ page }) => {
  test.setTimeout(60000) // 1 minute timeout

  console.log('🏆 Testing athlete leaderboard view')
  console.log('Competition ID:', competitionId)

  // Navigate to the event page with leaderboard parameter
  await page.goto(`/event/${competitionId}?sl=true`)
  console.log('✅ Navigated to event page with leaderboard')

  // Wait for page to load
  await page.waitForLoadState('networkidle')
  console.log('✅ Page loaded')

  // Look for the "View Leaderboard" button
  const leaderboardButton = page.getByRole('button', { name: 'View Leaderboard' })
  await expect(leaderboardButton).toBeVisible({ timeout: 10000 })
  console.log('✅ Found "View Leaderboard" button')

  // Click the leaderboard button to open modal
  await leaderboardButton.click()
  console.log('✅ Clicked leaderboard button')

  // Wait for leaderboard modal to open - could be loading initially
  const leaderboardHeading = page.locator('h2').filter({ hasText: /Leaderboard/ })
  await expect(leaderboardHeading).toBeVisible({ timeout: 10000 })
  console.log('✅ Leaderboard modal opened')

  // Wait for loading to complete if it's in loading state
  const loadingText = page.locator('text=Please wait while we fetch')
  if (await loadingText.isVisible()) {
    console.log('⏳ Leaderboard is loading, waiting for data...')
    await expect(loadingText).not.toBeVisible({ timeout: 15000 })
    console.log('✅ Leaderboard data loaded')
  }

  // Verify leaderboard table is visible with data
  await expect(page.locator('table')).toBeVisible()
  console.log('✅ Leaderboard table visible')

  // Verify there are leaderboard entries (at least one row of data)
  const leaderboardRows = page.locator('table tbody tr')
  await expect(leaderboardRows.first()).toBeVisible({ timeout: 5000 })
  console.log('✅ Leaderboard entries visible')

  // Check for category filters (All, Rx female, Rx male, etc.) - look for tab specifically
  await expect(page.getByRole('tab', { name: 'All' })).toBeVisible()
  console.log('✅ Category filters visible')

  // Test filtering by clicking on a category (e.g., "Rx female")
  const rxFemaleFilter = page.getByRole('tab', { name: 'Rx female' })
  if (await rxFemaleFilter.isVisible()) {
    await rxFemaleFilter.click()
    console.log('✅ Clicked Rx female filter')

    // Wait for results to update
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Showing results for: Rx female')).toBeVisible()
    console.log('✅ Filter applied successfully')
  }

  // Test search functionality if search box is visible
  const searchBox = page.locator('input[placeholder*="Search"]')
  if (await searchBox.isVisible()) {
    await searchBox.fill('Test')
    console.log('✅ Tested search functionality')
  }

  // Close modal by clicking X or outside
  const closeButton = page.locator('button:has-text("×")').first()
  if (await closeButton.isVisible()) {
    await closeButton.click()
    console.log('✅ Closed leaderboard modal')
  }

  console.log('🎉 Athlete leaderboard test passed!')
})
