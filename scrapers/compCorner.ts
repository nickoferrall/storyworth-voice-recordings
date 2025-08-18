import { BaseScraper } from './base'
import { Currency } from '../src/generated/graphql'
import getKysely from '../src/db'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import { standardizeTicketType } from '../utils/standardizeTicketType'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure OpenAI (optional)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

// Helper function to parse team size from category names
// Helper function to extract country from event title
function extractCountryFromTitle(title: string): string | null {
  const titleLower = title.toLowerCase()

  // Common country patterns in event titles
  const countryPatterns = [
    { pattern: /new zealand|nz nationals|new zealand nationals/, country: 'New Zealand' },
    { pattern: /australia|australian|aus nationals/, country: 'Australia' },
    {
      pattern: /united kingdom|uk|british|england|scotland|wales/,
      country: 'United Kingdom',
    },
    { pattern: /united states|usa|us nationals|american/, country: 'United States' },
    { pattern: /canada|canadian/, country: 'Canada' },
    { pattern: /ireland|irish/, country: 'Ireland' },
    { pattern: /germany|german/, country: 'Germany' },
    { pattern: /france|french/, country: 'France' },
    { pattern: /netherlands|dutch/, country: 'Netherlands' },
    { pattern: /belgium|belgian/, country: 'Belgium' },
    { pattern: /spain|spanish/, country: 'Spain' },
    { pattern: /italy|italian/, country: 'Italy' },
    { pattern: /sweden|swedish/, country: 'Sweden' },
    { pattern: /norway|norwegian/, country: 'Norway' },
    { pattern: /denmark|danish/, country: 'Denmark' },
  ]

  for (const { pattern, country } of countryPatterns) {
    if (pattern.test(titleLower)) {
      return country
    }
  }

  return null
}

function parseTeamSize(categoryName: string): number {
  const name = categoryName.toLowerCase()

  // Look for team size indicators
  if (name.includes('team of 2') || name.includes('2 person') || name.includes('pairs'))
    return 2
  if (name.includes('team of 3') || name.includes('3 person')) return 3
  if (name.includes('team of 4') || name.includes('4 person')) return 4
  if (name.includes('team of 5') || name.includes('5 person')) return 5
  if (name.includes('team of 6') || name.includes('6 person')) return 6
  if (name.includes('team') && !name.includes('individual')) return 2 // Default team size

  return 1 // Default to individual
}

async function determineCountryWithAI(locationData: {
  city: string
  state: string
  originalLocation: string
  eventTitle: string
}): Promise<string> {
  // First, try to extract country from event title
  const titleCountry = extractCountryFromTitle(locationData.eventTitle)
  if (titleCountry) {
    console.log(
      `🎯 Found country "${titleCountry}" in event title: ${locationData.eventTitle}`,
    )
    return titleCountry
  }
  // If OpenAI is not available, use simple logic
  if (!openai) {
    console.log(
      `🌍 No OpenAI available, using default logic for "${locationData.originalLocation}"`,
    )
    // Most Competition Corner events are in the US
    // Simple logic: if it has a US state abbreviation pattern, it's probably US
    if (
      locationData.state &&
      locationData.state.length === 2 &&
      /^[A-Z]{2}$/.test(locationData.state)
    ) {
      return 'United States'
    }
    return 'United States' // Default since most CompCorner events are US-based
  }

  try {
    const prompt = `Based on this event information, determine the country:
    - Event Title: ${locationData.eventTitle}
    - City: ${locationData.city}
    - State: ${locationData.state}
    - Original Location: ${locationData.originalLocation}
    
    Pay special attention to the event title - if it mentions a country (like "New Zealand Nationals" or "Australian Championships"), use that country.
    Most Competition Corner events are in the United States, but some may be in other countries.
    Return only the country name (e.g., "United States", "Canada", "United Kingdom", "New Zealand", "Australia").`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0,
    })

    const country = response.choices[0]?.message?.content?.trim()
    console.log(
      `🤖 AI determined country for "${locationData.originalLocation}": ${country}`,
    )
    return country || 'United States'
  } catch (error) {
    console.error('Error determining country with AI:', error)
    return 'United States' // Default fallback
  }
}

