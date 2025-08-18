import { extendType, nonNull, stringArg } from 'nexus'
import { parse } from 'csv-parse/sync'
import { nanoid } from 'nanoid'
import getKysely from '../../src/db'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { DirectoryComp } from '../../src/generated/database'
import { Currency } from '../../src/generated/graphql'
import { Insertable } from 'kysely'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

const openai = new OpenAI({
  apiKey: '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',
})

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface RawCategory {
  name: string
  teamSize: number
  gender: 'MALE' | 'FEMALE' | 'MIXED'
  difficulty: 'ELITE' | 'RX' | 'INTERMEDIATE' | 'EVERYDAY' | 'MASTERS' | 'TEEN'
  tags: string[]
}

// Add helper function for date parsing
function parseCompCornerDate(dateStr: string): { startDate: Date; endDate: Date | null } {
  const months: { [key: string]: string } = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  }

  const currentYear = new Date().getFullYear()

  // Handle date ranges like "Dec 7– 8" or single dates like "Dec 7"
  const [range, nextYear] = dateStr.split('–').map((d) => d.trim())
  const [month, day] = range.split(' ')

  // Determine year based on whether it crosses to next year
  const year =
    nextYear && parseInt(months[month]) < new Date().getMonth() + 1
      ? currentYear + 1
      : currentYear

  const startDate = new Date(`${year}-${months[month]}-${day.padStart(2, '0')}`)

  let endDate: Date | null = null
  if (nextYear) {
    endDate = new Date(`${year}-${months[month]}-${nextYear.padStart(2, '0')}`)
  }

  return { startDate, endDate }
}

// Add helper function for price parsing
function parseCompCornerPrice(priceStr: string): {
  price: number | null
  currency: Currency | null
} {
  if (priceStr === 'Free') return { price: 0, currency: null }

  const priceMatch = priceStr.match(/(\d+(?:\.\d{2})?)\s*([A-Z]{3})/)
  if (!priceMatch) return { price: null, currency: null }

  const [_, amount, curr] = priceMatch

  // Use the existing Currency enum to validate
  const currency = Object.values(Currency).find((c) => c === curr)

  return {
    price: parseFloat(amount),
    currency: currency || null,
  }
}

function formatDateForPostgres(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '')
}

