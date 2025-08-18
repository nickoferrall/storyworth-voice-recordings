import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create enum types
    await pg.schema
      .createType('ScoreType')
      .asEnum([
        'REPS_MORE_IS_BETTER',
        'REPS_LESS_IS_BETTER',
        'WEIGHT_MORE_IS_BETTER',
        'WEIGHT_LESS_IS_BETTER',
        'TIME_MORE_IS_BETTER',
        'TIME_LESS_IS_BETTER',
      ])
      .execute()

    await pg.schema
      .createType('DivisionScoreType')
      .asEnum(['POINTS_PER_PLACE', 'POINT_BASED', 'CUMULATIVE_UNITS'])
      .execute()

    await pg.schema
      .createType('Currency')
      .asEnum(['USD', 'EUR', 'GBP', 'JPY', 'AUD']) // Add more currencies as needed
      .execute()

    await pg.schema
      .createType('Unit')
      .asEnum([
        'REPS',
        'FEET',
        'METERS',
        'KILOMETERS',
        'KILOGRAMS',
        'POUNDS',
        'MILES',
        'PLACEMENT',
        'CALORIES',
        'ROUND',
        'OTHER',
        'SECONDS',
        'MINUTES',
      ])
      .execute()

    // Create the TicketType table
    await pg.schema
      .createTable('TicketType')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('maxEntries', 'int4', (col) => col.notNull())
      .addColumn('teamSize', 'int4', (col) => col.notNull())
      .addColumn('price', 'float8', (col) => col.notNull())
      .addColumn('currency', sql`"Currency"`) // Enum type
      .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
      .addColumn('earlyBirdId', 'uuid')
      .addColumn('stripeProductId', 'varchar(255)')
      .addColumn('stripePriceId', 'varchar(255)')
      .addColumn('isVolunteer', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('passOnPlatformFee', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('refundPolicy', 'text')
      .addColumn('divisionScoreType', sql`"DivisionScoreType"`) // Enum type
      .addColumn('allowHeatSelection', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('maxEntriesPerHeat', 'int4')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_competitionId', // Foreign key constraint name
        ['competitionId'], // Column(s) in the current table
        'Competition', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_earlyBirdId', // Foreign key constraint name
        ['earlyBirdId'], // Column(s) in the current table
        'EarlyBird', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('set null'), // Behavior on delete
      )
      .execute()

    await pg.schema
      .alterTable('EarlyBird')
      .addColumn('ticketTypeId', 'uuid', (col) => col.unique())
      .execute()

    // Add the foreign key constraint
    await pg.schema
      .alterTable('EarlyBird')
      .addForeignKeyConstraint(
        'fk_ticketTypeId', // Foreign key constraint name
        ['ticketTypeId'], // Column(s) in the current table
        'TicketType', // Referenced table
        ['id'], // Column(s) in the referenced table
      )
      .onDelete('set null') // Specify the onDelete behavior separately
      .execute()

    // Create index on id, name, and earlyBirdId for TicketType table
    await pg.schema
      .createIndex('idx_ticketType_id_name_earlyBirdId')
      .on('TicketType')
      .columns(['id', 'name', 'earlyBirdId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_ticketType_id_name_earlyBirdId').execute()

  // Drop the TicketType table
  await pg.schema.dropTable('TicketType').ifExists().execute()

  // Drop enum types
  await pg.schema.dropType('ScoreType').ifExists().execute()
  await pg.schema.dropType('DivisionScoreType').ifExists().execute()
  await pg.schema.dropType('unit').ifExists().execute()
}
