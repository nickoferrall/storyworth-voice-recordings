#!/usr/bin/env ts-node

import getKysely from '../src/db'
import { HyroxScraper } from '../scrapers/hyrox'

async function main() {
  const pg = getKysely()
  const scraper = new HyroxScraper() as any

  const comps = await pg.selectFrom('PotentialCompetition').selectAll().execute()

  let updated = 0
  for (const comp of comps) {
    const addr = comp.addressId
      ? await pg
          .selectFrom('Address')
          .selectAll()
          .where('id', '=', comp.addressId)
          .executeTakeFirst()
      : null

    const needsCity = !addr?.city
    const needsCountry = !comp.country
    if (!needsCity && !needsCountry) continue

    const title = comp.name || ''
    let { city, country } = scraper.parseCityCountryFromTitle(title)

    if ((!city || !country) && scraper.determineLocationWithAI) {
      try {
        const ai = await scraper.determineLocationWithAI(title)
        if (!city && ai.city) city = scraper.normalizeCase(ai.city)
        if (!country && ai.country) country = scraper.normalizeCase(ai.country)
      } catch {}
    }

    if (!country && city && scraper.cityToCountryMap) {
      const mapped = scraper.cityToCountryMap()[String(city).toLowerCase()]
      if (mapped) country = mapped
    }

    if (city || country) {
      if (!comp.addressId) {
        const newAddr = await pg
          .insertInto('Address')
          .values({
            venue: null,
            street: null,
            city: city || null,
            postcode: null,
            country: country || null,
          })
          .returningAll()
          .executeTakeFirstOrThrow()
        await pg
          .updateTable('PotentialCompetition')
          .set({ country: country || null, addressId: newAddr.id })
          .where('id', '=', comp.id)
          .execute()
      } else {
        await pg
          .updateTable('Address')
          .set({ city: city || null, country: country || null })
          .where('id', '=', comp.addressId)
          .execute()
        await pg
          .updateTable('PotentialCompetition')
          .set({ country: country || null })
          .where('id', '=', comp.id)
          .execute()
      }
      updated++
    }
  }

  console.log(`✅ Updated locations for ${updated} potential competitions`)
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Failed to fix locations:', e)
  process.exit(1)
})
