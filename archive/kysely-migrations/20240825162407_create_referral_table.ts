import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Referral table
    await pg.schema
      .createTable('Referral')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('referrerId', 'uuid', (col) => col.notNull())
      .addColumn('referredId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_referral_referrerId', // Foreign key constraint name
        ['referrerId'], // Column(s) in the current table
        'User', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_referral_referredId', // Foreign key constraint name
        ['referredId'], // Column(s) in the current table
        'User', // Referenced table
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

  // Drop the Referral table
  await pg.schema.dropTable('Referral').ifExists().execute()
}
