import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Create enum types
  await pg.schema
    .createType('CompetitionType')
    .asEnum([
      'CHARITY',
      'CROSSFIT_LICENCED_EVENT',
      'CROSSFIT_SEMI_FINALS',
      'IN_HOUSE',
      'ELITE',
      'INTERMEDIATE',
      'MASTERS',
      'OLYMPIC_WEIGHTLIFTING',
      'POWERLIFTING',
      'PRIZE_AWARDED',
      'QUALIFIER',
      'STRONGMAN',
      'TEEN',
      'VIRTUAL',
      'WOMENS_ONLY',
    ])
    .execute()

  await pg.schema.createType('Gender').asEnum(['MALE', 'FEMALE', 'OTHER']).execute()

  await pg.schema
    .createType('Difficulty')
    .asEnum(['RX', 'SCALED', 'EVERYDAY', 'ELITE', 'OPEN'])
    .execute()

  // Create the Competition table
  await pg.schema

    .createTable('Competition')
    .ifNotExists()
    .addColumn('id', 'varchar(8)', (col) => col.primaryKey()) // Shorter ID with a length of
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('types', sql`"CompetitionType"[]`) // Enum array with correct casing, nullable
    .addColumn('gender', sql`"Gender"`)
    .addColumn('difficulty', sql`"Difficulty"`) // Ensure the casing matches the enum type
    .addColumn('description', 'text')
    .addColumn('startDateTime', 'timestamptz', (col) => col.notNull())
    .addColumn('endDateTime', 'timestamptz', (col) => col.notNull())
    .addColumn('addressId', 'uuid', (col) => col.notNull())
    .addColumn('timezone', 'varchar(255)')
    .addColumn('logo', 'varchar(255)')
    .addColumn('createdByUserId', 'uuid', (col) => col.notNull())
    .addColumn('orgId', 'uuid')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  // Create index on name and orgId for Competition table
  await pg.schema
    .createIndex('idx_competition_name_orgId')
    .on('Competition')
    .columns(['name', 'orgId'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  await pg.schema.dropTable('Competition').ifExists().execute()
  await pg.schema.dropType('CompetitionType').ifExists().execute()
  await pg.schema.dropType('Gender').ifExists().execute()
  await pg.schema.dropType('Difficulty').ifExists().execute()
}
