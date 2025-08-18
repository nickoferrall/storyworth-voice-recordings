import { sql } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()
  try {
    // Insert data from the ticketTypeIds array in Heat table to the new joiner table
    const heats = await pg.selectFrom('Heat').selectAll().execute()
    for (const heat of heats) {
      if (heat.ticketTypeIds && Array.isArray(heat.ticketTypeIds)) {
        for (const ticketTypeId of heat.ticketTypeIds) {
          if (ticketTypeId) {
            await pg
              .insertInto('HeatTicketTypes')
              .values({ heatId: heat.id, ticketTypeId })
              .execute()
          }
        }
      }
    }

    console.log('Successfully migrated ticketTypeIds to HeatTicketTypes')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(): Promise<void> {
  const pg = getKysely()
  try {
    // Add the ticketTypeIds column back to Heat table
    await pg.schema
      .alterTable('Heat')
      .addColumn('ticketTypeIds', sql`uuid[]`, (col) =>
        col.defaultTo(sql`ARRAY[]::uuid[]`),
      )
      .execute()

    console.log('Successfully added ticketTypeIds column back to Heat table')

    // Revert data from the joiner table back to Heat
    const heatTicketTypes = await pg.selectFrom('HeatTicketTypes').selectAll().execute()
    const heatMap: Record<string, string[]> = {}

    for (const row of heatTicketTypes) {
      if (row.heatId && row.ticketTypeId) {
        if (!heatMap[row.heatId]) {
          heatMap[row.heatId] = []
        }
        heatMap[row.heatId].push(row.ticketTypeId)
      }
    }

    for (const heatId in heatMap) {
      await pg
        .updateTable('Heat')
        .set({ ticketTypeIds: heatMap[heatId] })
        .where('id', '=', heatId)
        .execute()
    }

    console.log('Successfully reverted ticketTypeIds back to Heat table')
  } catch (error) {
    console.error('Rollback failed:', error)
  }
}