interface CompCornerCompetition {
  title: string
  location: string
  city: string
  state: string
  date: string
  price: string
  imageUrl: string
  eventUrl: string
  country: string
  categories: Array<{
    name: string
    isSoldOut: boolean
    price: number | null
    priceText: string
    teamSize: number
    formatText: string
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

async function uploadImageToCloudinary(
  imageUrl: string,
  eventTitle: string,
  page?: any, // Browser page for authenticated requests
): Promise<string> {
  try {
    console.log(`Uploading image for "${eventTitle}" from ${imageUrl}`)

    let buffer: Buffer

    if (page && imageUrl.includes('competitioncorner.net')) {
      // Use browser context for Competition Corner images (they're protected)
      console.log(`📸 Using browser context to download protected image...`)

      const imageResponse = await page.goto(imageUrl, {
        waitUntil: 'networkidle0',
        timeout: 10000,
      })
      if (!imageResponse.ok()) {
        throw new Error(`Failed to fetch image via browser: ${imageResponse.status()}`)
      }

      buffer = await imageResponse.buffer()
    } else {
      // Direct fetch for other URLs
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer)

    // Upload to Cloudinary
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `competitions/event-${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
      stream.pipe(uploadStream)
    })

    console.log(`✅ Uploaded image to Cloudinary: ${uploadResponse.secure_url}`)
    return uploadResponse.secure_url
  } catch (error) {
    console.error(`❌ Failed to upload image for ${eventTitle}:`, error)
    return imageUrl // Fallback to original URL
  }
}

function parseDate(dateStr: string): Date {
  if (!dateStr) {
    console.warn(`Empty date string, defaulting to far future date`)
    return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
  }

  try {
    // Handle date ranges by taking the start date
    const startDate = dateStr.split('–')[0].split('-')[0].trim()

    // Parse the date string
    const date = new Date(startDate)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateStr}, defaulting to far future date`)
      return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
    }

    // If the year is wrong (like 2001), set it to 2024/2025
    if (date.getFullYear() < 2024) {
      const currentYear = new Date().getFullYear()
      date.setFullYear(currentYear + 1) // Set to next year since these appear to be 2025 events
    }

    return date
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}, defaulting to far future date`, error)
    return new Date('2030-12-31') // Far future date so it doesn't interfere with sorting
  }
}

export class CompCornerScraper extends BaseScraper {
  name = 'compCorner'

  async scrape(limit?: number): Promise<CompetitionResult[]> {
    console.log('🚀 Testing Competition Corner scraper with specific competitions...')
    console.log('Initializing Competition Corner scraper...')

    const browser = await this.initBrowser()
    const page = await browser.newPage()
    await this.setPageDefaults(page)

    try {
      console.log('Navigating to Competition Corner competitions page...')
      await page.goto('https://competitioncorner.net', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      await this.randomDelay()
      await page.mouse.move(Math.random() * 500, Math.random() * 500)
      await this.randomDelay(500, 1500)

      // Scroll to load competitions
      const targetLimit = limit || 5
      console.log(`Starting scroll to load competitions (target: ${targetLimit})...`)
      await this.scrollUntilNoNewElements(page, targetLimit)

      console.log('Extracting competition details...')
      const competitions = (await page.evaluate(() => {
        const compElements = Array.from(
          document.querySelectorAll('a.events-item-wrapper.ng-star-inserted'),
        )

        if (compElements.length === 0) {
          throw new Error('No competition elements found')
        }

        return compElements
          .map((comp) => {
            try {
              const eventUrl = comp.getAttribute('href')
              // Check if URL is already absolute or relative (main scrape)
              const fullEventUrl = eventUrl
                ? eventUrl.startsWith('http')
                  ? eventUrl // Already absolute
                  : `https://competitioncorner.net${eventUrl}` // Make relative absolute
                : ''

