// import { extendType, intArg } from 'nexus'
// import { BaseScraper } from '../../scrapers/base'
// import * as fs from 'fs'
// import * as path from 'path'
// import { stringify } from 'csv-stringify/sync'

// interface AretasCategory {
//   name: string
//   date: string
//   price: string
//   isSoldOut: boolean
// }

// interface AretasCompetition {
//   title: string
//   type: string
//   location: string
//   date: string
//   price: string
//   imageUrl: string
//   detailsLink: string
//   description?: string
//   email?: string
//   instagramHandle?: string
//   facebookHandle?: string
//   twitterHandle?: string
//   address?: string
//   categories?: AretasCategory[]
//   website?: string
// }

// class AretasScraper extends BaseScraper {
//   name = 'aretas'

//   async scrape(limit?: number): Promise<AretasCompetition[]> {
//     const browser = await this.initBrowser()
//     console.log('Initializing Team Aretas scraper...')

//     try {
//       const page = await browser.newPage()
//       await this.setPageDefaults(page)

//       console.log('Navigating to Team Aretas competitions page...')
//       await page.goto('https://team-aretas.com/competitions', {
//         waitUntil: 'networkidle2',
//       })

//       // Modified auto-scroll function
//       let previousCount = 0
//       let sameCountStreak = 0
//       const maxSameCount = 3

//       console.log('Starting scroll to load all competitions...')
//       while (true) {
//         // Scroll all the way down
//         await page.evaluate(() => {
//           window.scrollTo(0, document.body.scrollHeight)
//         })

//         // Wait a bit for new competitions to load
//         await new Promise((resolve) => setTimeout(resolve, 2000))

//         // Count how many competitions are on the page
//         const currentCount = await page.evaluate(() => {
//           return document.querySelectorAll('.col-xs-3.box-setting').length
//         })

//         console.log(`Found ${currentCount} Aretas competitions so far...`)

//         // If count hasn't changed, increment sameCountStreak; otherwise, reset it
//         if (currentCount === previousCount) {
//           sameCountStreak++
//           if (sameCountStreak >= maxSameCount) {
//             console.log(
//               `No new competitions after scrolling. Stopping at ${currentCount} total...`,
//             )
//             break
//           }
//         } else {
//           sameCountStreak = 0
//         }

//         previousCount = currentCount
//       }

//       // Extract basic competition data
//       const competitions = await page.evaluate(() => {
//         const compElements = document.querySelectorAll('.col-xs-3.box-setting')
//         return Array.from(compElements).map((element) => {
//           const titleElement = element.querySelector('.compBox-title')
//           const typeElement = element.querySelector('.compinfo:nth-child(2) span')
//           const locationElement = element.querySelector('.compinfo:nth-child(3) span')
//           const dateElement = element.querySelector('.compinfo:nth-child(4) span')
//           const priceElement = element.querySelector('.compinfo:nth-child(5) span')
//           const linkElement = element.querySelector('a')
//           const compBoxElement = element.querySelector('.compBox')

//           // Extract background image URL from style attribute
//           let imageUrl = ''
//           if (compBoxElement) {
//             const style = compBoxElement.getAttribute('style') || ''
//             const match = style.match(/url\("([^"]+)"\)/)
//             if (match && match[1]) {
//               imageUrl = match[1]
//             }
//           }

//           return {
//             title: titleElement ? titleElement.textContent?.trim() : '',
//             type: typeElement ? typeElement.textContent?.trim() : '',
//             location: locationElement ? locationElement.textContent?.trim() : '',
//             date: dateElement ? dateElement.textContent?.trim() : '',
//             price: priceElement ? priceElement.textContent?.trim() : '',
//             imageUrl,
//             detailsLink: linkElement ? linkElement.getAttribute('href') || '' : '',
//           }
//         })
//       })

//       console.log(`Found ${competitions.length} total competitions`)

//       // Apply limit if specified
//       const limitedComps = limit ? competitions.slice(0, limit) : competitions

//       // Process competition details in batches of 10 concurrently
//       const batchSize = 10
//       const result: AretasCompetition[] = []

//       for (let i = 0; i < limitedComps.length; i += batchSize) {
//         const batch = limitedComps.slice(i, i + batchSize)
//         console.log(
//           `Processing batch ${i / batchSize + 1} (${batch.length} competitions)...`,
//         )

