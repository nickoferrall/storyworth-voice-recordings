import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .createType('QuestionType')
      .asEnum([
        'TEXT',
        'EMAIL',
        'MULTIPLE_CHOICE',
        'MULTIPLE_CHOICE_SELECT_ONE',
        'DROPDOWN',
        'STATEMENT',
      ])
      .execute()

    // Create the RequiredStatus enum
    await pg.schema
      .createType('RequiredStatus')
      .asEnum(['REQUIRED', 'OPTIONAL', 'OFF'])
      .execute()

    // Create the RegistrationField table
    await pg.schema
      .createTable('RegistrationField')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('question', 'varchar(255)', (col) => col.notNull())
      .addColumn('type', sql`"QuestionType"`, (col) => col.notNull()) // Enum for question type
      .addColumn('requiredStatus', sql`"RequiredStatus"`, (col) => col.notNull()) // Enum for required status
      .addColumn('isEditable', 'boolean', (col) => col.notNull())
      .addColumn('options', sql`text[]`) // Array of options
      .addColumn('sortOrder', 'int4', (col) => col.notNull())
      .addColumn('repeatPerAthlete', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('onlyTeams', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create a unique index on id and sortOrder
    await pg.schema
      .createIndex('idx_registrationfield_id_sortOrder')
      .on('RegistrationField')
      .columns(['id', 'sortOrder'])
      .unique()
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the index first
  await pg.schema.dropIndex('idx_registrationfield_id_sortOrder').execute()

  // Drop the RegistrationField table
  await pg.schema.dropTable('RegistrationField').ifExists().execute()

  // Drop the enums
  await pg.schema.dropType('QuestionType').ifExists().execute()
  await pg.schema.dropType('RequiredStatus').ifExists().execute()
}
