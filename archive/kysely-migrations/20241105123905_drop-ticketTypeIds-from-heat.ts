import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Drop the old columns from Heat table
    await pg.schema
      .alterTable('Heat')
      .dropColumn('ticketTypeId')
      .dropColumn('ticketTypeIds')
      .execute()

    console.log('Successfully removed ticketType columns from Heat table')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Restore the columns if we need to roll back
    await pg.schema
      .alterTable('Heat')
      .addColumn('ticketTypeId', 'uuid', (col) =>
        col.references('TicketType.id').onDelete('cascade'),
      )
      .addColumn('ticketTypeIds', sql`uuid[]`)
      .execute()

    console.log('Successfully restored ticketType columns to Heat table')
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
