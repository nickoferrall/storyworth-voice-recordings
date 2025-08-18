#!/usr/bin/env ts-node

import { AretasScraper } from '../scrapers/aretas'
import { CompCornerScraper } from '../scrapers/compCorner'
import { HyroxScraper } from '../scrapers/hyrox'
import MailgunManager from '../lib/MailgunManager'

/**
 * Daily scraper cron job
 * Runs both Aretas and Competition Corner scrapers
 * Inserts results into PotentialCompetition table for admin review
 */
async function runDailyScraper() {
  console.log('🕒 Starting daily scraper cron job...')
  console.log(`Started at: ${new Date().toISOString()}`)

  const results = {
    aretas: { success: false, count: 0, error: null as string | null },
    compCorner: { success: false, count: 0, error: null as string | null },
  }

  // Run HYROX scraper (official HYROX site)
  try {
    console.log('\n🏁 Running HYROX scraper (official site)...')
    const hyroxScraper = new HyroxScraper()
    const hyroxResults = await hyroxScraper.scrapeToStaging()
    console.log(`✅ HYROX scraper completed: ${hyroxResults.length} competitions staged`)
  } catch (error) {
    console.error('❌ HYROX scraper failed:', error)
  }

  // Run Aretas scraper (all competitions)
  try {
    console.log('\n🏃‍♂️ Running Aretas scraper (all competitions)...')
    const aretasScraper = new AretasScraper()
    const aretasResults = await aretasScraper.scrapeToStaging()
    results.aretas.success = true
    results.aretas.count = aretasResults.length
    console.log(
      `✅ Aretas scraper completed: ${aretasResults.length} competitions staged`,
    )
  } catch (error) {
    results.aretas.error = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Aretas scraper failed:', error)
  }

  // Run Competition Corner scraper (all competitions)
  try {
    console.log('\n🏆 Running Competition Corner scraper (all competitions)...')
    const compCornerScraper = new CompCornerScraper()
    const compCornerResults = await compCornerScraper.scrapeToStaging()
    results.compCorner.success = true
    results.compCorner.count = compCornerResults.length
    console.log(
      `✅ Competition Corner scraper completed: ${compCornerResults.length} competitions staged`,
    )
  } catch (error) {
    results.compCorner.error = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Competition Corner scraper failed:', error)
  }

  // Summary
  console.log('\n📊 Daily scraper summary:')
  console.log(
    `Aretas: ${results.aretas.success ? `✅ ${results.aretas.count} competitions` : `❌ ${results.aretas.error}`}`,
  )
  console.log(
    `Competition Corner: ${results.compCorner.success ? `✅ ${results.compCorner.count} competitions` : `❌ ${results.compCorner.error}`}`,
  )

  const totalStaged = results.aretas.count + results.compCorner.count
  console.log(`\n🎯 Total competitions staged for review: ${totalStaged}`)
  console.log(`Completed at: ${new Date().toISOString()}`)

  // Send email notification
  try {
    await sendNotificationEmail(results, totalStaged)
    console.log('✅ Email notification sent successfully')
  } catch (error) {
    console.error('❌ Failed to send email notification:', error)
  }

  // Exit with appropriate code
  const hasErrors = !results.aretas.success || !results.compCorner.success
  process.exit(hasErrors ? 1 : 0)
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  runDailyScraper().catch((error) => {
    console.error('💥 Fatal error in daily scraper:', error)
    process.exit(1)
  })
}

/**
 * Send email notification with scraper results
 */
async function sendNotificationEmail(
  results: {
    aretas: { success: boolean; count: number; error: string | null }
    compCorner: { success: boolean; count: number; error: string | null }
  },
  totalStaged: number,
) {
  const mailgun = new MailgunManager()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Determine overall status
  const hasErrors = !results.aretas.success || !results.compCorner.success
  const status = hasErrors ? '⚠️ PARTIAL SUCCESS' : '✅ SUCCESS'
  const statusEmoji = hasErrors ? '⚠️' : '✅'

  // Build email content
  const subject = `${statusEmoji} Daily Scraper Report - ${totalStaged} competitions staged`

  const emailContent = `
<h2>🤖 Daily Competition Scraper Report</h2>
<p><strong>Date:</strong> ${dateStr}</p>
<p><strong>Completed:</strong> ${timeStr}</p>
<p><strong>Status:</strong> ${status}</p>

<h3>📊 Scraper Results</h3>
<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
  <tr style="background-color: #f5f5f5;">
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Source</th>
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Status</th>
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Competitions</th>
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Details</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px;">Team Aretas</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.aretas.success ? '✅ Success' : '❌ Failed'}</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.aretas.success ? results.aretas.count : '0'}</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.aretas.success ? 'Completed successfully' : results.aretas.error}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px;">Competition Corner</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.compCorner.success ? '✅ Success' : '❌ Failed'}</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.compCorner.success ? results.compCorner.count : '0'}</td>
    <td style="border: 1px solid #ddd; padding: 12px;">${results.compCorner.success ? 'Completed successfully' : results.compCorner.error}</td>
  </tr>
</table>

<h3>🎯 Summary</h3>
<p><strong>Total Competitions Staged:</strong> ${totalStaged}</p>
<p><strong>Status:</strong> All competitions are in PENDING status awaiting your review.</p>

${
  totalStaged > 0
    ? `
<h3>🚀 Next Steps</h3>
<p>Review and approve the new competitions at: <a href="https://fitlo.co/admin/potential-competitions">Admin Panel</a></p>
<p>Once approved, they will appear on the <a href="https://fitlo.co/explore">Explore Page</a></p>
`
    : `
<p><em>No new competitions found today. This is normal - scrapers only add competitions that don't already exist.</em></p>
`
}

<hr style="margin: 30px 0;">
<p style="color: #666; font-size: 12px;">
  This is an automated email from the Fitlo daily scraper cron job.<br>
  Time: ${now.toISOString()}<br>
  Next run: Tomorrow at 6:00 AM UTC
</p>
  `

  await mailgun.sendEmail({
    to: 'nickoferrall@gmail.com',
    subject,
    html: emailContent,
  })
}

export { runDailyScraper }
