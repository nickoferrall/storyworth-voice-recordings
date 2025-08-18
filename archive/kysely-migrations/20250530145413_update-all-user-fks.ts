import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.log('Making userId columns nullable temporarily...')

  await pg.schema
    .alterTable('Registration')
    .alterColumn('userId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('TeamMember')
    .alterColumn('userId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('Payment')
    .alterColumn('userId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('Entry')
    .alterColumn('userId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('TeammateListing')
    .alterColumn('userId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('Invitation')
    .alterColumn('sentByUserId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('Referral')
    .alterColumn('referrerId', (col) => col.dropNotNull())
    .execute()
  await pg.schema
    .alterTable('Referral')
    .alterColumn('referredId', (col) => col.dropNotNull())
    .execute()

  console.log('Setting orphaned userIds to NULL BEFORE adding constraints...')

  await pg
    .updateTable('Registration')
    .set({ userId: sql`NULL` })
    .where('userId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('TeamMember')
    .set({ userId: sql`NULL` })
    .where('userId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('Payment')
    .set({ userId: sql`NULL` })
    .where('userId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('Entry')
    .set({ userId: sql`NULL` })
    .where('userId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('TeammateListing')
    .set({ userId: sql`NULL` })
    .where('userId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('Invitation')
    .set({ sentByUserId: sql`NULL` })
    .where('sentByUserId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('Referral')
    .set({ referrerId: sql`NULL` })
    .where('referrerId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  await pg
    .updateTable('Referral')
    .set({ referredId: sql`NULL` })
    .where('referredId', 'not in', pg.selectFrom('auth.users').select('id'))
    .execute()

  console.log(
    'Updating all foreign key constraints to reference auth.users instead of User table...',
  )

  // Drop all existing User table constraints
  await pg.schema
    .alterTable('TeammateListing')
    .dropConstraint('TeammateListing_userId_fkey')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('TeamMember')
    .dropConstraint('fk_team_member_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Invitation')
    .dropConstraint('fk_invitation_sentByUserId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Registration')
    .dropConstraint('fk_registration_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Payment')
    .dropConstraint('fk_payment_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Referral')
    .dropConstraint('fk_referral_referrerId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Referral')
    .dropConstraint('fk_referral_referredId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Feedback')
    .dropConstraint('fk_feedback_userId')
    .ifExists()
    .execute()

  // Add new constraints pointing to auth.users
  await pg.schema
    .alterTable('TeammateListing')
    .addForeignKeyConstraint('TeammateListing_userId_fkey', ['userId'], 'auth.users', [
      'id',
    ])
    .execute()

  await pg.schema
    .alterTable('TeamMember')
    .addForeignKeyConstraint('fk_team_member_userId', ['userId'], 'auth.users', ['id'])
    .execute()

  await pg.schema
    .alterTable('Invitation')
    .addForeignKeyConstraint(
      'fk_invitation_sentByUserId',
      ['sentByUserId'],
      'auth.users',
      ['id'],
    )
    .execute()

  await pg.schema
    .alterTable('Registration')
    .addForeignKeyConstraint('fk_registration_userId', ['userId'], 'auth.users', ['id'])
    .execute()

  await pg.schema
    .alterTable('Payment')
    .addForeignKeyConstraint('fk_payment_userId', ['userId'], 'auth.users', ['id'])
    .execute()

  await pg.schema
    .alterTable('Referral')
    .addForeignKeyConstraint('fk_referral_referrerId', ['referrerId'], 'auth.users', [
      'id',
    ])
    .execute()

  await pg.schema
    .alterTable('Referral')
    .addForeignKeyConstraint('fk_referral_referredId', ['referredId'], 'auth.users', [
      'id',
    ])
    .execute()

  await pg.schema
    .alterTable('Feedback')
    .addForeignKeyConstraint('fk_feedback_userId', ['userId'], 'auth.users', ['id'])
    .execute()

  console.log('Successfully updated all foreign key constraints to reference auth.users')

  // Check if there are any NULL userIds before making columns NOT NULL
  const nullRegistrations = await pg
    .selectFrom('Registration')
    .select('id')
    .where('userId', 'is', null)
    .limit(1)
    .execute()

  if (nullRegistrations.length === 0) {
    console.log('No NULL userIds found - making columns NOT NULL again...')

    await pg.schema
      .alterTable('Registration')
      .alterColumn('userId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('TeamMember')
      .alterColumn('userId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('Payment')
      .alterColumn('userId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('Entry')
      .alterColumn('userId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('TeammateListing')
      .alterColumn('userId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('Invitation')
      .alterColumn('sentByUserId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('Referral')
      .alterColumn('referrerId', (col) => col.setNotNull())
      .execute()
    await pg.schema
      .alterTable('Referral')
      .alterColumn('referredId', (col) => col.setNotNull())
      .execute()
  } else {
    console.log(
      'WARNING: Found NULL userIds - columns remain nullable. Fix orphaned data before making NOT NULL.',
    )
  }

  console.log('Successfully updated all foreign key constraints to reference auth.users')
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.log('Reverting all foreign key constraints to reference User table...')

  // Drop auth.users constraints
  await pg.schema
    .alterTable('TeammateListing')
    .dropConstraint('TeammateListing_userId_fkey')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('TeamMember')
    .dropConstraint('fk_team_member_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Invitation')
    .dropConstraint('fk_invitation_sentByUserId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Registration')
    .dropConstraint('fk_registration_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Payment')
    .dropConstraint('fk_payment_userId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Referral')
    .dropConstraint('fk_referral_referrerId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Referral')
    .dropConstraint('fk_referral_referredId')
    .ifExists()
    .execute()
  await pg.schema
    .alterTable('Feedback')
    .dropConstraint('fk_feedback_userId')
    .ifExists()
    .execute()

  // Add back User table constraints
  await pg.schema
    .alterTable('TeammateListing')
    .addForeignKeyConstraint('TeammateListing_userId_fkey', ['userId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('TeamMember')
    .addForeignKeyConstraint('fk_team_member_userId', ['userId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('Invitation')
    .addForeignKeyConstraint('fk_invitation_sentByUserId', ['sentByUserId'], 'User', [
      'id',
    ])
    .execute()

  await pg.schema
    .alterTable('Registration')
    .addForeignKeyConstraint('fk_registration_userId', ['userId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('Payment')
    .addForeignKeyConstraint('fk_payment_userId', ['userId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('Referral')
    .addForeignKeyConstraint('fk_referral_referrerId', ['referrerId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('Referral')
    .addForeignKeyConstraint('fk_referral_referredId', ['referredId'], 'User', ['id'])
    .execute()

  await pg.schema
    .alterTable('Feedback')
    .addForeignKeyConstraint('fk_feedback_userId', ['userId'], 'User', ['id'])
    .execute()

  console.log('Successfully reverted all foreign key constraints to reference User table')
}
