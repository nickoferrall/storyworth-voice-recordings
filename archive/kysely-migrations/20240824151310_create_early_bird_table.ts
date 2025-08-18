import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the EarlyBird table without the foreign key
    await pg.schema
      .createTable('EarlyBird')
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('startDateTime', 'timestamptz')
      .addColumn('endDateTime', 'timestamptz')
      .addColumn('price', 'float8', (col) => col.notNull())
      .addColumn('limit', 'int4')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
