import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.log('Deleting records that reference User records with empty emails...')

  // Get User IDs that have empty or null emails
  const emptyEmailUserIds = await pg
    .selectFrom('User')
    .select('id')
    .where((eb) => eb.or([eb('email', 'is', null), eb('email', '=', '')]))
    .execute()

  const userIdsToDelete = emptyEmailUserIds.map((u) => u.id)

  console.log(`Found ${userIdsToDelete.length} User records with empty emails`)

  if (userIdsToDelete.length > 0) {
    const deletedRegistrations = await pg
      .deleteFrom('Registration')
      .where('userId', 'in', userIdsToDelete)
      .execute()

    const deletedTeamMembers = await pg
      .deleteFrom('TeamMember')
      .where('userId', 'in', userIdsToDelete)
      .execute()

    const deletedPayments = await pg
      .deleteFrom('Payment')
      .where('userId', 'in', userIdsToDelete)
      .execute()

    const deletedEntries = await pg
      .deleteFrom('Entry')
      .where('userId', 'in', userIdsToDelete)
      .execute()

    console.log(`Deleted records referencing empty-email users:`)
    console.log(`- TeamMember: ${deletedTeamMembers.length} rows`)
    console.log(`- Payment: ${deletedPayments.length} rows`)
    console.log(`- Entry: ${deletedEntries.length} rows`)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Cannot reverse this migration - deleted records are lost')
}
