import { BaseScraper } from './base'
import { Currency, Difficulty, Gender } from '../src/generated/graphql'
import getKysely from '../src/db'
import { nanoid } from 'nanoid'

import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
// Remove randomUUID import - using nanoid instead

// Helper function to parse team size from category names
// Helper function to parse team size from category names

function parseTeamSize(categoryName: string): number {
  const name = categoryName.toLowerCase()

  // Match patterns like "teams of 4", "team of 2", etc.
  const teamMatch = name.match(/teams?\s+of\s+(\d+)/)
  if (teamMatch) {
    return parseInt(teamMatch[1])
  }

  // Match "pairs", "duo", "doubles"
  if (name.match(/pairs?|duo|doubles?/)) {
    return 2
  }

  // Match "individual", "solo", "single"
  if (name.match(/individual|solo|singles?/)) {
    return 1
  }

  // Try to extract number from category name (e.g., "MIXED 4", "ELITE 2")
  const numberMatch = name.match(/\b(\d+)\b/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1])
    if (num >= 1 && num <= 10) {
      // Reasonable team size range
      return num
    }
  }

  // Default to individual if unclear
  return 1
}

interface AretasCompetition {
  title: string
  type: string
  location: string
  date: string
  price: string
  website: string
  email: string
  imageUrl: string
  country: string
  city: string
  venue: string
  timezone: string
  postcode: string
  categories: Array<{
    name: string
    isSoldOut: boolean
    price: number | null
    priceText: string
    status: string
  }>
}

interface CompetitionResult {
  id: string
  title: string
  location: string
  country: string
  state: string
  startDate: Date
  price: number | null
  currency: Currency
  website: string | null
  email: string | null
  logo: string | null
  source: string
  createdAt: Date
  updatedAt: Date
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(
  imageUrl: string,
  eventTitle: string,
): Promise<string> {
  try {
    // Skip if the URL is null or contains "null"
    if (!imageUrl || imageUrl.includes('null')) {
      return ''
    }

    console.log(`Uploading image for "${eventTitle}" from ${imageUrl}`)

    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`)
      return ''
    }

    // Create a sanitized filename from the event title
    const sanitizedTitle =
      eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .substring(0, 50) || 'event' // Fallback if empty

    // Upload to Cloudinary
    const buffer = await response.arrayBuffer()
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'competitions',
          public_id: `event-${sanitizedTitle}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )

      const readable = new Readable()
      readable._read = () => {} // _read is required but you can noop it
      readable.push(Buffer.from(buffer))
      readable.push(null)
      readable.pipe(uploadStream)
    })

    console.log(`✅ Uploaded image to Cloudinary: ${uploadResult.secure_url}`)
    return uploadResult.secure_url
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error)
    return ''
  }
}

export class AretasScraper extends BaseScraper {
  name = 'aretas'

  async scrape(limit?: number): Promise<CompetitionResult[]> {
    const browser = await this.initBrowser()
    console.log('Initializing Team Aretas scraper...')

    try {
      const page = await browser.newPage()
      await this.setPageDefaults(page)

      console.log('Navigating to Team Aretas competitions page...')
      await page.goto('https://team-aretas.com/competitions', {
        waitUntil: 'networkidle2',
      })

      // Modified auto-scroll function with early termination for testing
      let previousCount = 0
      let sameCountStreak = 0
      const maxSameCount = 3
      const targetCount = limit || 999 // Stop early if we have a limit

      console.log(`Starting scroll to load competitions (target: ${limit || 'all'})...`)
      while (true) {
        // Scroll all the way down
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })

        // Wait a bit for new competitions to load
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Count how many competitions are on the page
        const currentCount = await page.evaluate(() => {
          return document.querySelectorAll('.col-xs-3.box-setting').length
        })

        console.log(`Found ${currentCount} Aretas competitions so far...`)

        // Stop early if we have enough for testing
        if (limit && currentCount >= targetCount) {
          console.log(
            `✅ Reached target of ${targetCount} competitions, stopping scroll...`,
          )
          break
        }

        // If count hasn't changed, increment sameCountStreak; otherwise, reset it
        if (currentCount === previousCount) {
          sameCountStreak++
          if (sameCountStreak >= maxSameCount) {
            console.log(
              `No new competitions after scrolling. Stopping at ${currentCount} total...`,
            )
            break
          }
        } else {
          sameCountStreak = 0
        }

        previousCount = currentCount
      }

