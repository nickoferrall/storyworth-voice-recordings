import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Migrate existing data
    await pg
      .updateTable('NotificationSubscription')
      .set({
        countries: sql`ARRAY[country]::text[]`,
        locations: sql`ARRAY[location]::text[]`,
      })
      .where('country', 'is not', null)
      .execute()

    // Drop old columns
    await pg.schema
      .alterTable('NotificationSubscription')
      .dropColumn('country')
      .dropColumn('location')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Add back the original columns
    await pg.schema
      .alterTable('NotificationSubscription')
      .addColumn('country', 'varchar(255)')
      .addColumn('location', 'varchar(255)')
      .execute()

    // Migrate data back
    await pg
      .updateTable('NotificationSubscription')
      .set({
        country: sql`(countries)[1]`,
        location: sql`(locations)[1]`,
      })
      .execute()

    // Drop the array columns
    await pg.schema
      .alterTable('NotificationSubscription')
      .dropColumn('countries')
      .dropColumn('locations')
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
