import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.log('Starting to fix orphaned user references...')

  const userMappings = await pg
    .selectFrom('User as u')
    .innerJoin('auth.users as au', 'au.email', 'u.email')
    .select(['u.id as oldUserId', 'au.id as newUserId'])
    .where(sql`au.raw_user_meta_data->>'oldUserId'`, '=', sql`u.id::text`)
    .execute()

  console.log(`Found ${userMappings.length} user mappings to update`)
  console.log('User mappings:', JSON.stringify(userMappings, null, 2))

  for (let i = 0; i < userMappings.length; i++) {
    const mapping = userMappings[i]

    if (i % 50 === 0) {
      console.log(`Processing mapping ${i + 1}/${userMappings.length}`)
    }

    await Promise.all([
      pg
        .updateTable('Registration')
        .set({ userId: mapping.newUserId })
        .where('userId', '=', mapping.oldUserId)
        .execute(),

      pg
        .updateTable('TeamMember')
        .set({ userId: mapping.newUserId })
        .where('userId', '=', mapping.oldUserId)
        .execute(),

      pg
        .updateTable('Payment')
        .set({ userId: mapping.newUserId })
        .where('userId', '=', mapping.oldUserId)
        .execute(),

      pg
        .updateTable('Entry')
        .set({ userId: mapping.newUserId })
        .where('userId', '=', mapping.oldUserId)
        .execute(),
    ])
  }

  console.log('Migration dry run completed!')
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log(
    'This migration cannot be safely reversed - the old User table data would be needed',
  )
}
