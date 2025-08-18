import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Integration table
    await pg.schema
      .createTable('Integration')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('type', 'varchar(50)', (col) => col.notNull()) // e.g., 'STRAVA'
      .addColumn('registrationAnswerId', 'uuid', (col) => col.notNull())
      .addColumn('accessToken', 'text', (col) => col.notNull())
      .addColumn('refreshToken', 'text', (col) => col.notNull())
      .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
      .addColumn('athleteId', 'varchar(255)', (col) => col.notNull())
      .addColumn('athleteFirstname', 'varchar(255)')
      .addColumn('athleteLastname', 'varchar(255)')
      .addColumn('athleteProfile', 'text')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create indexes
    await pg.schema
      .createIndex('idx_integration_registration_answer_id')
      .on('Integration')
      .column('registrationAnswerId')
      .execute()

    await pg.schema
      .createIndex('idx_integration_athlete_id')
      .on('Integration')
      .column('athleteId')
      .execute()

    await pg.schema
      .createIndex('idx_integration_type')
      .on('Integration')
      .column('type')
      .execute()

    // Add foreign key constraint
    await pg.schema
      .alterTable('Integration')
      .addForeignKeyConstraint(
        'fk_integration_registration_answer',
        ['registrationAnswerId'],
        'RegistrationAnswer',
        ['id'],
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Drop indexes first
    await pg.schema.dropIndex('idx_integration_registration_answer_id').execute()
    await pg.schema.dropIndex('idx_integration_athlete_id').execute()
    await pg.schema.dropIndex('idx_integration_type').execute()

    // Drop the table
    await pg.schema.dropTable('Integration').ifExists().execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