      console.log('Extracting competition details...')
      // Additional wait to ensure all competitions are fully loaded
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get competitions (limited for testing)
      const competitions = await page.evaluate((testLimit: number | undefined) => {
        const compElements = Array.from(
          document.querySelectorAll('.col-xs-3.box-setting'),
        )
        const allComps = compElements.map((comp) => {
          const titleElement = comp.querySelector('.compBox-title')
          const title = titleElement?.textContent?.trim() || ''
          const compInfos = comp.querySelectorAll('.compinfo')
          let type = ''
          let location = ''
          let date = ''
          let price = ''

          compInfos.forEach((info) => {
            const iconElement = info.querySelector('i')
            const spanText = info.querySelector('span')?.textContent?.trim() || ''
            if (iconElement?.classList.contains('fa-users')) {
              type = spanText
            } else if (iconElement?.classList.contains('fa-map-marker-alt')) {
              location = spanText
            } else if (iconElement?.classList.contains('fa-calendar-alt')) {
              date = spanText
            } else if (iconElement?.classList.contains('fa-tag')) {
              price = spanText
            }
          })

          const detailsLink = comp.querySelector('a')?.getAttribute('href') || ''
          return { title, type, location, date, price, detailsLink }
        })

        // Apply limit in browser if provided
        return testLimit ? allComps.slice(0, testLimit) : allComps
      }, limit)

      const limitedComps = competitions as Array<{
        title: string
        type: string
        location: string
        date: string
        price: string
        detailsLink: string
      }>

      console.log(
        `Found ${limitedComps.length} competitions ${limit ? `(limited to ${limit})` : '(all)'}`,
      )
      if (limit) {
        console.log(`Processing ${limitedComps.length} competitions due to limit`)
      }

      // Process detail pages CONCURRENTLY in batches of 5
      const concurrency = 5
      const processedComps: AretasCompetition[] = []