              const eventItem = comp.querySelector('.events-item')
              if (!eventItem) {
                throw new Error('Could not find events-item div')
              }

              const title =
                eventItem
                  .querySelector('.event-name')
                  ?.textContent?.trim()
                  .split(' 2024')[0] || ''

              const location =
                eventItem
                  .querySelector('.event-format span:nth-child(2)')
                  ?.textContent?.trim()
                  .split('·')[0] || ''

              const date =
                eventItem.querySelector('.event-date')?.textContent?.trim() || ''
              const price =
                eventItem.querySelector('.event-price span')?.textContent?.trim() || ''

              // Enhanced image extraction with debugging
              const imageElement = eventItem.querySelector('.event-image')
              const imageSrc = imageElement?.getAttribute('src') || ''

              // Debug image extraction
              console.log(`🖼️ Image debug for "${title}":`, {
                imageElement: !!imageElement,
                imageSrc,
                imageAttributes: imageElement
                  ? Array.from(imageElement.attributes)
                      .map((attr) => `${attr.name}="${attr.value}"`)
                      .join(', ')
                  : 'none',
              })

              // Make sure image URL is absolute
              const imageUrl =
                imageSrc && imageSrc.startsWith('http')
                  ? imageSrc
                  : imageSrc && imageSrc.startsWith('/')
                    ? `https://competitioncorner.net${imageSrc}`
                    : imageSrc && imageSrc.startsWith('./')
                      ? `https://competitioncorner.net/${imageSrc.slice(2)}`
                      : imageSrc || ''

              // Parse location into city and state
              const locationParts = location.split(',').map((p) => p.trim())
              const city = locationParts[0] || ''
              const state = locationParts[1] || ''

              const categories = Array.from(eventItem.querySelectorAll('.tag-item')).map(
                (tag) => {
                  const name = tag.textContent?.trim().split('·')[0] || ''
                  const priceMatch = price.match(/\$(\d+)/)
                  const priceValue = priceMatch ? parseFloat(priceMatch[1]) : null

                  return {
                    name,
                    isSoldOut: false,
                    price: priceValue,
                    priceText: price,
                    teamSize: 1, // Default, will be updated from divisions page
                    formatText: '', // Will be updated from divisions page
                  }
                },
              )

