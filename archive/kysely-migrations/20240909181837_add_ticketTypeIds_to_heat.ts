import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Add ticketTypeIds column
    await pg.schema
      .alterTable('Heat')
      .addColumn('ticketTypeIds', sql`uuid[]`)
      .execute()

    // Move existing ticketTypeId to ticketTypeIds

    // For now, we'll keep the ticketTypeId column to avoid breaking existing code
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Remove the new column
  await pg.schema.alterTable('Heat').dropColumn('ticketTypeIds').execute()
}
