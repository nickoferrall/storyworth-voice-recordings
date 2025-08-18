#!/usr/bin/env ts-node

import getKysely from '../src/db'
import { v2 as cloudinary } from 'cloudinary'
import puppeteer from 'puppeteer'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadImageToCloudinary(
  imageUrl: string,
  eventTitle: string,
): Promise<string> {
  try {
    if (!imageUrl || imageUrl.includes('null')) {
      return ''
    }

    console.log(`📤 Uploading image for "${eventTitle}" from ${imageUrl}`)

    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`)
      return ''
    }

    const sanitizedTitle =
      eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) || 'event'

    const buffer = await response.arrayBuffer()
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'competitions',
          public_id: `aretas-${sanitizedTitle}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )

      uploadStream.end(Buffer.from(buffer))
    })

    console.log(`✅ Uploaded image to Cloudinary: ${uploadResult.secure_url}`)
    return uploadResult.secure_url
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error)
    return ''
  }
}

async function extractAretasLogos() {
  console.log('🚀 Starting Aretas logo extraction...')

  const pg = getKysely()

  // Get all Aretas potential competitions without logos (null or empty string)
  const competitions = await pg
    .selectFrom('PotentialCompetition')
    .select(['id', 'name', 'scrapedData', 'logo'])
    .where('source', '=', 'SCRAPED_ARETAS')
    .where((eb) => eb.or([eb('logo', 'is', null), eb('logo', '=', '')]))
    .execute()

  console.log(`Found ${competitions.length} Aretas competitions without logos`)

  if (competitions.length === 0) {
    console.log('✅ All Aretas competitions already have logos!')
    return
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let successCount = 0
  let errorCount = 0

  try {
    // Process competitions in small batches to avoid overwhelming the browser
    const batchSize = 5
    for (let i = 0; i < competitions.length; i += batchSize) {
      const batch = competitions.slice(i, i + batchSize)
      console.log(
        `\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(competitions.length / batchSize)}`,
      )

      // Process batch in parallel with individual pages
      await Promise.allSettled(
        batch.map(async (comp) => {
          const page = await browser.newPage()
          try {
            // Get detailsLink from scraped data (already an object, no need to parse)
            const scrapedData = comp.scrapedData as any
            const detailsLink = scrapedData?.detailsLink

            if (!detailsLink) {
              console.log(`⚠️ No details link for: ${comp.name}`)
              return
            }

            const completeLink = `https://team-aretas.com${detailsLink}`
            console.log(`🖼️ Extracting logo for: ${comp.name}`)

            await page.goto(completeLink, {
              waitUntil: 'networkidle0',
              timeout: 15000,
            })

            // Extract logo using the exact structure you provided
            const imageUrl = await page.evaluate(() => {
              const logoDiv = document.querySelector('#logo') as HTMLElement | null
              if (!logoDiv) return ''

              const backgroundImage = logoDiv.style.backgroundImage
              // Extract URL from: background-image: url("https://cdn.team-aretas.com/...")
              const match = backgroundImage.match(/url\(['"]([^'"]+)['"]\)/)
              return match ? match[1] : ''
            })

            if (imageUrl) {
              console.log(`🌐 Found logo URL: ${imageUrl}`)

              // Upload to Cloudinary
              const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, comp.name)

              if (cloudinaryUrl) {
                // Update the competition with the logo
                await pg
                  .updateTable('PotentialCompetition')
                  .set({ logo: cloudinaryUrl })
                  .where('id', '=', comp.id)
                  .execute()

                console.log(`✅ Updated logo for: ${comp.name}`)
                successCount++
              }
            } else {
              console.log(`⚠️ No logo found for: ${comp.name}`)
            }
          } catch (error) {
            console.error(`❌ Error processing ${comp.name}:`, error)
            errorCount++
          } finally {
            await page.close()
          }
        }),
      )

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } finally {
    await browser.close()
  }

  console.log(`\n📊 Logo extraction completed:`)
  console.log(`✅ Success: ${successCount} competitions`)
  console.log(`❌ Errors: ${errorCount} competitions`)
  console.log(`📝 Total processed: ${competitions.length} competitions`)
}

// Run if called directly
if (require.main === module) {
  extractAretasLogos()
    .then(() => {
      console.log('🎉 Logo extraction finished!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { extractAretasLogos }
