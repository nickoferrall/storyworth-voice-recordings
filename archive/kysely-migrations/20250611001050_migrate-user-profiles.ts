import { Kysely } from 'kysely'
import getKysely from '../../db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.log('Starting user profile migration...')

  let page = 0
  const pageSize = 100
  let allUsers: any[] = []
  let hasMore = true

  while (hasMore) {
    console.log(`Fetching users page ${page + 1}...`)
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: pageSize,
    })

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    if (!data?.users || data.users.length === 0) {
      hasMore = false
    } else {
      allUsers = allUsers.concat(data.users)
      console.log(`Fetched ${data.users.length} users in page ${page + 1}`)
      page++
    }
  }

  console.log(`Total users found: ${allUsers.length}`)

  let migratedCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const user of allUsers) {
    try {
      const metadata = user.user_metadata || {}
      const email = user.email

      if (!email) {
        console.log(`Skipping user ${user.id}: No email found`)
        skippedCount++
        continue
      }

      const existingProfile = await pg
        .selectFrom('UserProfile')
        .where('id', '=', user.id)
        .executeTakeFirst()

      if (existingProfile) {
        console.log(`Skipping user ${user.id}: Profile already exists`)
        skippedCount++
        continue
      }

      await pg
        .insertInto('UserProfile')
        .values({
          id: user.id,
          email: email,
          firstName: metadata.firstName || metadata.first_name || '',
          lastName: metadata.lastName || metadata.last_name || null,
          picture: metadata.picture || null,
          bio: metadata.bio || null,
          isSuperUser: metadata.is_super_user || false,
          isVerified: metadata.is_verified || user.email_confirmed_at !== null,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
        })
        .execute()

      migratedCount++
      if (migratedCount % 100 === 0) {
        console.log(`Migrated ${migratedCount} users...`)
      }
    } catch (error) {
      console.error(`Failed to migrate user ${user.id}:`, error)
      failedCount++
    }
  }

  console.log('Migration completed:')
  console.log(`- Total users processed: ${allUsers.length}`)
  console.log(`- Successfully migrated: ${migratedCount}`)
  console.log(`- Skipped (already exist): ${skippedCount}`)
  console.log(`- Failed: ${failedCount}`)
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  await pg.deleteFrom('UserProfile').execute()
}
