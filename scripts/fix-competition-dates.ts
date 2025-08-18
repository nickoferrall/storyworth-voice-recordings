#!/usr/bin/env ts-node

import getKysely from '../src/db'

/**
 * Script to identify competitions with problematic dates
 * These are likely competitions where date parsing failed and defaulted to current timestamp
 */
async function identifyProblematicDates() {
  console.log('🔍 Identifying competitions with problematic dates...')

  const pg = getKysely()

  // Get the current date range (within last 24 hours)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  try {
    // Find competitions with start dates that are suspiciously close to "now"
    // These are likely parsing failures that defaulted to new Date()
    const problematicComps = await pg
      .selectFrom('Competition')
      .innerJoin('Address', 'Address.id', 'Competition.addressId')
      .select([
        'Competition.id',
        'Competition.name',
        'Competition.startDateTime',
        'Competition.createdAt',
        'Competition.source',
        'Address.city',
        'Address.country',
      ])
      .where('Competition.source', 'in', ['SCRAPED_ARETAS', 'SCRAPED_COMP_CORNER'])
      .where('Competition.startDateTime', '>=', yesterday)
      .where('Competition.startDateTime', '<=', now)
      .orderBy('Competition.startDateTime', 'desc')
      .execute()

    console.log(
      `\n📊 Found ${problematicComps.length} competitions with suspicious dates:`,
    )

    if (problematicComps.length > 0) {
      console.log(
        '\n⚠️  These competitions likely have incorrect dates (defaulted to current time):',
      )
      problematicComps.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.name}`)
        console.log(`   📅 Start: ${comp.startDateTime}`)
        console.log(`   📍 Location: ${comp.city}, ${comp.country}`)
        console.log(`   🏷️  Source: ${comp.source}`)
        console.log(`   🆔 ID: ${comp.id}`)
        console.log('')
      })

      console.log(
        '💡 These competitions should be investigated and potentially re-scraped or manually corrected.',
      )
      console.log(
        '💡 The parseDate function has been fixed to prevent future occurrences.',
      )
    } else {
      console.log('✅ No competitions found with suspicious current timestamps!')
    }

    // Also show chronological order of next 20 competitions
    console.log('\n📅 Current chronological order of next 20 competitions:')
    const upcomingComps = await pg
      .selectFrom('Competition')
      .innerJoin('Address', 'Address.id', 'Competition.addressId')
      .select([
        'Competition.name',
        'Competition.startDateTime',
        'Competition.source',
        'Address.city',
        'Address.country',
      ])
      .where('Competition.isActive', '=', true)
      .where('Competition.startDateTime', '>', now)
      .orderBy('Competition.startDateTime', 'asc')
      .limit(20)
      .execute()

    upcomingComps.forEach((comp, index) => {
      const startDate = new Date(comp.startDateTime)
      console.log(
        `${index + 1}. ${startDate.toLocaleDateString()} - ${comp.name} (${comp.city}, ${comp.country})`,
      )
    })
  } catch (error) {
    console.error('❌ Error running date analysis:', error)
  } finally {
    await pg.destroy()
  }
}

// Run the script
if (require.main === module) {
  identifyProblematicDates().catch(console.error)
}
