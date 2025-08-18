import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Create enum for team member status
  await pg.schema
    .createType('PartnerInterestTeamMemberStatus')
    .asEnum(['INVITED', 'ACCEPTED', 'REJECTED'])
    .execute()

  // Create PartnerInterestTeamMember table
  await pg.schema
    .createTable('PartnerInterestTeamMember')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('partnerInterestId', 'uuid', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('userId', 'uuid') // Null if they don't have an account yet
    .addColumn('status', sql`"PartnerInterestTeamMemberStatus"`, (col) =>
      col.notNull().defaultTo('INVITED'),
    )
    .addColumn('invitationToken', 'text') // For tracking invitation links
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addForeignKeyConstraint(
      'fk_partner_interest_team_member_partner_interest',
      ['partnerInterestId'],
      'PartnerInterest',
      ['id'],
      (cb) => cb.onDelete('cascade'),
    )
    .execute()

  // Create indexes
  await pg.schema
    .createIndex('idx_partner_interest_team_member_partner_interest_id')
    .on('PartnerInterestTeamMember')
    .column('partnerInterestId')
    .execute()

  await pg.schema
    .createIndex('idx_partner_interest_team_member_email')
    .on('PartnerInterestTeamMember')
    .column('email')
    .execute()

  await pg.schema
    .createIndex('idx_partner_interest_team_member_user_id')
    .on('PartnerInterestTeamMember')
    .column('userId')
    .execute()

  await pg.schema
    .createIndex('idx_partner_interest_team_member_token')
    .on('PartnerInterestTeamMember')
    .column('invitationToken')
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  // Drop indexes
  await pg.schema
    .dropIndex('idx_partner_interest_team_member_partner_interest_id')
    .ifExists()
    .execute()
  await pg.schema.dropIndex('idx_partner_interest_team_member_email').ifExists().execute()
  await pg.schema
    .dropIndex('idx_partner_interest_team_member_user_id')
    .ifExists()
    .execute()
  await pg.schema.dropIndex('idx_partner_interest_team_member_token').ifExists().execute()

  // Drop table and enum
  await pg.schema.dropTable('PartnerInterestTeamMember').ifExists().execute()
  await pg.schema.dropType('PartnerInterestTeamMemberStatus').ifExists().execute()
}