//         const detailedBatch = await Promise.all(
//           batch.map((comp) => this.getCompetitionDetails(browser, comp)),
//         )

//         result.push(...detailedBatch)
//       }

//       return result
//     } catch (error) {
//       console.error('Error in Team Aretas scraper:', error)
//       throw error
//     } finally {
//       console.log('Closing Team Aretas browser...')
//       await browser.close()
//     }
//   }

//   private async getCompetitionDetails(
//     browser: any,
//     competition: AretasCompetition,
//   ): Promise<AretasCompetition> {
//     const detailPage = await browser.newPage()
//     await this.setPageDefaults(detailPage)

//     try {
//       console.log(`Fetching details for: ${competition.title}`)
//       await detailPage.goto(`https://team-aretas.com${competition.detailsLink}`, {
//         waitUntil: 'networkidle2',
//       })

//       const details = await detailPage.evaluate(() => {
//         // Extract description
//         const descriptionElement = document.querySelector('.description-content div')
//         const description = descriptionElement ? descriptionElement.innerHTML : ''

//         // Extract email - improved version
//         let email = ''
//         // First try the standard location
//         const emailElement = document.querySelector(
//           '.info-title svg[stroke="#2d2e2e"][width="16"][height="16"] + .info-data div',
//         )
//         if (emailElement) {
//           email = emailElement.textContent?.trim() || ''
//         }

//         // If no email found, try looking in all info-data divs for something that looks like an email
//         if (!email || !email.includes('@')) {
//           const allInfoData = document.querySelectorAll('.info-data div')
//           for (const div of allInfoData) {
//             const text = div.textContent?.trim() || ''
//             if (text.includes('@') && text.includes('.')) {
//               email = text
//               break
//             }
//           }
//         }

//         // Extract website - improved version
//         let website = ''
//         // First try looking for a link
//         const websiteElement = document.querySelector(
//           '.info-data div a[href^="//"], .info-data div a[href^="http"]',
//         )
//         if (websiteElement) {
//           website = websiteElement.textContent?.trim() || ''
//         }

//         // If no website found, try looking in all info-data divs for something that looks like a website
//         if (!website || !website.includes('.')) {
//           const allInfoData = document.querySelectorAll('.info-data div')
//           for (const div of allInfoData) {
//             const text = div.textContent?.trim() || ''
//             if (
//               (text.startsWith('www.') ||
//                 text.includes('.com') ||
//                 text.includes('.co.uk')) &&
//               !text.includes('@')
//             ) {
//               website = text
//               break
//             }
//           }
//         }

//         // Extract social media handles
//         const socialLinks = document.querySelectorAll('.socialicons a, .comp-socialicon')
//         let instagramHandle = ''
//         let facebookHandle = ''
//         let twitterHandle = ''

//         socialLinks.forEach((link) => {
//           const href = link.getAttribute('href') || ''

//           // Check if this is an Instagram link
//           if (href.includes('instagram.com/') || href.includes('instagram.com')) {
//             // Extract handle from URL like https://instagram.com/username
//             const match = href.match(/instagram\.com\/([^/?]+)/)
//             instagramHandle = match ? match[1] : href
//           } else if (href.includes('facebook.com/') || href.includes('facebook.com')) {
//             // Extract handle from URL like https://facebook.com/username
//             const match = href.match(/facebook\.com\/([^/?]+)/)
//             facebookHandle = match ? match[1] : href
//           } else if (href.includes('twitter.com/') || href.includes('twitter.com')) {
//             // Extract handle from URL like https://twitter.com/username
//             const match = href.match(/twitter\.com\/([^/?]+)/)
//             twitterHandle = match ? match[1] : href
//           } else if (href.match(/^[^/]+$/) || !href.includes('://')) {
//             // Handle case where it's just the username without domain
//             // Try to determine which platform by looking at the SVG icon
//             const svg = link.querySelector('svg')
//             if (svg) {
//               const svgHtml = svg.outerHTML || svg.innerHTML