function parseDate(dateStr: string): Date | null {
  try {
    console.log('Parsing date:', dateStr)

    // Handle DD.MM.YYYY format
    if (dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.')
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    }

    // Handle "Month DD" format (e.g., "Nov 30")
    const monthMap: { [key: string]: string } = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    }

    const match = dateStr.match(/([A-Za-z]+)\s+(\d+)/)
    if (match) {
      const [_, month, day] = match
      const year = new Date().getFullYear() // Use current year
      const monthNum = monthMap[month.slice(0, 3)]
      if (!monthNum) return null

      return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}`)
    }

    return null
  } catch (error) {
    console.error('Error parsing date:', dateStr, error)
    return null
  }
}

// Function to parse multiple categories from the Event Category field
function parseCategories(categoryString: string): Array<{
  gender: 'MALE' | 'FEMALE' | 'MIXED'
  teamSize: number
  difficulty: string
  price: number | null
  currency: Currency | null
  isSoldOut: boolean
}> {
  // Split by semicolon to get individual categories
  const categories = categoryString
    .split(';')
    .map((cat) => cat.trim())
    .filter(Boolean)

  return categories.map((category) => {
    // Default values
    let gender: 'MALE' | 'FEMALE' | 'MIXED' = 'MIXED'
    let teamSize = 1 // Default to individual
    let difficulty = 'RX'
    let price: number | null = null
    let currency: Currency | null = null
    let isSoldOut = false

    // Check for parentheses content which often contains price and availability
    const parenthesesMatch = category.match(/\((.*?)\)/)
    if (parenthesesMatch) {
      const parenthesesContent = parenthesesMatch[1]

      // Look for price with currency symbol
      const priceMatch = parenthesesContent.match(/[£$€](\d+(?:\.\d{2})?)/)
      if (priceMatch) {
        price = parseFloat(priceMatch[1])

        // Determine currency
        if (parenthesesContent.includes('£')) currency = 'GBP' as Currency
        else if (parenthesesContent.includes('$')) currency = 'USD' as Currency
        else if (parenthesesContent.includes('€')) currency = 'EUR' as Currency
      }

      // Check if sold out
      isSoldOut = parenthesesContent.includes('SOLD OUT')
    }

    // Remove the parentheses part for cleaner parsing
    const cleanCategory = category.replace(/\(.*?\)/, '').trim()

    // Determine gender
    if (cleanCategory.includes('FEMALE')) gender = 'FEMALE'
    else if (cleanCategory.includes('MALE')) gender = 'MALE'

    // Determine team size
    if (cleanCategory.includes('PAIRS')) teamSize = 2
    else if (cleanCategory.includes('TEAMS OF 3')) teamSize = 3
    else if (cleanCategory.includes('TEAMS OF 4')) teamSize = 4
    else if (cleanCategory.includes('TEAMS OF 5')) teamSize = 5
    else if (cleanCategory.includes('TEAMS OF 6')) teamSize = 6

    // Map difficulty levels
    if (cleanCategory.includes('SCALED')) difficulty = 'EVERYDAY'
    else if (cleanCategory.includes('INTERMEDIATE')) difficulty = 'INTERMEDIATE'
    else if (cleanCategory.includes('ADVANCED') || cleanCategory.includes('RX'))
      difficulty = 'RX'
    else if (cleanCategory.includes('ELITE')) difficulty = 'ELITE'
    else if (cleanCategory.includes('MASTERS')) difficulty = 'MASTERS'
    else if (cleanCategory.includes('TEEN')) difficulty = 'TEEN'

    return {
      gender,
      teamSize,
      difficulty,
      price,
      currency,
      isSoldOut,
    }
  })
}

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(
  imageUrl: string,
  eventTitle: string,
): Promise<string> {
  try {
    // Skip if the URL is null or contains "null"
    if (!imageUrl || imageUrl.includes('null')) {
      return (
        process.env.DEFAULT_COMPETITION_IMAGE || '/images/default-competition-image.jpg'
      )
    }

    console.log(`Uploading image for "${eventTitle}" from ${imageUrl}`)

    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`)
      return (
        process.env.DEFAULT_COMPETITION_IMAGE || '/images/default-competition-image.jpg'
      )
    }

    // Create a sanitized filename from the event title
    const sanitizedTitle = eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)

    // Upload to Cloudinary
    const buffer = await response.arrayBuffer()
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'competitions',
          public_id: `${sanitizedTitle}-${Date.now()}`,
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

    console.log(`Successfully uploaded image to Cloudinary: ${uploadResult.secure_url}`)
    return uploadResult.secure_url
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    return (
      process.env.DEFAULT_COMPETITION_IMAGE || '/images/default-competition-image.jpg'
    )
  }
}

