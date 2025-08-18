import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('totalHeats', 'int4', (col) => col.defaultTo(null))
      .addColumn('oneTicketPerHeat', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('firstHeatStartTime', 'varchar', (col) =>
        col.notNull().defaultTo('08:00'),
      )
      .addColumn('heatsEveryXMinutes', 'int4', (col) => col.notNull().defaultTo(30))
      .execute()

    // Set default values for existing records
    await pg
      .updateTable('ScoreSetting')
      .set({
        totalHeats: null,
        oneTicketPerHeat: true,
        firstHeatStartTime: '08:00',
        heatsEveryXMinutes: 30,
      } as any)
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('ScoreSetting')
      .dropColumn('totalHeats')
      .dropColumn('oneTicketPerHeat')
      .dropColumn('firstHeatStartTime')
      .dropColumn('heatsEveryXMinutes')
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
