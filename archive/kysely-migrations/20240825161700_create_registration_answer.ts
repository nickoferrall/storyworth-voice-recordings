import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the RegistrationAnswer table
    await pg.schema
      .createTable('RegistrationAnswer')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('registrationId', 'uuid', (col) => col.notNull())
      .addColumn('registrationFieldId', 'uuid', (col) => col.notNull())
      .addColumn('answer', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_registrationAnswer_registrationId',
        ['registrationId'],
        'Registration',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        'fk_registrationAnswer_registrationFieldId',
        ['registrationFieldId'],
        'RegistrationField',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .execute()

    // Create index on registrationId and registrationFieldId for RegistrationAnswer table
    await pg.schema
      .createIndex('idx_registrationAnswer_registrationId_registrationFieldId')
      .on('RegistrationAnswer')
      .columns(['registrationId', 'registrationFieldId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema
    .dropIndex('idx_registrationAnswer_registrationId_registrationFieldId')
    .execute()

  // Drop the RegistrationAnswer table
  await pg.schema.dropTable('RegistrationAnswer').ifExists().execute()
}
