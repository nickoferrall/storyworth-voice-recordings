import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Create enum for status
  await pg.schema
    .createType('PartnerRequestStatus')
    .asEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'])
    .execute()

  await pg.schema
    .createTable('PartnerRequest')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('fromInterestId', 'uuid') // Made nullable for direct user requests
    .addColumn('fromUserId', 'uuid') // Direct user requests
    .addColumn('toInterestId', 'uuid', (col) => col.notNull())
    .addColumn('message', 'text') // Optional message with request
    .addColumn('status', sql`"PartnerRequestStatus"`, (col) =>
      col.notNull().defaultTo('PENDING'),
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addForeignKeyConstraint(
      'fk_partner_request_toInterestId',
      ['toInterestId'],
      'PartnerInterest',
      ['id'],
      (cb) => cb.onDelete('cascade'),
    )
    .execute()

  // Unique indexes to prevent duplicate requests
  // For interest-to-interest requests
  await pg.schema
    .createIndex('idx_partner_request_unique_interest_to')
    .on('PartnerRequest')
    .columns(['fromInterestId', 'toInterestId'])
    .unique()
    .where('fromInterestId', 'is not', null)
    .execute()

  // For user-to-interest requests
  await pg.schema
    .createIndex('idx_partner_request_unique_user_to')
    .on('PartnerRequest')
    .columns(['fromUserId', 'toInterestId'])
    .unique()
    .where('fromUserId', 'is not', null)
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema.dropIndex('idx_partner_request_unique_interest_to').ifExists().execute()
  await pg.schema.dropIndex('idx_partner_request_unique_user_to').ifExists().execute()
  await pg.schema.dropTable('PartnerRequest').ifExists().execute()
  await pg.schema.dropType('PartnerRequestStatus').ifExists().execute()
}
