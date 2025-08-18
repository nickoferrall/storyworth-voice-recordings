import { Kysely, sql } from 'kysely'
import getKysely from '../../db' // Your Kysely instance for the current database
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials
// WARNING: Hardcoding sensitive keys is a security risk.
// Consider environment variables for production or shared environments.
const supabaseUrl = 'https://czbbldmexpsiebwhrxox.supabase.co'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmJsZG1leHBzaWVid2hyeG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjM5MDgxNiwiZXhwIjoyMDMxOTY2ODE2fQ.u_StJz4eY892I3nwhrAuBhCcggv4VFBKhh7w8DeQBBk'

// Initialize Supabase Admin Client
// The warning for missing env vars is no longer needed as they are hardcoded.
// if (!supabaseUrl || !supabaseServiceKey) {
//   console.error(
//     '###################################################################################',
//   )
//   console.error(
//     '# WARNING: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured.         #',
//   )
//   console.error(
//     '# This migration will likely fail. Please set them, preferably via env variables. #',
//   )
//   console.error(
//     '###################################################################################',
//   )
//   // Optionally, throw an error to halt execution if you still want a check,
//   // though with hardcoding, this specific check becomes less relevant.
//   // throw new Error("Supabase URL or Service Role Key is not configured.");
// }

const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface AuthUser {
  // Still useful for casting the result of createUser
  id: string
  email?: string | undefined | null
  user_metadata?: Record<string, any> // Supabase client returns user_metadata
}

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely() // Kysely instance for your current database

  console.log(
    'Starting data migration: public.User to Supabase Auth and joiner tables...',
  )
  console.log('THIS IS A ONE-TIME DATA MIGRATION. Ensure backups are in place.')
  console.log(
    'ASSUMPTION: No existing users in Supabase Auth to merge/update. All users will be created.',
  )

  try {
    const oldUsers = await pg.selectFrom('User').selectAll().execute()
    console.log(`Found ${oldUsers.length} users in public.User table.`)

    for (const oldUser of oldUsers) {
      console.log(`Processing user: ${oldUser.email} (Old User ID: ${oldUser.id})`)
      let supabaseAuthUser: AuthUser | null = null

      try {
        const userMetadataForSupabase = {
          firstName: oldUser.firstName,
          lastName: oldUser.lastName || null,
          stripeCustomerId: oldUser.stripeCustomerId || null,
          orgId: oldUser.orgId || null,
          referredBy: oldUser.referredBy || null,
          referralCode: oldUser.referralCode || null,
          oldUserId: oldUser.id,
          // Add any other relevant fields from your oldUser table in camelCase
        }

        console.log(`  Creating new user in Supabase Auth for ${oldUser.email}.`)
        const { data: newAuthUserResult, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email: oldUser.email,
            email_confirm: oldUser.isVerified || false, // Set based on your old data
            user_metadata: userMetadataForSupabase,
            // Password will be set by user via Supabase's flows (e.g., reset/invitation)
            // Or, if you have hashed passwords and know the algorithm Supabase uses,
            // you *could* attempt to migrate them, but it's complex and often not recommended.
            // Defaulting to email_confirm and letting users reset is safer.
          })

        if (createError) {
          // Check for common errors like "User already registered" if the assumption was wrong
          if (
            createError.message.includes('User already registered') ||
            createError.message.includes('already exists')
          ) {
            console.warn(
              `  User ${oldUser.email} already exists in Supabase Auth. This was unexpected. Skipping creation. Error: ${createError.message}`,
            )
            // Attempt to fetch the existing user to proceed with joiner tables if needed
            // This part re-introduces a bit of the check, but only on error.
            const existingUserInDb = (await pg
              .selectFrom('auth.users as users_table')
              .select([
                'users_table.id',
                'users_table.email',
                'users_table.raw_user_meta_data',
              ])
              .where('users_table.email', '=', oldUser.email)
              .executeTakeFirst()) as
              | {
                  id: string
                  email?: string | null
                  raw_user_meta_data?: Record<string, any>
                }
              | undefined
            if (existingUserInDb) {
              supabaseAuthUser = {
                id: existingUserInDb.id,
                email: existingUserInDb.email,
                user_metadata: existingUserInDb.raw_user_meta_data || {},
              }
              console.log(
                `  Fetched existing Supabase user ${supabaseAuthUser.email} (ID: ${supabaseAuthUser.id}) to proceed with joiner tables.`,
              )
            } else {
              console.error(
                `  Failed to create Supabase user for ${oldUser.email} and could not fetch existing one: ${createError.message}`,
              )
              continue // Skip to next user
            }
          } else {
            console.error(
              `  Failed to create Supabase user for ${oldUser.email}: ${createError.message}`,
            )
            continue // Skip to next user
          }
        } else if (newAuthUserResult && newAuthUserResult.user) {
          supabaseAuthUser = newAuthUserResult.user as AuthUser
          console.log(
            `  Created Supabase user for ${oldUser.email} (New Supabase Auth ID: ${supabaseAuthUser?.id})`,
          )
        }

        if (!supabaseAuthUser || !supabaseAuthUser.id) {
          console.error(
            `  Could not obtain Supabase Auth user ID for ${oldUser.email}. Skipping joiner table population.`,
          )
          continue
        }
        const newSupabaseUserId = supabaseAuthUser.id

        // 2. Populate AthleteCompetition joiner table
        if (
          oldUser.athleteCompetitionIds &&
          Array.isArray(oldUser.athleteCompetitionIds)
        ) {
          for (const compId of oldUser.athleteCompetitionIds) {
            if (!compId) continue
            // Use Kysely (pg) to insert into joiner tables as they are in the same DB
            try {
              await pg
                .insertInto('AthleteCompetition')
                .values({ userId: newSupabaseUserId, competitionId: compId })
                .onConflict((oc) => oc.columns(['userId', 'competitionId']).doNothing()) // Avoid duplicates if re-run
                .executeTakeFirst() // executeTakeFirst or execute based on Kysely version/dialect for insert
              console.log(
                `    Added/Ensured AthleteCompetition link: User ${newSupabaseUserId}, Comp ${compId}`,
              )
            } catch (athleteCompError: any) {
              console.error(
                `    Failed to add to AthleteCompetition for User ${newSupabaseUserId}, Comp ${compId}: ${athleteCompError.message}`,
              )
            }
          }
        }

        // 3. Populate CompetitionCreator joiner table
        if (
          oldUser.createdCompetitionIds &&
          Array.isArray(oldUser.createdCompetitionIds)
        ) {
          for (const compId of oldUser.createdCompetitionIds) {
            if (!compId) continue
            try {
              await pg
                .insertInto('CompetitionCreator')
                .values({ userId: newSupabaseUserId, competitionId: compId })
                .onConflict((oc) => oc.columns(['userId', 'competitionId']).doNothing()) // Avoid duplicates
                .executeTakeFirst()
              console.log(
                `    Added/Ensured CompetitionCreator link: User ${newSupabaseUserId}, Comp ${compId}`,
              )
            } catch (creatorCompError: any) {
              console.error(
                `    Failed to add to CompetitionCreator for User ${newSupabaseUserId}, Comp ${compId}: ${creatorCompError.message}`,
              )
            }
          }
        }
        console.log(`  Successfully processed data for user: ${oldUser.email}`)
      } catch (userProcessingError: any) {
        console.error(
          `  Error during processing user ${oldUser.email}: ${userProcessingError.message}`,
        )
      }
    }
    console.log('Data migration to Supabase Auth and joiner tables finished.')
  } catch (error: any) {
    console.error('MAJOR ERROR during data migration:', error)
    throw error // Re-throw to ensure migration runner knows it failed
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  console.warn(`
    ###################################################################################
    # WARNING: Rolling back this data migration is complex and potentially destructive. #
    # This 'down' function attempts to remove users from Supabase Auth and joiner     #
    # tables based on 'oldUserId' metadata (camelCase). It does NOT restore array columns in #
    # 'public.User'. PROCEED WITH EXTREME CAUTION AND TEST THOROUGHLY.                #
    ###################################################################################
  `)

  try {
    const oldUsers = await pg.selectFrom('User').select(['id', 'email']).execute()
    console.log(
      `Attempting to roll back data for ${oldUsers.length} users from public.User table.`,
    )

    for (const oldUser of oldUsers) {
      console.log(
        `Processing rollback for old user ID: ${oldUser.id}, email: ${oldUser.email}`,
      )
      try {
        // Find the user in Supabase Auth by querying auth.users table directly
        const supabaseAuthUserInDb = (await pg
          .selectFrom('auth.users as users_table')
          .select([
            'users_table.id',
            'users_table.email',
            'users_table.raw_user_meta_data',
          ])
          .where('users_table.email', '=', oldUser.email)
          .executeTakeFirst()) as
          | {
              id: string
              email?: string | null
              raw_user_meta_data?: Record<string, any>
            }
          | undefined

        if (!supabaseAuthUserInDb) {
          console.log(
            `  User ${oldUser.email} not found in Supabase Auth (auth.users table). Skipping rollback for this user.`,
          )
          continue
        }

        // Ensure this user was migrated by checking oldUserId in metadata (now camelCase)
        const userMetadata = supabaseAuthUserInDb.raw_user_meta_data || {}
        if (userMetadata.oldUserId !== oldUser.id) {
          // Check for oldUserId (camelCase)
          console.log(
            `  Supabase user ${oldUser.email} (ID: ${supabaseAuthUserInDb.id}) does not have matching oldUserId in metadata. Expected ${oldUser.id}, got ${userMetadata.oldUserId}. Skipping.`,
          )
          continue
        }

        const supabaseUserIdToDelete = supabaseAuthUserInDb.id

        // 1. Delete from joiner tables (using Kysely for consistency as they are in the same DB)
        const { error: deleteAthleteCompError } = await supabaseAdmin
          .from('AthleteCompetition')
          .delete()
          .match({ userId: supabaseUserIdToDelete })
        if (deleteAthleteCompError) {
          console.error(
            `  Error deleting from AthleteCompetition for Supabase User ID ${supabaseUserIdToDelete}: ${deleteAthleteCompError.message}`,
          )
        } else {
          console.log(
            `  Deleted from AthleteCompetition for Supabase User ID ${supabaseUserIdToDelete}`,
          )
        }

        const { error: deleteCreatorCompError } = await supabaseAdmin
          .from('CompetitionCreator')
          .delete()
          .match({ userId: supabaseUserIdToDelete })
        if (deleteCreatorCompError) {
          console.error(
            `  Error deleting from CompetitionCreator for Supabase User ID ${supabaseUserIdToDelete}: ${deleteCreatorCompError.message}`,
          )
        } else {
          console.log(
            `  Deleted from CompetitionCreator for Supabase User ID ${supabaseUserIdToDelete}`,
          )
        }

        // 2. Delete user from Supabase Auth
        // THIS IS A DESTRUCTIVE OPERATION.
        console.log(
          `  Attempting to delete user ${supabaseAuthUserInDb.email} (ID: ${supabaseUserIdToDelete}) from Supabase Auth.`,
        )
        const { error: deleteUserError } =
          await supabaseAdmin.auth.admin.deleteUser(supabaseUserIdToDelete)
        if (deleteUserError) {
          console.error(
            `  Failed to delete user ${supabaseAuthUserInDb.email} from Supabase Auth: ${deleteUserError.message}`,
          )
        } else {
          console.log(
            `  Successfully deleted user ${supabaseAuthUserInDb.email} from Supabase Auth.`,
          )
        }
      } catch (userRollbackError: any) {
        console.error(
          `  Error during rollback for old user ID ${oldUser.id}: ${userRollbackError.message}`,
        )
      }
    }
    console.log('Data migration rollback attempt finished.')
    console.warn(
      "REMINDER: This 'down' function does not restore 'public.User' array columns.",
    )
  } catch (error: any) {
    console.error('MAJOR ERROR during data migration rollback:', error)
    throw error
  }
}
