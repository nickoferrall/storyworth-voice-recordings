import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Drop the table if it exists
    await pg.schema.dropTable('User').ifExists().execute()

    // Create the User table
    await pg.schema
      .createTable('User')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('firstName', 'varchar(255)', (col) => col.notNull())
      .addColumn('lastName', 'varchar(255)')
      .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
      .addColumn('picture', 'varchar(255)')
      .addColumn('hashedPassword', 'varchar(255)')
      .addColumn('isVerified', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('verificationToken', 'varchar(255)')
      .addColumn('invitationId', 'varchar(255)')
      .addColumn('athleteCompetitionIds', sql`text[]`, (col) =>
        col.defaultTo(sql`ARRAY[]::text[]`),
      )
      .addColumn('createdCompetitionIds', sql`text[]`, (col) =>
        col.defaultTo(sql`ARRAY[]::text[]`),
      )
      .addColumn('referredBy', 'varchar(255)')
      .addColumn('referralCode', 'varchar(255)')
      .addColumn('orgId', 'uuid')
      .addColumn('stripeCustomerId', 'varchar(255)')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create index on referralCode for User table
    await pg.schema
      .createIndex('idx_user_referral_code')
      .on('User')
      .column('referralCode')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  // Drop index from User table
  await pg.schema.dropIndex('idx_user_referral_code').execute()
  // Drop User table
  await pg.schema.dropTable('User').execute()
}