//               // Check for Instagram icon (circle with dot in corner)
//               if (
//                 svgHtml.includes('16.5 7.5l0 .01') ||
//                 svgHtml.includes('12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0')
//               ) {
//                 instagramHandle = href
//               }
//               // Check for Facebook icon (f shape)
//               else if (
//                 svgHtml.includes(
//                   '7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3',
//                 )
//               ) {
//                 facebookHandle = href
//               }
//               // Check for Twitter icon (bird shape)
//               else if (
//                 svgHtml.includes(
//                   '22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z',
//                 )
//               ) {
//                 twitterHandle = href
//               }
//             }
//           }
//         })

//         // Also look for social media links in other parts of the page
//         const allLinks = document.querySelectorAll(
//           'a[href*="instagram.com"], a[href*="facebook.com"], a[href*="twitter.com"]',
//         )
//         allLinks.forEach((link) => {
//           const href = link.getAttribute('href') || ''

//           if (href.includes('instagram.com/') && !instagramHandle) {
//             const match = href.match(/instagram\.com\/([^/?]+)/)
//             instagramHandle = match ? match[1] : ''
//           } else if (href.includes('facebook.com/') && !facebookHandle) {
//             const match = href.match(/facebook\.com\/([^/?]+)/)
//             facebookHandle = match ? match[1] : ''
//           } else if (href.includes('twitter.com/') && !twitterHandle) {
//             const match = href.match(/twitter\.com\/([^/?]+)/)
//             twitterHandle = match ? match[1] : ''
//           }
//         })

//         // If we still don't have Instagram, try a more aggressive approach
//         if (!instagramHandle) {
//           // Look for any link with Instagram icon
//           const svgElements = document.querySelectorAll('svg')
//           for (const svg of svgElements) {
//             const svgHtml = svg.outerHTML || svg.innerHTML
//             if (
//               svgHtml.includes('12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0') ||
//               svgHtml.includes('16.5 7.5l0 .01')
//             ) {
//               // This looks like an Instagram icon
//               const parentLink = svg.closest('a')
//               if (parentLink) {
//                 const href = parentLink.getAttribute('href') || ''
//                 if (href.includes('instagram.com/')) {
//                   const match = href.match(/instagram\.com\/([^/?]+)/)
//                   instagramHandle = match ? match[1] : href
//                   break
//                 } else if (!href.includes('://')) {
//                   // Might be just the handle
//                   instagramHandle = href.replace(/^\//, '').replace(/\/$/, '')
//                   break
//                 }
//               }
//             }
//           }
//         }

//         // Clean up handles by removing any URL parts
//         instagramHandle = instagramHandle
//           .replace(/https?:\/\//g, '')
//           .replace(/www\./g, '')
//           .replace(/instagram\.com\//g, '')
//           .replace(/\/$/, '')
//         facebookHandle = facebookHandle
//           .replace(/https?:\/\//g, '')
//           .replace(/www\./g, '')
//           .replace(/facebook\.com\//g, '')
//           .replace(/\/$/, '')
//         twitterHandle = twitterHandle
//           .replace(/https?:\/\//g, '')
//           .replace(/www\./g, '')
//           .replace(/twitter\.com\//g, '')
//           .replace(/\/$/, '')

//         // Extract address
//         const addressElements = document.querySelectorAll(
//           '.info-title svg[stroke="#2d2e2e"][width="16"][height="16"] + .info-data div',
//         )
//         let address = ''

//         if (addressElements.length > 0) {
//           // Skip the email element which might be in this selector too
//           const addressParts = []
//           addressElements.forEach((el) => {
//             const text = el.textContent?.trim()
//             if (text && !text.includes('@')) {
//               addressParts.push(text)
//             }
//           })
//           address = addressParts.join(', ')
//         }

//         // Extract categories
//         const categoryRows = document.querySelectorAll('.recordflex:not(:first-child)')
//         const categories = Array.from(categoryRows).map((row) => {
//           const nameElement = row.querySelector('.cell-flex.cell-flexone')
//           const dateElement = row.querySelector('.cell-flex.cell-90.mobile-hide')
//           const priceElement = row.querySelector(
//             '.cell-flex.cell-60.text-centered.mobile-hide',
//           )
//           const statusElement = row.querySelector('.cell-flex.cell-90.text-righted')