              return {
                title,
                location,
                city,
                state,
                date,
                price,
                imageUrl,
                eventUrl: fullEventUrl,
                categories,
              }
            } catch (error) {
              console.error('Error processing element:', error)
              return null
            }
          })
          .filter(Boolean)
      })) as CompCornerCompetition[]

      console.log(`Found ${competitions.length} competitions (limited to ${targetLimit})`)

      // Limit the competitions we process
      const limitedComps = competitions.slice(0, targetLimit)
      console.log(`Processing ${limitedComps.length} competitions due to limit`)

      // Determine countries using AI
      console.log('Determining countries with AI...')
      const processedComps = await Promise.all(
        limitedComps.map(async (comp) => ({
          ...comp,
          country: await determineCountryWithAI({
            city: comp.city,
            state: comp.state,
            originalLocation: comp.location,
            eventTitle: comp.title,
          }),
        })),
      )

      console.log('Creating competitions with TicketTypes in database...')
      const pg = getKysely()
      const createdCompetitions: CompetitionResult[] = []

      // Create a new page for image downloads and detail page visits
      const imagePage = await browser.newPage()
      await this.setPageDefaults(imagePage)

      for (const comp of processedComps) {
        try {
          // Visit individual event page to get better image
          let logoUrl: string | null = null
          let betterImageUrl = comp.imageUrl

          if (comp.eventUrl) {
            try {
              console.log(`🔍 Visiting detail page for "${comp.title}": ${comp.eventUrl}`)
              await imagePage.goto(comp.eventUrl, {
                waitUntil: 'networkidle0',
                timeout: 15000,
              })

              // Extract better image from detail page
              const detailImageUrl = await imagePage.evaluate(() => {
                const imageElement = document.querySelector('.custom-logo')
                return imageElement?.getAttribute('src') || null
              })

              if (detailImageUrl) {
                // Make URL absolute
                betterImageUrl = detailImageUrl.startsWith('http')
                  ? detailImageUrl
                  : detailImageUrl.startsWith('/')
                    ? `https://competitioncorner.net${detailImageUrl}`
                    : `https://competitioncorner.net/${detailImageUrl}`

                console.log(
                  `✅ Found better image for "${comp.title}": ${betterImageUrl}`,
                )
              } else {
                console.log(
                  `⚠️ No better image found for "${comp.title}", using listing image`,
                )
              }

              // Try multiple URLs to find divisions
              const possibleDivisionUrls = [
                comp.eventUrl.replace('/details', '/divisions'),
                comp.eventUrl + '/divisions',
                comp.eventUrl.replace('/events/', '/events/') + '/divisions',
              ]

              let divisionsFromPage: any[] = []

              for (const divisionsUrl of possibleDivisionUrls) {
                try {
                  console.log(`🎫 Trying divisions page: ${divisionsUrl}`)

                  await imagePage.goto(divisionsUrl, {
                    waitUntil: 'networkidle0',
                    timeout: 10000,
                  })

                  // Extract divisions/ticket types from divisions page
                  divisionsFromPage = await imagePage.evaluate(() => {
                    console.log('🔍 Looking for division elements...')

                    // Try multiple selectors
                    const selectors = [
                      '.division-content',
                      '.tab-content .division-content',
                      '[class*="division"]',
                    ]
                    let divisionElements: Element[] = []

                    for (const selector of selectors) {
                      divisionElements = Array.from(document.querySelectorAll(selector))
                      if (divisionElements.length > 0) {
                        console.log(
                          `✅ Found ${divisionElements.length} elements with selector: ${selector}`,
                        )
                        break
                      }
                    }

                    if (divisionElements.length === 0) {
                      console.log('❌ No division elements found')
                      return []
                    }

                    return divisionElements
                      .map((div) => {
                        const nameElement = div.querySelector('h3')
                        const formatElement = div.querySelector('.format-block p')

                        const name = nameElement?.textContent?.trim() || ''
                        const formatText = formatElement?.textContent?.trim() || ''

                        if (!name) return null

                        // Determine team size from format text
                        let teamSize = 1
                        if (
                          formatText.includes('team of 2') ||
                          formatText.toLowerCase().includes('pairs')
                        ) {
                          teamSize = 2
                        } else if (formatText.includes('team of 3')) {
                          teamSize = 3
                        } else if (formatText.includes('team of 4')) {
                          teamSize = 4
                        }

                        console.log(`📋 Found division: ${name} (teamSize: ${teamSize})`)

                        return {
                          name,
                          teamSize,
                          formatText,
                          isSoldOut: false,
                          price: null,
                          priceText: 'TBD',
                        }
                      })
                      .filter(Boolean) // Remove null entries
                  })

                  if (divisionsFromPage.length > 0) {
                    console.log(
                      `✅ Found ${divisionsFromPage.length} divisions at: ${divisionsUrl}`,
                    )
                    break // Success! Stop trying other URLs
                  }
                } catch (urlError) {
                  console.log(
                    `⚠️ Failed to load ${divisionsUrl}:`,
                    urlError instanceof Error ? urlError.message : String(urlError),
                  )
                }
              }

              if (divisionsFromPage.length > 0) {
                comp.categories = divisionsFromPage
              } else {
                console.log(
                  `⚠️ No divisions found for "${comp.title}" on any URL, using default categories`,
                )
              }
            } catch (detailError) {
              console.log(
                `⚠️ Failed to get detail info for "${comp.title}":`,
                detailError instanceof Error ? detailError.message : String(detailError),
              )
            }
          }

          // Upload image to Cloudinary if available
          console.log(
            `🖼️ Processing image for "${comp.title}": imageUrl="${betterImageUrl}"`,
          )
          if (betterImageUrl && betterImageUrl.startsWith('http')) {
            logoUrl = await uploadImageToCloudinary(betterImageUrl, comp.title, imagePage)
          } else {
            console.log(
              `⚠️ Skipping image upload for "${comp.title}": ${betterImageUrl ? "URL doesn't start with http" : 'No image URL found'}`,
            )
          }

          // Determine currency based on country
          const currency =
            comp.country === 'United States'
              ? 'USD'
              : comp.country === 'Canada'
                ? 'CAD'
                : comp.country === 'United Kingdom'
                  ? 'GBP'
                  : 'USD' // Default

          // Calculate average price from categories
          const validPrices = comp.categories
            .map((c) => c.price)
            .filter((p): p is number => p !== null)
          const finalPrice =
            validPrices.length > 0
              ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
              : null

          // Create address first (let ID auto-generate)
          const address = await pg
            .insertInto('Address')
            .values({
              venue: null,
              street: null,
              city: comp.city || comp.location,
              postcode: null,
              country: comp.country,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Create competition record
          const baseCompetition = {
            id: nanoid(6),
            name: comp.title.slice(0, 255),
            startDateTime: parseDate(comp.date),
            endDateTime: parseDate(comp.date), // Same as start for now
            addressId: address.id,
            createdByUserId: null,
            timezone:
              comp.country === 'United States'
                ? 'America/New_York'
                : comp.country === 'Canada'
                  ? 'America/Toronto'
                  : comp.country === 'United Kingdom'
                    ? 'Europe/London'
                    : 'UTC',
            orgId: null,
            orgName: null,
            description:
              comp.categories.length > 0
                ? `Categories:\n${comp.categories.map((c) => `• ${c.name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}`).join('\n')}`
                : 'Competition details available on registration page.',
            website: comp.eventUrl || null,
            email: null,
            instagramHandle: null,
            currency,
            price: finalPrice,
            country: comp.country,
            state: comp.state || null,
            registrationEnabled: false, // Disable registration for scraped comps
          }

          const competitionData = {
            source: 'SCRAPED_COMP_CORNER',
            ...baseCompetition,
          }

          // Add logo field with backward compatibility
          try {
            const competition = await pg
              .insertInto('Competition')
              .values({
                ...competitionData,
                logo: logoUrl,
              })
              .returningAll()
              .executeTakeFirstOrThrow()

            // Create ticket types for each category
            if (comp.categories.length > 0) {
              for (const category of comp.categories) {
                // Get standardized filters
                const standardized = standardizeTicketType(
                  category.name,
                  category.formatText,
                  category.teamSize,
                )

                await pg
                  .insertInto('TicketType')
                  .values({
                    // Let ID auto-generate
                    name: category.name
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                      .slice(0, 255),
                    description:
                      `${category.isSoldOut ? 'Sold Out' : 'Available'} - ${category.priceText || 'TBD'} | Filters: ${standardized.difficulty},${standardized.ageGroup},${standardized.gender}`.slice(
                        0,
                        255,
                      ),
                    competitionId: competition.id,
                    price: category.price || 0,
                    currency: currency as any,
                    maxEntries: 100, // Default
                    teamSize: standardized.teamSize,
                    isVolunteer: false,
                    allowHeatSelection: false,
                    passOnPlatformFee: true,
                  })
                  .execute()
              }
            }

            const result: CompetitionResult = {
              id: competition.id,
              title: competition.name || '',
              location: comp.location,
              country: comp.country,
              state: comp.state || '',
              startDate: competition.startDateTime,
              price: finalPrice,
              currency: currency as Currency,
              website: comp.eventUrl,
              email: null,
              logo: logoUrl,
              source: 'SCRAPED_COMP_CORNER',
              createdAt: competition.createdAt,
              updatedAt: competition.updatedAt,
            }

            createdCompetitions.push(result)
            console.log(
              `✅ Created: ${comp.title} (${comp.country}, ${currency}) with ${comp.categories.length} ticket types`,
            )
          } catch (logoError) {
            // Fallback: create without logo field for older schema
            console.log(`⚠️ Logo field not available, creating without logo`)
            const competition = await pg
              .insertInto('Competition')
              .values(competitionData)
              .returningAll()
              .executeTakeFirstOrThrow()

            // Create ticket types for each category
            if (comp.categories.length > 0) {
              for (const category of comp.categories) {
                await pg
                  .insertInto('TicketType')
                  .values({
                    name: category.name
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                      .slice(0, 255),
                    description:
                      `${category.isSoldOut ? 'Sold Out' : 'Available'} - ${category.priceText || 'TBD'}`.slice(
                        0,
                        255,
                      ),
                    competitionId: competition.id,
                    price: category.price || 0,
                    currency: currency as any,
                    maxEntries: 100,
                    teamSize: parseTeamSize(category.name),
                    isVolunteer: false,
                    allowHeatSelection: false,
                    passOnPlatformFee: true,
                  })
                  .execute()
              }
            }

            const result: CompetitionResult = {
              id: competition.id,
              title: competition.name || '',
              location: comp.location,
              country: comp.country,
              state: comp.state || '',
              startDate: competition.startDateTime,
              price: finalPrice,
              currency: currency as Currency,
              website: comp.eventUrl,
              email: null,
              logo: logoUrl,
              source: 'SCRAPED_COMP_CORNER',
              createdAt: competition.createdAt,
              updatedAt: competition.updatedAt,
            }

            createdCompetitions.push(result)
            console.log(
              `✅ Created: ${comp.title} (${comp.country}, ${currency}) with ${comp.categories.length} ticket types`,
            )
          }
        } catch (error) {
          console.error(`❌ Error creating ${comp.title}:`, error)
          continue
        }
      }

      // Close the image page
      await imagePage.close()

      return createdCompetitions
    } finally {
      console.log('Closing Competition Corner browser...')
      await browser.close()
    }
  }

  private async scrollUntilNoNewElements(page: any, limit?: number) {
    let previousHeight = 0
    let previousElementCount = 0
    let sameCountStreak = 0
    const maxSameCount = 3

    while (true) {
      const currentElements = await page.evaluate(
        () => document.querySelectorAll('a.events-item-wrapper.ng-star-inserted').length,
      )

      // If we have enough elements, stop scrolling
      if (typeof limit === 'number' && currentElements >= limit) {
        console.log(`✅ Reached target of ${limit} competitions, stopping scroll...`)
        break
      }

      // Check if number of elements is the same as last time
      if (currentElements === previousElementCount) {
        sameCountStreak++
        if (sameCountStreak >= maxSameCount) {
          console.log(
            `Found same number of competitions (${currentElements}) ${maxSameCount} times in a row. Stopping scroll...`,
          )
          break
        }
      } else {
        sameCountStreak = 0
      }

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newHeight = await page.evaluate(() => document.body.scrollHeight)
      console.log(`Found ${currentElements} Competition Corner competitions so far...`)

      if (newHeight === previousHeight) {
        sameCountStreak++
        if (sameCountStreak >= maxSameCount) {
          console.log('Page height unchanged 3 times in a row. Stopping scroll...')
          break
        }
      } else {
        previousHeight = newHeight
      }

      previousElementCount = currentElements
      await this.randomDelay(1000, 2000)
    }
  }

  // New method for staging scraped competitions for admin review
  async scrapeToStaging(limit?: number): Promise<any[]> {
    console.log('🚀 Starting Competition Corner scraper (staging mode)...')
    const browser = await this.initBrowser()

    try {
      const page = await browser.newPage()
      await this.setPageDefaults(page)

      console.log('📍 Navigating to Competition Corner competitions page...')
      await page.goto('https://competitioncorner.net', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      await this.randomDelay()
      await page.mouse.move(Math.random() * 500, Math.random() * 500)
      await this.randomDelay(500, 1500)

      // Scroll to load competitions
      const targetLimit = limit || 5
      console.log(`Starting scroll to load competitions (target: ${targetLimit})...`)
      await this.scrollUntilNoNewElements(page, targetLimit)

      console.log('Extracting competition details...')
      const competitions = (await page.evaluate(() => {
        const compElements = Array.from(
          document.querySelectorAll('a.events-item-wrapper.ng-star-inserted'),
        )

        if (compElements.length === 0) {
          throw new Error('No competition elements found')
        }

        return compElements
          .map((comp) => {
            try {
              const eventUrl = comp.getAttribute('href')
              // Check if URL is already absolute or relative (staging)
              const fullEventUrl = eventUrl
                ? eventUrl.startsWith('http')
                  ? eventUrl // Already absolute
                  : `https://competitioncorner.net${eventUrl}` // Make relative absolute
                : ''

              const eventItem = comp.querySelector('.events-item')
              if (!eventItem) {
                throw new Error('Could not find events-item div')
              }

              const title =
                eventItem
                  .querySelector('.event-name')
                  ?.textContent?.trim()
                  .split(' 2024')[0] || ''

              const location =
                eventItem
                  .querySelector('.event-format span:nth-child(2)')
                  ?.textContent?.trim()
                  .split('·')[0] || ''

              const date =
                eventItem.querySelector('.event-date')?.textContent?.trim() || ''
              const price =
                eventItem.querySelector('.event-price span')?.textContent?.trim() || ''

              const imageElement = eventItem.querySelector('.event-image')
              const imageSrc = imageElement?.getAttribute('src') || ''

              const imageUrl =
                imageSrc && imageSrc.startsWith('http')
                  ? imageSrc
                  : imageSrc && imageSrc.startsWith('/')
                    ? `https://competitioncorner.net${imageSrc}`
                    : imageSrc && imageSrc.startsWith('./')
                      ? `https://competitioncorner.net/${imageSrc.slice(2)}`
                      : imageSrc || ''

              return {
                title,
                date,
                location,
                price,
                href: fullEventUrl,
                logoSrc: imageUrl,
              }
            } catch (error) {
              console.error('Error processing element:', error)
              return null
            }
          })
          .filter(Boolean)
      })) as any[]

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
            `\n📝 [${processedCount}/${competitions.length}] Staging: ${comp.title} (${elapsed}s elapsed)`,
          )

          // Parse date using the same logic as main scraper
          const startDate = parseDate(comp.date)
          if (isNaN(startDate.getTime())) {
            console.log(`⚠️ Invalid date for ${comp.title}, skipping...`)
            continue
          }

          // Check for duplicates in BOTH PotentialCompetition AND Competition tables
          const [existingPotential, existingLive] = await Promise.all([
            // Check PotentialCompetition table
            pg
              .selectFrom('PotentialCompetition')
              .select('id')
              .where('name', '=', comp.title.slice(0, 255))
              .where('startDateTime', '=', startDate)
              .where('source', '=', 'SCRAPED_COMP_CORNER')
              .executeTakeFirst(),
            // Check main Competition table
            pg
              .selectFrom('Competition')
              .select('id')
              .where('name', '=', comp.title.slice(0, 255))
              .where('startDateTime', '=', startDate)
              .where('source', '=', 'SCRAPED_COMP_CORNER')
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

          // Extract country from location
          const country = extractCountryFromTitle(comp.location) || 'Unknown'

          // Parse price from scraped data
          let parsedPrice = 0
          let currency = 'USD'
          if (comp.price) {
            // Extract price from strings like "$150", "£50", "150 USD", etc.
            const priceMatch = comp.price.match(/[\d.,]+/)
            if (priceMatch) {
              parsedPrice = parseFloat(priceMatch[0].replace(/,/g, ''))
            }
            // Extract currency
            if (comp.price.includes('£') || comp.price.toUpperCase().includes('GBP')) {
              currency = 'GBP'
            } else if (
              comp.price.includes('€') ||
              comp.price.toUpperCase().includes('EUR')
            ) {
              currency = 'EUR'
            } else if (comp.price.toUpperCase().includes('CAD')) {
              currency = 'CAD'
            }
          }

          // Upload logo if available
          let logoUrl = comp.logoSrc
          if (logoUrl && !logoUrl.includes('placeholder') && logoUrl.startsWith('http')) {
            console.log(`🖼️ Uploading logo for "${comp.title}"...`)
            logoUrl = await uploadImageToCloudinary(logoUrl, comp.title, page)
          }

          // Create address
          const address = await pg
            .insertInto('Address')
            .values({
              venue: comp.location?.slice(0, 255),
              city: comp.location?.split(',')[0]?.trim() || '',
              country:
                country === 'United States'
                  ? 'US'
                  : country === 'United Kingdom'
                    ? 'UK'
                    : country,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Insert into PotentialCompetition table
          const potentialCompetition = await pg
            .insertInto('PotentialCompetition')
            .values({
              name: comp.title.slice(0, 255),
              startDateTime: startDate,
              endDateTime: startDate,
              addressId: address.id,
              source: 'SCRAPED_COMP_CORNER',
              description: 'Competition details available on Competition Corner.',
              website: comp.href || null,
              currency: currency,
              price: parsedPrice > 0 ? parsedPrice : null,
              country,
              logo: logoUrl,
              scrapedData: JSON.stringify(comp),
              status: 'PENDING',
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Create a default ticket type
          await pg
            .insertInto('PotentialTicketType')
            .values({
              potentialCompetitionId: potentialCompetition.id,
              name: 'General Entry',
              description: 'Standard competition entry',
              price: parsedPrice > 0 ? parsedPrice : 0,
              currency: currency,
              maxEntries: 100,
              teamSize: 1,
              isVolunteer: false,
              allowHeatSelection: false,
              passOnPlatformFee: true,
            })
            .execute()

          createdCompetitions.push(potentialCompetition)
          console.log(`✅ Staged: ${comp.title}`)
        } catch (error) {
          console.error(`❌ Failed to stage ${comp.title}:`, error)
        }
      }

      await browser.close()
      console.log(`\n🎯 Total competitions staged: ${createdCompetitions.length}`)
      return createdCompetitions
    } catch (error) {
      await browser.close()
      throw error
    }
  }
}

// Only run test function if this file is executed directly
if (require.main === module) {
  async function testScraper() {
    console.log('🚀 Testing Competition Corner scraper with specific competitions...')

    const scraper = new CompCornerScraper()

    try {
      const competitions = await scraper.scrape(3) // Test with 3 competitions

      console.log(`\n✅ Successfully scraped ${competitions.length} competitions!`)

      competitions.forEach((comp, index) => {
        console.log(`\n📍 Competition ${index + 1}:`)
        console.log(`   Title: ${comp.title}`)
        console.log(`   Country: ${comp.country}`)
        console.log(`   Currency: ${comp.currency}`)
        console.log(
          `   Price: ${comp.price ? `${comp.currency === 'USD' ? '$' : comp.currency === 'GBP' ? '£' : ''}${comp.price}` : 'TBD'}`,
        )
        console.log(`   Source: ${comp.source}`)
      })
    } catch (error) {
      console.error('❌ Scraper failed:', error)
    }
  }

  testScraper().then(() => process.exit(0))
}
