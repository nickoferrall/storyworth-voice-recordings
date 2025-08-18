import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create enum type Tiebreaker
    await pg.schema
      .createType('Tiebreaker')
      .asEnum(['BEST_OVERALL_FINISH', 'NONE', 'SPECIFIC_WORKOUT'])
      .execute()

    // Create the ScoreSetting table
    await pg.schema
      .createTable('ScoreSetting')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
      .addColumn('penalizeIncomplete', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('penalizeScaled', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('lanes', 'int4', (col) => col.notNull())
      .addColumn('handleTie', sql`"Tiebreaker"`, (col) => col.notNull())
      .addColumn('scoring', sql`"DivisionScoreType"`, (col) => col.notNull()) // Enum type
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_scoreSetting_competitionId', // Foreign key constraint name
        ['competitionId'], // Column(s) in the current table
        'Competition', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the ScoreSetting table
  await pg.schema.dropTable('ScoreSetting').ifExists().execute()

  // Drop enum type Tiebreaker
  await pg.schema.dropType('Tiebreaker').ifExists().execute()
}