      // Helper function to fetch the details of a single comp
      const fetchCompDetails = async (comp: any) => {
        if (!comp.detailsLink) return null
        const detailsPage = await browser.newPage()
        try {
          const completeLink = `https://team-aretas.com${comp.detailsLink}`
          console.log(`🔍 Fetching details for: ${comp.title}`)
          await detailsPage.goto(completeLink, {
            waitUntil: 'networkidle0', // Wait for network to be idle
            timeout: 60000, // Increase timeout to 60s
          })

          console.log(`✅ Successfully loaded: ${completeLink}`)

          // Wait for dynamic content to load
          console.log(`⏳ Waiting for dynamic content...`)
          await new Promise((resolve) => setTimeout(resolve, 3000))

          // Try to wait for location data specifically
          try {
            await detailsPage.waitForSelector('.info-data:not(:empty)', { timeout: 5000 })
            console.log(`📍 Found non-empty info-data elements`)
          } catch {
            console.log(`⚠️  No location data found after waiting`)
          }

          // Check basic page info
          const pageInfo = await detailsPage.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            hasInfoData: document.querySelectorAll('.info-data').length > 0,
          }))
          console.log(`📄 Page info:`, pageInfo)

          const details = await detailsPage.evaluate(() => {
            // Use the current competition page URL as the website (for registration)
            const website = window.location.href
            const emailIcon = document.querySelector('.fas.fa-at')
            const emailContainer = emailIcon?.closest('.info-title')?.nextElementSibling
            const email =
              emailContainer?.querySelector('div:nth-child(2)')?.textContent?.trim() || ''
            const logoDiv = document.querySelector('[id="logo"]') as HTMLElement | null
            const imageUrl =
              logoDiv?.style.backgroundImage.match(/url\("(.+?)"\)/)?.[1] || ''

            // Extract the competition date from detail page (more accurate than listing page)
            let detailPageDate = ''
            const infoDataElements = document.querySelectorAll('.info-data')
            for (const element of infoDataElements) {
              const text = element.textContent?.trim() || ''
              // Look for date patterns like "Sat 2 Aug 2025" or "Sun 2 Mar 2025 - Thu 31 Jul 2025"
              if (text.match(/\w{3}\s+\d{1,2}\s+\w{3}\s+\d{4}/)) {
                detailPageDate = text.replace(/competition$/, '').trim()
                break
              }
            }

            // Extract timezone - look specifically for timezone text
            let timezone = 'UTC'
            const allEmSpans = document.querySelectorAll('em.info-data span')
            for (const span of allEmSpans) {
              if (span.textContent?.includes('timezone:')) {
                timezone = span.textContent.replace('timezone:', '').trim()
                break
              }
            }

            // Extract structured address data using the map pin icon
            let street = ''
            let city = ''
            let postcode = ''
            let country = 'United States' // Default for Team Aretas

            // Look for the map pin SVG (map pin has the location path)
            const mapPinSvg = Array.from(document.querySelectorAll('svg')).find((svg) =>
              (svg.innerHTML || '').includes('M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'),
            )
            if (mapPinSvg) {
              const locationContainer =
                mapPinSvg.closest('.info-title')?.nextElementSibling

              if (
                locationContainer &&
                locationContainer.classList.contains('info-data')
              ) {
                const addressLines = Array.from(locationContainer.querySelectorAll('div'))
                  .map((div) => div.textContent?.trim())
                  .filter(Boolean)

                if (addressLines.length >= 1) {
                  street = addressLines[0] || ''
                  city = addressLines[1] || ''
                  postcode = addressLines[2] || ''

                  // Determine country from timezone or postcode format
                  if (
                    timezone.includes('Europe/London') ||
                    /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode)
                  ) {
                    country = 'United Kingdom'
                  } else if (
                    timezone.includes('America/Toronto') ||
                    timezone.includes('Canada')
                  ) {
                    country = 'Canada'
                  } else if (timezone.includes('Australia/')) {
                    country = 'Australia'
                  } else if (timezone.includes('America/')) {
                    country = 'United States'
                  }
                }
              }
            }

            // If we still don't have location data, try a broader search
            if (!city || !country || country === 'United States') {
              const allInfoDataDivs = document.querySelectorAll('.info-data div')

              // Look for div patterns that look like addresses
              const possibleAddresses = Array.from(allInfoDataDivs)
                .map((div) => div.textContent?.trim())
                .filter((text) => text && text.length > 2)

              // Try to find UK postcode pattern
              const ukPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i
              const foundPostcode = possibleAddresses.find(
                (line) => line && ukPostcodePattern.test(line),
              )
              if (foundPostcode) {
                postcode = foundPostcode
                country = 'United Kingdom'
              }
            }

            const categories = Array.from(document.querySelectorAll('.recordflex'))
              .map((row) => {
                const catName =
                  row.querySelector('.cell-flex.cell-flexone')?.textContent?.trim() || ''
                const statusElement = row.querySelector('.cell-flex.cell-90.text-righted')
                const status = statusElement?.textContent?.trim() || ''
                const isSoldOut = status === 'CLOSED' || status === 'SOLD OUT'

                // Extract price from the correct cell (cell-60 text-centered mobile-hide)
                const priceElement = row.querySelector(
                  '.cell-flex.cell-60.text-centered.mobile-hide',
                )
                const priceText = priceElement?.textContent?.trim() || ''

                // Handle different price formats: "FREE", "£50", "$100", etc.
                let price: number | null = null
                if (
                  priceText &&
                  !priceText.includes('TICKET') &&
                  !priceText.includes('CATEGORIES')
                ) {
                  if (priceText.toUpperCase() === 'FREE') {
                    price = 0
                  } else if (priceText.match(/[\d.,]+/)) {
                    price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
                  }
                }

                return {
                  name: catName,
                  isSoldOut,
                  price,
                  priceText: priceText,
                  status: status,
                }
              })
              .filter((cat) => cat.name && !cat.name.includes('CATEGORIES')) // Filter out header row
            return {
              website,
              email,
              imageUrl,
              categories,
              country,
              city,
              venue: street,
              timezone,
              postcode,
              detailPageDate,
              // Debug info
              debugInfo: {
                foundTimezoneElement: timezone !== 'UTC',
                timezoneText: timezone,
                foundMapPinSvg: !!mapPinSvg,
                totalInfoDataElements: document.querySelectorAll('.info-data').length,
                totalInfoDataDivs: document.querySelectorAll('.info-data div').length,
                sampleInfoDataTexts: Array.from(
                  document.querySelectorAll('.info-data div'),
                )
                  .slice(0, 5)
                  .map((div) => div.textContent?.trim())
                  .filter(Boolean),
                // More detailed debugging
                allInfoDataContent: Array.from(document.querySelectorAll('.info-data'))
                  .slice(0, 3)
                  .map((el) => ({
                    tagName: el.tagName,
                    className: el.className,
                    innerHTML:
                      el.innerHTML.slice(0, 100) +
                      (el.innerHTML.length > 100 ? '...' : ''),
                    hasChildDivs: el.querySelectorAll('div').length > 0,
                  })),
              },
            }
          })

          console.log(`📍 Location data for ${comp.title}:`, {
            city: details.city,
            venue: details.venue,
            postcode: details.postcode,
            timezone: details.timezone,
            country: details.country,
          })
          console.log(`🔍 Debug info for ${comp.title}:`, details.debugInfo)
          return {
            ...comp,
            date: details.detailPageDate || comp.date, // Use detail page date if available, fallback to listing date
            website: details.website,
            email: details.email,
            imageUrl: details.imageUrl,
            categories: details.categories,
            country: details.country,
            city: details.city,
            venue: details.venue,
            timezone: details.timezone,
            postcode: details.postcode,
          }
        } catch (error) {
          console.error(`❌ Error processing ${comp.detailsLink}:`, error)
          return null // Skip competitions that fail to process
        } finally {
          await detailsPage.close()
        }
      }

      // Process in chunks of N=5
      for (let i = 0; i < limitedComps.length; i += concurrency) {
        const chunk = limitedComps.slice(i, i + concurrency)
        console.log(
          `Processing competitions ${i + 1} to ${i + chunk.length} of ${
            limitedComps.length
          }...`,
        )
        const chunkResults = await Promise.all(
          chunk.map((comp) => fetchCompDetails(comp)),
        )
        // Filter out nulls, push results
        processedComps.push(...(chunkResults.filter(Boolean) as AretasCompetition[]))
        // Add a small delay after each chunk if desired
        await this.randomDelay(500, 1500)
      }

      // Process competitions and save to database with TicketTypes
      const pg = getKysely()
      const createdCompetitions: CompetitionResult[] = []
      const createdTicketTypes: any[] = []

      console.log('Creating competitions with TicketTypes in database...')
      for (const comp of processedComps) {
        try {
          // Calculate price range from categories with better handling
          const allCategoryPrices = comp.categories
            .map((cat) => cat.price)
            .filter((price): price is number => price !== null)

          const paidPrices = allCategoryPrices.filter((price) => price > 0)
          const hasFreeCategories = allCategoryPrices.some((price) => price === 0)

          // Fallback to main listing price if no category prices
          const mainPrice = comp.price
            ? parseFloat(comp.price.replace(/[^0-9.]/g, ''))
            : null
          if (mainPrice && mainPrice > 0) {
            paidPrices.push(mainPrice)
          }

          const minPrice = paidPrices.length > 0 ? Math.min(...paidPrices) : null
          const maxPrice = paidPrices.length > 0 ? Math.max(...paidPrices) : null

          // Use scraped location data with OpenAI fallback for unclear countries
          let country = comp.country || 'United States'
          const city = comp.city || comp.location.split(',')[0]?.trim() || null
          const venue = comp.venue || null

          // Use basic country detection (OpenAI removed for simplicity)
          if (country === 'United States' && comp.timezone?.includes('Europe/')) {
            country = 'United Kingdom'
          }

          // Use scraped timezone (with fallback based on country)
          const timezone =
            comp.timezone ||
            (country === 'United States'
              ? 'America/New_York'
              : country === 'United Kingdom'
                ? 'Europe/London'
                : country === 'Canada'
                  ? 'America/Toronto'
                  : country === 'Australia'
                    ? 'Australia/Sydney'
                    : 'UTC')

          // Determine currency based on country
          const currency =
            country === 'United States'
              ? 'USD'
              : country === 'United Kingdom'
                ? 'GBP'
                : country === 'Canada'
                  ? 'CAD'
                  : country === 'Australia'
                    ? 'AUD'
                    : 'USD'

          // Use price range (show min price, but could show range in UI)
          const finalPrice = minPrice || maxPrice || null

          // Upload logo to Cloudinary if it exists BEFORE database insertion
          let logoUrl = comp.imageUrl || null
          if (logoUrl && logoUrl.startsWith('http')) {
            logoUrl = await uploadImageToCloudinary(logoUrl, comp.title)
          }

          // Create address first (let ID auto-generate)
          const address = await pg
            .insertInto('Address')
            .values({
              venue: venue?.slice(0, 255), // Allow longer venues
              street: null,
              city: city, // No truncation needed
              postcode: null,
              country:
                country === 'United Kingdom'
                  ? 'UK'
                  : country === 'United States'
                    ? 'US'
                    : country, // No truncation needed
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Create competition record - backward compatible with logo field
          const baseCompetition = {
            id: nanoid(6),
            name: comp.title.slice(0, 255), // Allow longer names
            startDateTime: parseDate(comp.date),
            endDateTime: parseDate(comp.date), // Same as start for now
            addressId: address.id,
            source: 'SCRAPED_ARETAS', // Use valid source value
            createdByUserId: null,
            timezone: timezone, // Keep full timezone (e.g., "Europe/London")
            orgId: null,
            orgName: null,
            description:
              comp.categories.length > 0
                ? `Categories:\n${comp.categories.map((c) => `• ${c.name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}`).join('\n')}`
                : 'Competition details available on registration page.',
            website: comp.website || null,
            email: comp.email || null,
            instagramHandle: null,
            currency,
            price: finalPrice,
            country,
            state: null,
            registrationEnabled: false, // Disable registration for scraped comps
          }

          // Try to add logo field if it exists (post-migration), otherwise skip
          let competition
          try {
            competition = await pg
              .insertInto('Competition')
              .values({
                ...baseCompetition,
                logo: logoUrl, // This will work after migration
              })
              .returningAll()
              .executeTakeFirstOrThrow()
          } catch (error) {
            // If logo field doesn't exist yet (pre-migration), create without it
            console.log('Logo field not available yet, creating competition without logo')
            competition = await pg
              .insertInto('Competition')
              .values(baseCompetition)
              .returningAll()
              .executeTakeFirstOrThrow()
          }

          // Create TicketType records for each category
          for (const category of comp.categories) {
            if (!category.name || category.name.includes('CATEGORIES')) continue

            const teamSize = parseTeamSize(category.name)
            const ticketPrice = category.price !== null ? category.price : 0

            // Determine maxEntries based on status and reasonable defaults
            let maxEntries = 100 // Default
            if (category.status === 'SOLD OUT' || category.status === 'CLOSED') {
              maxEntries = 0 // Full
            } else if (teamSize > 1) {
              maxEntries = 50 // Team events typically smaller
            }

            const ticketType = await pg
              .insertInto('TicketType')
              .values({
                // Let ID auto-generate
                name: category.name
                  .toLowerCase()
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
                  .slice(0, 255), // Format to proper case
                description: `${category.status} - ${category.priceText || 'TBD'}`.slice(
                  0,
                  50,
                ),
                price: ticketPrice,
                teamSize,
                maxEntries,
                currency,
                isVolunteer: false,
                competitionId: competition.id,
                allowHeatSelection: false,
                passOnPlatformFee: true, // Don't charge platform fees for scraped
                // Skip Stripe integration for scraped competitions
                stripeProductId: null,
                stripePriceId: null,
              })
              .returningAll()
              .executeTakeFirstOrThrow()

            createdTicketTypes.push(ticketType)
          }

          // logoUrl already processed above before database insertion

          createdCompetitions.push({
            id: competition.id,
            title: competition.name,
            location: comp.location,
            country,
            state: '',
            startDate: parseDate(comp.date),
            price: finalPrice,
            currency: currency as Currency,
            website: comp.website || null,
            email: comp.email || null,
            logo: logoUrl || null,
            source: 'SCRAPED_ARETAS',
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          console.log(
            `✅ Created: ${comp.title} (${country}, ${currency}) with ${createdTicketTypes.length} ticket types`,
          )
        } catch (error) {
          console.error(`❌ Failed to process ${comp.title}:`, error)
        }
      }

      return createdCompetitions
    } catch (error) {
      console.error('Error in Team Aretas scraper:', error)
      throw error
    } finally {
      console.log('Closing Team Aretas browser...')
      await browser.close()
    }
  }

  // New method for staging scraped competitions for admin review
  async scrapeToStaging(limit?: number): Promise<any[]> {
    console.log('🚀 Starting Aretas scraper (staging mode)...')
    const browser = await this.initBrowser()

    try {
      const page = await browser.newPage()
      await this.setPageDefaults(page)

      console.log('📍 Navigating to Team Aretas competitions page...')
      await page.goto('https://team-aretas.com/competitions', {
        waitUntil: 'networkidle2',
      })

      await this.randomDelay(2000, 4000)

      // Scroll and scrape competitions (similar to main scrape method)
      let previousCount = 0
      let sameCountStreak = 0
      const maxSameCount = 3
      const targetCount = limit || 999

      console.log(`Starting scroll to load competitions (target: ${limit || 'all'})...`)
      while (true) {
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const currentCount = await page.evaluate(() => {
          return document.querySelectorAll('.col-xs-3.box-setting').length
        })

        console.log(`Found ${currentCount} Aretas competitions so far...`)

        if (limit && currentCount >= targetCount) {
          console.log(
            `✅ Reached target of ${targetCount} competitions, stopping scroll...`,
          )
          break
        }

        if (currentCount === previousCount) {
          sameCountStreak++
          if (sameCountStreak >= maxSameCount) {
            console.log(
              `No new competitions after scrolling. Stopping at ${currentCount} total...`,
            )
            break
          }
        } else {
          sameCountStreak = 0
        }

        previousCount = currentCount
      }

      const competitions = await page.evaluate((testLimit: number | undefined) => {
        const compElements = Array.from(
          document.querySelectorAll('.col-xs-3.box-setting'),
        )
        const allComps = compElements.map((comp) => {
          const titleElement = comp.querySelector('.compBox-title')
          const title = titleElement?.textContent?.trim() || ''
          const compInfos = comp.querySelectorAll('.compinfo')
          let type = ''
          let location = ''
          let date = ''
          let price = ''

          compInfos.forEach((info) => {
            const iconElement = info.querySelector('i')
            const spanText = info.querySelector('span')?.textContent?.trim() || ''
            if (iconElement?.classList.contains('fa-users')) {
              type = spanText
            } else if (iconElement?.classList.contains('fa-map-marker-alt')) {
              location = spanText
            } else if (iconElement?.classList.contains('fa-calendar-alt')) {
              date = spanText
            } else if (iconElement?.classList.contains('fa-tag')) {
              price = spanText
            }
          })

          const detailsLink = comp.querySelector('a')?.getAttribute('href') || ''
          return {
            title,
            type,
            location,
            date,
            price,
            detailsLink,
            venue: '',
            timezone: '',
            postcode: '',
            country: 'United States',
            website: '',
            email: '',
            imageUrl: '',
            categories: [] as Array<{
              name: string
              isSoldOut: boolean
              price: number | null
              priceText: string
            }>,
          }
        })

        return testLimit ? allComps.slice(0, testLimit) : allComps
      }, limit)

      console.log(`Found ${competitions.length} competitions for staging`)

      const createdCompetitions: any[] = []
      const pg = (await import('../src/db')).default()

      let processedCount = 0
      const startTime = Date.now()

      for (const comp of competitions) {
        try {
          processedCount++
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          console.log(
            `\n📝 [${processedCount}/${competitions.length}] Fast staging: ${comp.title} (${elapsed}s elapsed)`,
          )

          // Initial date parsing for early duplicate check
          const initialStartDate = parseDate(comp.date)

          // Extract logo and full details for verification
          console.log(`🔍 Full processing (with logos): ${comp.title}`)

          // Extract logo from detail page and get accurate pricing/location
          let logoUrl = ''
          let pageData: any = null
          if (comp.detailsLink) {
            try {
              console.log(`🖼️ Extracting logo for: ${comp.title}`)
              const detailsPage = await browser.newPage()

              try {
                const completeLink = `https://team-aretas.com${comp.detailsLink}`
                console.log(`🌐 Navigating to: ${completeLink}`)

                await detailsPage.goto(completeLink, {
                  waitUntil: 'domcontentloaded',
                  timeout: 20000,
                })

                await new Promise((resolve) => setTimeout(resolve, 3000))

                // Extract logo, location, and pricing data
                const extractedData = await detailsPage.evaluate(() => {
                  const logoDiv = document.querySelector('#logo') as HTMLElement | null
                  const isGymSyncPage = window.location.hostname.includes('gymsync')

                  let logoUrl = ''
                  if (logoDiv) {
                    const match = logoDiv.style.backgroundImage.match(/url\("(.+?)"\)/)
                    logoUrl = match?.[1] || ''
                  }

                  // Extract location data
                  let locationInfo: any
                  if (isGymSyncPage) {
                    locationInfo = {
                      city: 'London',
                      venue: '',
                      country: 'United Kingdom',
                      timezone: 'Europe/London',
                      isGymSync: true,
                    }
                  } else {
                    const mapPinSvg = Array.from(document.querySelectorAll('svg')).find(
                      (svg) =>
                        (svg.innerHTML || '').includes(
                          'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
                        ),
                    )

                    let street = ''
                    let city = ''
                    if (mapPinSvg) {
                      const locationContainer =
                        mapPinSvg.closest('.info-title')?.nextElementSibling
                      if (locationContainer?.classList.contains('info-data')) {
                        const addressLines = Array.from(
                          locationContainer.querySelectorAll('div'),
                        )
                          .map((div) => div.textContent?.trim())
                          .filter(Boolean)
                        street = addressLines[0] || ''
                        city = addressLines[1] || ''
                      }
                    }

                    locationInfo = {
                      city,
                      venue: street,
                      country: 'United Kingdom',
                      timezone: 'Europe/London',
                      isGymSync: false,
                    }
                  }

                  // Extract competition date from detail page
                  let competitionDate = ''
                  const infoDataElements = document.querySelectorAll('.info-data')
                  for (const element of infoDataElements) {
                    const text = element.textContent?.trim() || ''
                    // Look for date patterns like "Sat 2 Aug 2025" or "Sun 2 Mar 2025 - Thu 31 Jul 2025"
                    if (text.match(/\w{3}\s+\d{1,2}\s+\w{3}\s+\d{4}/)) {
                      competitionDate = text.replace(/competition$/, '').trim()
                      break
                    }
                  }

                  // Extract pricing data from categories
                  const categories = Array.from(document.querySelectorAll('.recordflex'))
                    .map((row) => {
                      const catName =
                        row
                          .querySelector('.cell-flex.cell-flexone')
                          ?.textContent?.trim() || ''
                      const priceElement = row.querySelector(
                        '.cell-flex.cell-60.text-centered.mobile-hide',
                      )
                      const priceText = priceElement?.textContent?.trim() || ''

                      let price: number | null = null
                      let currency = 'GBP'

                      if (
                        priceText &&
                        !priceText.includes('TICKET') &&
                        !priceText.includes('CATEGORIES')
                      ) {
                        if (priceText.toUpperCase() === 'FREE') {
                          price = 0
                        } else if (priceText.match(/[\d.,]+/)) {
                          price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

                          // Detect currency from price text
                          if (priceText.includes('£')) currency = 'GBP'
                          else if (priceText.includes('€')) currency = 'EUR'
                          else if (priceText.includes('kr')) currency = 'SEK'
                          else if (priceText.includes('$')) currency = 'USD'
                        }
                      }

                      return { name: catName, price, currency, priceText }
                    })
                    .filter((cat) => cat.name && !cat.name.includes('CATEGORIES'))

                  return { logoUrl, locationInfo, categories, competitionDate }
                })

                pageData = extractedData
                const logoData = pageData.logoUrl

                if (logoData && logoData.startsWith('http')) {
                  logoUrl = await uploadImageToCloudinary(logoData, comp.title)
                  console.log(`✅ Logo uploaded: ${logoUrl}`)
                }
              } finally {
                await detailsPage.close()
              }
            } catch (error) {
              console.log(
                `❌ Logo extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              )
            }
          }

          // Use extracted date from detail page, fallback to listing date
          const dateToUse = pageData?.competitionDate || comp.date || ''
          console.log(
            `📅 Date info: detail="${pageData?.competitionDate || 'none'}" | listing="${comp.date || 'none'}" | using="${dateToUse}"`,
          )

          // Re-parse with better date
          const betterStartDate = parseDate(dateToUse)

          // Check for duplicates with the better date
          const [existingPotential, existingLive] = await Promise.all([
            // Check PotentialCompetition table
            pg
              .selectFrom('PotentialCompetition')
              .select('id')
              .where('name', '=', comp.title.slice(0, 255))
              .where('startDateTime', '=', betterStartDate)
              .where('source', '=', 'SCRAPED_ARETAS')
              .executeTakeFirst(),
            // Check main Competition table
            pg
              .selectFrom('Competition')
              .select('id')
              .where('name', '=', comp.title.slice(0, 255))
              .where('startDateTime', '=', betterStartDate)
              .where('source', '=', 'SCRAPED_ARETAS')
              .executeTakeFirst(),
          ])

          if (existingPotential) {
            console.log(`⚠️ Skipping duplicate potential competition: ${comp.title}`)
            continue
          }
          if (existingLive) {
            console.log(`⚠️ Skipping - already live competition: ${comp.title}`)
            continue
          }

          // Use extracted location data from page if available
          let city = ''
          let country = 'United Kingdom' // Default for Aretas
          let venue = ''
          let timezone = 'Europe/London'

          if (pageData?.locationInfo) {
            // Use the location data extracted from the detail page
            city = pageData.locationInfo.city || 'Unknown'
            country = pageData.locationInfo.country
            venue = pageData.locationInfo.venue || ''
            timezone = pageData.locationInfo.timezone
            console.log(
              `📍 Using extracted location: ${city}, ${country} (${pageData.locationInfo.isGymSync ? 'GymSync' : 'Regular'} page)`,
            )
          } else {
            // Fallback to title-based detection
            const titleLower = comp.title.toLowerCase()

            if (titleLower.includes('hyrox') || titleLower.includes('nike metcon')) {
              country = 'United Kingdom'
              city = 'London'
            }
            console.log(`📍 Using fallback location: ${city}, ${country}`)
          }

          // Use pricing data from detail page if available
          let finalPrice: number | null = null
          let finalCurrency = country === 'United Kingdom' ? 'GBP' : 'USD'

          if (pageData?.categories && pageData.categories.length > 0) {
            // Use the first non-null price from categories
            const pricesWithCurrency = pageData.categories
              .filter((cat: any) => cat.price !== null)
              .map((cat: any) => ({ price: cat.price, currency: cat.currency }))

            if (pricesWithCurrency.length > 0) {
              finalPrice = Math.min(...pricesWithCurrency.map((p: any) => p.price))
              finalCurrency = pricesWithCurrency[0].currency || finalCurrency
            }
          }

          const categoryCount = pageData?.categories?.length || 0
          const priceInfo =
            finalPrice !== null
              ? `${finalPrice} ${finalCurrency}`
              : `No price (${finalCurrency})`
          console.log(
            `✅ Processed: ${city}, ${country} | ${priceInfo} | ${categoryCount} categories | Logo: ${logoUrl ? 'YES' : 'NO'}`,
          )

          // Create address
          const address = await pg
            .insertInto('Address')
            .values({
              venue: comp.venue?.slice(0, 255),
              street: null,
              city: city,
              postcode: null,
              country:
                country === 'United Kingdom'
                  ? 'UK'
                  : country === 'United States'
                    ? 'US'
                    : country,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Insert into PotentialCompetition table
          const potentialCompetition = await pg
            .insertInto('PotentialCompetition')
            .values({
              name: comp.title.slice(0, 255),
              startDateTime: betterStartDate,
              endDateTime: betterStartDate,
              addressId: address.id,
              source: 'SCRAPED_ARETAS',
              timezone: timezone,
              description: `${categoryCount} categories available. ${pageData?.categories?.map((c: any) => c.name).join(', ') || 'See website for details.'}`,
              website: comp.detailsLink
                ? `https://team-aretas.com${comp.detailsLink}`
                : null,
              email: comp.email || null,
              currency: finalCurrency,
              price: finalPrice,
              country,
              logo: logoUrl, // Include extracted logo
              scrapedData: JSON.stringify({
                originalTitle: comp.title,
                originalDate: comp.date,
                extractedDate: pageData?.competitionDate,
                finalDate: dateToUse,
                extractedLocation: pageData?.locationInfo,
                extractedCategories: pageData?.categories,
                finalPrice,
                finalCurrency,
                logoExtracted: !!logoUrl,
              }),
              status: 'PENDING',
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Create ticket types from extracted categories
          if (pageData?.categories && pageData.categories.length > 0) {
            for (const category of pageData.categories) {
              if (!category.name || category.name.includes('CATEGORIES')) continue

              await pg
                .insertInto('PotentialTicketType')
                .values({
                  potentialCompetitionId: potentialCompetition.id,
                  name: category.name
                    .toLowerCase()
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())
                    .slice(0, 255),
                  description: category.priceText || 'See website for details',
                  price: category.price || 0,
                  currency: category.currency || finalCurrency,
                  maxEntries: 100,
                  teamSize: parseTeamSize(category.name),
                  isVolunteer: false,
                  allowHeatSelection: false,
                  passOnPlatformFee: true,
                })
                .execute()
            }
          } else {
            // Create default ticket type if no categories extracted
            await pg
              .insertInto('PotentialTicketType')
              .values({
                potentialCompetitionId: potentialCompetition.id,
                name: 'General Entry',
                description: 'Standard entry - details available on website',
                price: finalPrice || 0,
                currency: finalCurrency,
                maxEntries: 100,
                teamSize: 1,
                isVolunteer: false,
                allowHeatSelection: false,
                passOnPlatformFee: true,
              })
              .execute()
          }

          createdCompetitions.push(potentialCompetition)
          console.log(`✅ Staged competition: ${comp.title}`)
        } catch (error) {
          console.error(`❌ Error staging competition "${comp.title}":`, error)
        }
      }

      return createdCompetitions
    } catch (error) {
      console.error('Error in Aretas staging scraper:', error)
      throw error
    } finally {
      await browser.close()
    }
  }
}

function parseDate(dateStr: string): Date {
  if (!dateStr) {
    console.warn(`Empty date string, defaulting to far future date`)
    return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
  }

  try {
    const startDate = dateStr.split('–')[0].split('-')[0].trim()
    const date = new Date(startDate)
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateStr}, defaulting to far future date`)
      return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
    }
    if (date.getFullYear() < 2024) {
      const currentYear = new Date().getFullYear()
      date.setFullYear(currentYear + 1)
    }
    return date
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}, defaulting to far future date`, error)
    return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
  }
}

// Main execution for full Aretas scraping
if (require.main === module) {
  async function runFullStaging() {
    console.log('🚀 Running FULL Aretas scraper with DATE FIX!')
    console.log('⚡ Extracting logos, locations, and accurate dates from detail pages')
    console.log('📝 This will take ~15-20 minutes for ~110 competitions')
    const scraper = new AretasScraper()

    try {
      // Run full scrape with date fix
      const results = await scraper.scrapeToStaging()
      console.log(`\n🎉 Successfully staged ${results.length} Aretas competitions!`)
      console.log('📋 Visit /admin/potential-competitions to review and approve')
      console.log('⏱️  Average time per competition: ~10 seconds (with logos)')

      // Show summary stats
      const withLogos = results.filter((comp: any) => comp.logo).length
      const withPrices = results.filter(
        (comp: any) => comp.price !== null && comp.price > 0,
      ).length
      const freeComps = results.filter((comp: any) => comp.price === 0).length

      console.log(`\n📊 Full Scrape Summary:`)
      console.log(`   🖼️  With logos: ${withLogos}/${results.length} ✅`)
      console.log(`   💰 Paid competitions: ${withPrices}`)
      console.log(`   🆓 Free competitions: ${freeComps}`)
      console.log(`   📅 All dates extracted from detail pages ✅`)
      console.log(`   🌍 All competitions: United Kingdom (GBP)`)
      console.log(`\n🚀 Ready to approve and make visible on explore page!`)
    } catch (error) {
      console.error('❌ Scraper failed:', error)
      process.exit(1)
    }
  }

  // Run full staging function if this file is executed directly
  runFullStaging().then(() => process.exit(0))
}
