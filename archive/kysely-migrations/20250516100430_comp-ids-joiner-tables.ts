import { Kysely, sql } from 'kysely'
import getKysely from '../../db' // Assuming this is your Kysely instance getter

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely() // Use your specific Kysely instance getter

  // --- Drop existing joiner tables first to ensure a clean slate ---
  // Dropping tables automatically drops their foreign key constraints and indexes
  await pg.schema.dropTable('AthleteCompetition').ifExists().execute()
  await pg.schema.dropTable('CompetitionCreator').ifExists().execute()
  console.log(
    'Attempted to drop AthleteCompetition and CompetitionCreator tables if they existed.',
  )

  // --- Create AthleteCompetition Table ---
  await pg.schema
    .createTable('AthleteCompetition')
    // .ifNotExists() // Not strictly needed now as we drop it first, but harmless
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('userId', 'uuid', (col) => col.notNull())
    .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    // Ensures a user can only be an athlete in a specific competition once
    .addUniqueConstraint('uq_athlete_competition_user_competition', [
      'userId',
      'competitionId',
    ])
    .execute()

  // Add foreign key for AthleteCompetition.userId to auth.users.id
  // No need to drop constraint first as the table is dropped and recreated
  await pg.schema
    .alterTable('AthleteCompetition')
    .addForeignKeyConstraint(
      'fk_athlete_competition_user',
      ['userId'],
      'auth.users', // Supabase auth users table
      ['id'],
    )
    .execute()

  // Add foreign key for AthleteCompetition.competitionId to public.Competition.id
  // No need to drop constraint first as the table is dropped and recreated
  await pg.schema
    .alterTable('AthleteCompetition')
    .addForeignKeyConstraint(
      'fk_athlete_competition_competition',
      ['competitionId'],
      'Competition', // Your competitions table
      ['id'],
    )
    .execute()

  // Create indexes for AthleteCompetition
  await pg.schema
    .createIndex('idx_athlete_competition_user_id')
    .on('AthleteCompetition')
    .column('userId')
    .execute()

  await pg.schema
    .createIndex('idx_athlete_competition_competition_id')
    .on('AthleteCompetition')
    .column('competitionId')
    .execute()

  // --- Create CompetitionCreator Table ---
  await pg.schema
    .createTable('CompetitionCreator')
    // .ifNotExists() // Not strictly needed now as we drop it first, but harmless
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('userId', 'uuid', (col) => col.notNull())
    .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    // Ensures a user can only be the creator of a specific competition once
    .addUniqueConstraint('uq_competition_creator_user_competition', [
      'userId',
      'competitionId',
    ])
    .execute()

  // Add foreign key for CompetitionCreator.userId to auth.users.id
  // No need to drop constraint first as the table is dropped and recreated
  await pg.schema
    .alterTable('CompetitionCreator')
    .addForeignKeyConstraint(
      'fk_competition_creator_user',
      ['userId'],
      'auth.users', // Supabase auth users table
      ['id'],
    )
    .execute()

  // Add foreign key for CompetitionCreator.competitionId to public.Competition.id
  // No need to drop constraint first as the table is dropped and recreated
  await pg.schema
    .alterTable('CompetitionCreator')
    .addForeignKeyConstraint(
      'fk_competition_creator_competition',
      ['competitionId'],
      'Competition', // Your competitions table
      ['id'],
    )
    .execute()

  // Create indexes for CompetitionCreator
  await pg.schema
    .createIndex('idx_competition_creator_user_id')
    .on('CompetitionCreator')
    .column('userId')
    .execute()

  await pg.schema
    .createIndex('idx_competition_creator_competition_id')
    .on('CompetitionCreator')
    .column('competitionId')
    .execute()

  // --- Old array columns from User table are NO LONGER REMOVED ---
  // console.log(
  //   'Migration for joiner tables (AthleteCompetition, CompetitionCreator) successful. User table columns athleteCompetitionIds and createdCompetitionIds were NOT removed.',
  // )
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely() // Use your specific Kysely instance getter

  // --- Drop CompetitionCreator Table and its indexes ---
  // Foreign key constraints are dropped when the table is dropped.
  // Indexes are typically dropped when the table is dropped, but explicit drop is safer for some DBs or if named differently.
  await pg.schema.dropIndex('idx_competition_creator_user_id').ifExists().execute()
  await pg.schema.dropIndex('idx_competition_creator_competition_id').ifExists().execute()
  await pg.schema.dropTable('CompetitionCreator').ifExists().execute()

  // --- Drop AthleteCompetition Table and its indexes ---
  await pg.schema.dropIndex('idx_athlete_competition_user_id').ifExists().execute()
  await pg.schema.dropIndex('idx_athlete_competition_competition_id').ifExists().execute()
  await pg.schema.dropTable('AthleteCompetition').ifExists().execute()

  // --- Old array columns are NOT re-added to User table ---
  // as they were not removed by this migration's 'up' function.
  // console.log(
  //   "Rolled back joiner tables. User table columns 'athleteCompetitionIds' and 'createdCompetitionIds' were not touched by this migration's down function.",
  // )
}
