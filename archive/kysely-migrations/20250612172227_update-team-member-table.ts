import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Create enum for status
  await pg.schema
    .createType('TeamMemberStatus')
    .asEnum(['PENDING', 'ACCEPTED', 'REJECTED'])
    .execute()

  // Add email column (nullable)
  await pg.schema.alterTable('TeamMember').addColumn('email', 'varchar(255)').execute()

  // Add status column (default 'ACCEPTED'), use quoted type name
  await pg.schema
    .alterTable('TeamMember')
    .addColumn('status', sql`"TeamMemberStatus"`, (col) => col.defaultTo('ACCEPTED'))
    .execute()

  // Backfill email for existing members using Kysely's query builder
  await pg
    .updateTable('TeamMember')
    .set({ email: sql.ref('UserProfile.email') } as any)
    .from('UserProfile')
    .whereRef('TeamMember.userId', '=', 'UserProfile.id')
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  // Remove status column
  await pg.schema.alterTable('TeamMember').dropColumn('status').execute()

  // Remove email column
  await pg.schema.alterTable('TeamMember').dropColumn('email').execute()

  // Drop enum type
  await pg.schema.dropType('TeamMemberStatus').ifExists().execute()
}
