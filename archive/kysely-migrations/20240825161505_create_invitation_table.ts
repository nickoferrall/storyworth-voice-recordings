import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the InvitationStatus enum type
    await pg.schema
      .createType('InvitationStatus')
      .asEnum(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'])
      .execute()

    // Create the Invitation table
    await pg.schema
      .createTable('Invitation')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('teamId', 'uuid', (col) => col.notNull())
      .addColumn('token', 'varchar(255)', (col) => col.notNull().unique())
      .addColumn('email', 'varchar(255)', (col) => col.notNull())
      .addColumn('status', sql`"InvitationStatus"`, (col) =>
        col.notNull().defaultTo('PENDING'),
      )

      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('sentByUserId', 'uuid', (col) => col.notNull())
      .addForeignKeyConstraint(
        'fk_invitation_teamId', // Foreign key constraint name
        ['teamId'], // Column(s) in the current table
        'Team', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_invitation_sentByUserId', // Foreign key constraint name
        ['sentByUserId'], // Column(s) in the current table
        'User', // Referenced table
        ['id'], // Column(s) in the referenced table
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the Invitation table first
  await pg.schema.dropTable('Invitation').ifExists().execute()

  // Drop the InvitationStatus enum type
  await pg.schema.dropType('InvitationStatus').ifExists().execute()
}