//           return {
//             name: nameElement ? nameElement.textContent?.trim() : '',
//             date: dateElement ? dateElement.textContent?.trim() : '',
//             price: priceElement ? priceElement.textContent?.trim() : '',
//             isSoldOut: statusElement
//               ? statusElement.textContent?.trim().toUpperCase() === 'SOLD OUT'
//               : false,
//           }
//         })

//         return {
//           description,
//           email,
//           website,
//           instagramHandle,
//           facebookHandle,
//           twitterHandle,
//           address,
//           categories,
//         }
//       })

//       return {
//         ...competition,
//         ...details,
//       }
//     } catch (error) {
//       console.error(`Error fetching details for ${competition.title}:`, error)
//       return competition // Return the original competition without details
//     } finally {
//       await detailPage.close()
//     }
//   }
// }

// export const ScrapeAretasMutation = extendType({
//   type: 'Mutation',
//   definition(t) {
//     t.field('scrapeAretas', {
//       type: 'String',
//       args: {
//         limit: intArg(),
//       },
//       authorize: (_, __, ctx) => {
//         // Only allow admins to run this mutation
//         return ctx.user?.isAdmin === true
//       },
//       resolve: async (_, { limit }, ctx) => {
//         try {
//           console.log(
//             `Starting Aretas scraper via GraphQL mutation${limit ? ` with limit ${limit}` : ''}...`,
//           )

//           const scraper = new AretasScraper()
//           const competitions = await scraper.scrape(limit || undefined)

//           // Save results to files with timestamp
//           const timestamp = new Date().toISOString().replace(/:/g, '-')
//           const resultsDir = path.join(process.cwd(), 'scraper-results')

//           // Create directory if it doesn't exist
//           if (!fs.existsSync(resultsDir)) {
//             fs.mkdirSync(resultsDir, { recursive: true })
//           }

//           // Save as JSON
//           const jsonFilePath = path.join(resultsDir, `aretas-${timestamp}.json`)
//           fs.writeFileSync(jsonFilePath, JSON.stringify(competitions, null, 2))

//           // Save as CSV
//           const csvFilePath = path.join(resultsDir, `aretas-${timestamp}.csv`)

//           // Flatten categories for CSV output
//           const flattenedComps = competitions.map((comp) => {
//             const categoriesStr = comp.categories
//               ? comp.categories
//                   .map(
//                     (cat) =>
//                       `${cat.name} (${cat.date} - ${cat.price}${cat.isSoldOut ? ' - SOLD OUT' : ''})`,
//                   )
//                   .join('; ')
//               : ''

//             return {
//               title: comp.title,
//               type: comp.type,
//               location: comp.location,
//               date: comp.date,
//               price: comp.price,
//               imageUrl: comp.imageUrl,
//               detailsLink: `https://team-aretas.com${comp.detailsLink}`,
//               description:
//                 comp.description
//                   ?.replace(/<[^>]*>/g, ' ')
//                   .replace(/\s+/g, ' ')
//                   .trim() || '',
//               email: comp.email || '',
//               website: comp.website || '',
//               instagramHandle: comp.instagramHandle || '',
//               facebookHandle: comp.facebookHandle || '',
//               twitterHandle: comp.twitterHandle || '',
//               address: comp.address || '',
//               categories: categoriesStr,
//             }
//           })

//           // Generate CSV
//           const csv = stringify(flattenedComps, {
//             header: true,
//             columns: [
//               'title',
//               'type',
//               'location',
//               'date',
//               'price',
//               'imageUrl',
//               'detailsLink',
//               'description',
//               'email',
//               'website',
//               'instagramHandle',
//               'facebookHandle',
//               'twitterHandle',
//               'address',
//               'categories',
//             ],
//           })

//           fs.writeFileSync(csvFilePath, csv)

//           console.log(`Scraped ${competitions.length} competitions from Aretas`)
//           console.log(`Results saved to ${jsonFilePath} and ${csvFilePath}`)

//           // Return the file paths where results are saved
//           return `JSON: ${jsonFilePath}\nCSV: ${csvFilePath}`
//         } catch (error) {
//           console.error('Error in scrapeAretas mutation:', error)
//           throw new Error(`Failed to scrape Aretas competitions: ${error.message}`)
//         }
//       },
//     })
//   },
// })
