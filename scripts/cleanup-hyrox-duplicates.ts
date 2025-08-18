#!/usr/bin/env ts-node

import getKysely from '../src/db'

async function main() {
  const db = getKysely()

  const rows = await db
    .selectFrom('PotentialCompetition')
    .select(['id', 'name', 'startDateTime', 'source'])
    .where('source', '=', 'OFFICIAL_HYROX')
    .orderBy('name asc')
    .orderBy('startDateTime asc')
    .orderBy('id asc')
    .execute()

  const groups = new Map<string, string[]>()
  for (const r of rows) {
    const key = `${(r.name || '').trim().toLowerCase()}|${new Date(r.startDateTime as any).toISOString().slice(0, 10)}`
    const list = groups.get(key) || []
    list.push(r.id)
    groups.set(key, list)
  }

  let removed = 0
  for (const [_key, ids] of groups) {
    if (ids.length <= 1) continue
    const [keep, ...dupes] = ids

    // Delete ticket types for duplicates
    if (dupes.length > 0) {
      await db
        .deleteFrom('PotentialTicketType')
        .where((eb) => eb('potentialCompetitionId', 'in', dupes))
        .execute()

      await db
        .deleteFrom('PotentialCompetition')
        .where((eb) => eb('id', 'in', dupes))
        .execute()

      removed += dupes.length
      // eslint-disable-next-line no-console
      console.log(`Removed ${dupes.length} duplicate(s); kept ${keep}`)
    }
  }

  console.log(`Done. Removed ${removed} duplicate OFFICIAL_HYROX records.`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
