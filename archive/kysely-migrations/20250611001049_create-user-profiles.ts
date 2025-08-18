import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    console.log('Starting UserProfile table creation...')

    // Create user_profiles table
    await pg.schema
      .createTable('UserProfile')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) => col.primaryKey())
      .addColumn('email', 'text', (col) => col.notNull().unique())
      .addColumn('firstName', 'text', (col) => col.notNull())
      .addColumn('lastName', 'text')
      .addColumn('picture', 'text')
      .addColumn('bio', 'text')
      .addColumn('isSuperUser', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('isVerified', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    console.log('UserProfile table created successfully')

    // Create indexes
    await pg.schema
      .createIndex('idx_user_profile_id')
      .on('UserProfile')
      .column('id')
      .execute()

    await pg.schema
      .createIndex('idx_user_profile_email')
      .on('UserProfile')
      .column('email')
      .execute()

    console.log('Index created successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    console.log('Starting rollback...')

    // Drop indexes
    await pg.schema.dropIndex('idx_user_profile_email').ifExists().execute()
    await pg.schema.dropIndex('idx_user_profile_id').ifExists().execute()
    console.log('Index dropped successfully')

    // Drop table
    await pg.schema.dropTable('UserProfile').ifExists().execute()
    console.log('UserProfile table dropped successfully')
  } catch (error) {
    console.error('Rollback failed:', error)
    throw error
  }
}