export const ImportDirectoryComp = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('importDirectoryComp', {
      type: 'Boolean',
      resolve: async (_, {}) => {
        try {
          const pg = getKysely()
          const processedComps: Insertable<DirectoryComp>[] = []

          // Read the CSV file from the root directory
          const csvPath = join(process.cwd(), 'aretas-apr-25.csv')
          const csvData = readFileSync(csvPath, 'utf8')

          // Parse the CSV data
          const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
          })

          console.log(`Found ${records.length} records in CSV`)

          // Process each record
          for (const event of records) {
            const compId = nanoid(6)

            // Parse location
            const location = event.location?.trim() || 'Unknown'
            const cityName = location.split(',')[0]?.trim() || location
            const country = 'United Kingdom' // Default to UK for Aretas events

            // Parse dates
            let startDate = new Date()
            let endDate: Date | null = null

            if (event.date) {
              const dateStr = event.date.trim()

              // Handle date ranges like "2.3.2025 - 31.7.2025"
              if (dateStr.includes('-')) {
                const [start, end] = dateStr.split('-').map((d) => d.trim())
                startDate = parseDate(start) || new Date()
                endDate = parseDate(end)
              }
              // Handle single day events like "18.4.2025 (1 Day)"
              else if (dateStr.includes('(1 Day)')) {
                const singleDate = dateStr.replace('(1 Day)', '').trim()
                startDate = parseDate(singleDate) || new Date()
                endDate = startDate // Same day event
              } else {
                startDate = parseDate(dateStr) || new Date()
              }
            }

            // Parse price and currency
            let price: number | null = null
            let currency: Currency | null = null

            if (event.price) {
              const priceStr = event.price.trim()

              if (priceStr.includes('£')) {
                currency = Currency.Gbp
                price = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
              } else if (priceStr.includes('€')) {
                currency = Currency.Eur
                price = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
              } else if (priceStr.includes('$')) {
                currency = Currency.Usd
                price = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
              } else if (priceStr.toLowerCase() === 'free') {
                price = 0
                currency = Currency.Gbp // Default to GBP for free UK events
              }
            }

            // Parse team size from type field
            let type = event.type?.trim() || 'individuals'

            // Upload image to Cloudinary
            const imageUrl = await uploadImageToCloudinary(event.imageUrl, event.title)

            const compData = {
              id: compId,
              title: `${event.title.trim()}`,
              teamSize: type,
              location: cityName,
              country,
              state: '', // Not applicable for UK
              startDate: startDate.toISOString(),
              endDate: endDate?.toISOString() || null,
              price,
              currency,
              website: event.website || null,
              email: event.email || null,
              logo: imageUrl,
              description: event.description || `${event.title.trim()} in ${cityName}`,
              instagramHandle: event.instagramHandle || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Insertable<DirectoryComp>

            console.log('Inserting DirectoryComp:', compData)

            // Insert the competition into the database
            await pg.insertInto('DirectoryComp').values(compData).execute()

            processedComps.push(compData)

            // After creating the competition, process categories
            if (compId) {
              // Check if "Event Category" exists in this row
              if (event['Event Category']) {
                // Parse the categories
                const parsedCategories = parseCategories(event['Event Category'])
                console.log(
                  `Found ${parsedCategories.length} categories for "${event.title}"`,
                )

                // Insert each parsed category
                for (const parsedCategory of parsedCategories) {
                  const categoryData = {
                    id: nanoid(6),
                    directoryCompId: compId,
                    gender: parsedCategory.gender as 'MALE' | 'FEMALE' | 'MIXED',
                    teamSize: parsedCategory.teamSize,
                    difficulty: parsedCategory.difficulty as
                      | 'ELITE'
                      | 'RX'
                      | 'INTERMEDIATE'
                      | 'EVERYDAY'
                      | 'MASTERS'
                      | 'TEEN',
                    price: parsedCategory.price || 0, // Default to 0 if not specified
                    isSoldOut: parsedCategory.isSoldOut,
                    tags: [], // Default empty tags
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }

                  console.log('Inserting Category:', categoryData)
                  await pg.insertInto('Category').values(categoryData).execute()
                }
              }
            }
          }

          console.log(`Processed ${processedComps.length} competitions`)
          return processedComps.length > 0
        } catch (error: any) {
          console.error('Error importing directory:', error)
          throw new Error(error.message || 'Error importing directory')
        }
      },
    })
  },
})

async function normalizeCategory(rawName: string): Promise<RawCategory> {
  console.log('\nProcessing category:', rawName)

  // Default values in case of AI failure
  const defaultCategory: RawCategory = {
    name: rawName,
    teamSize: 1,
    gender: 'MIXED',
    difficulty: 'RX',
    tags: [],
  }

  try {
    const prompt = `
      Normalize this competition category: "${rawName}"
      Return a JSON object with:
      - gender: must be exactly "MALE", "FEMALE", or "MIXED"
      - teamSize: number of people (1 for individual)
      - difficulty: must be exactly one of "ELITE", "RX", "INTERMEDIATE", "EVERYDAY", "MASTERS", or "TEEN". RX+ is considered ELITE.
      - tags: array of relevant tags (Olympic Lifting, Prize Money etc). Include this if you're confident the name contains tags.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })

    const rawResult = JSON.parse(response.choices[0].message?.content || '{}')
    console.log('Raw AI result:', rawResult)

    // Validate and normalize the AI response
    const validDifficulties = [
      'ELITE',
      'RX',
      'INTERMEDIATE',
      'EVERYDAY',
      'MASTERS',
      'TEEN',
    ]
    const validGenders = ['MALE', 'FEMALE', 'MIXED']

    const result = {
      ...defaultCategory,
      ...rawResult,
      // Ensure valid difficulty
      difficulty: validDifficulties.includes(rawResult.difficulty)
        ? rawResult.difficulty
        : defaultCategory.difficulty,
      // Ensure valid gender
      gender: validGenders.includes(rawResult.gender)
        ? rawResult.gender
        : defaultCategory.gender,
      // Ensure valid teamSize
      teamSize:
        typeof rawResult.teamSize === 'number' && rawResult.teamSize > 0
          ? rawResult.teamSize
          : defaultCategory.teamSize,
      // Ensure tags is an array
      tags: Array.isArray(rawResult.tags) ? rawResult.tags : defaultCategory.tags,
    }

    console.log('Normalized result:', result)
    return result
  } catch (error) {
    console.error('Error normalizing category with AI:', error)
    return defaultCategory
  }
}
