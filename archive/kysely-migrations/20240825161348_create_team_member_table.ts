import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the TeamMember table
    await pg.schema
      .createTable('TeamMember')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('teamId', 'uuid', (col) => col.notNull())
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_team_member_teamId', // Foreign key constraint name
        ['teamId'], // Column(s) in the current table
        'Team', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_team_member_userId', // Foreign key constraint name
        ['userId'], // Column(s) in the current table
        'User', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Create a unique index on teamId and userId
    await pg.schema
      .createIndex('idx_team_member_unique_teamId_userId')
      .on('TeamMember')
      .columns(['teamId', 'userId'])
      .unique()
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_team_member_unique_teamId_userId').execute()

  // Drop the TeamMember table
  await pg.schema.dropTable('TeamMember').ifExists().execute()
}
