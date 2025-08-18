import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Org table
    await pg.schema
      .createTable('Org')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('image', 'varchar(255)', (col) => col.notNull())
      .addColumn('email', 'varchar(255)', (col) => col.notNull())
      .addColumn('contactNumber', 'varchar(50)')
      .addColumn('description', 'text')
      .addColumn('website', 'varchar(255)')
      .addColumn('logo', 'varchar(255)')
      .addColumn('facebook', 'varchar(255)')
      .addColumn('instagram', 'varchar(255)')
      .addColumn('twitter', 'varchar(255)')
      .addColumn('youtube', 'varchar(255)')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create index on name for Org table
    await pg.schema.createIndex('idx_org_name').on('Org').column('name').execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop index first
  await pg.schema.dropIndex('idx_org_name').execute()

  // Drop the Org table
  await pg.schema.dropTable('Org').ifExists().execute()
}
