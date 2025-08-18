import { extendType, nonNull, inputObjectType, list } from 'nexus'
import MailgunManager from '../../lib/MailgunManager'
import getKysely from '../../src/db'
import { User, Team, Registration, TeamMember } from '../../src/generated/database'
import { Selectable, Insertable } from 'kysely'
import { v4 as uuidv4 } from 'uuid'
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

const BulkRegistrationInput = inputObjectType({
  name: 'BulkRegistrationInput',
  definition(t) {
    t.nonNull.string('firstName')
    t.nonNull.string('lastName')
    t.nonNull.string('email')
    t.nonNull.string('ticketTypeId')
    t.string('teamName')
    t.id('teamGroupId')
  },
})

// Add type for user updates to properly handle athleteCompetitionIds
// type UserUpdate = { // REMOVED
//   id: string
//   athleteCompetitionIds: string[]
// }

export const CreateBulkRegistration = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.list.field('createBulkRegistrations', {
      type: 'User',
      args: {
        input: nonNull(list(nonNull(BulkRegistrationInput))),
      },
      resolve: async (_parent, { input }, ctx) => {
        const pg = getKysely()
        const createdUsers: Selectable<User>[] = []
        const registrationValues: Insertable<Registration>[] = []
        const teamMemberValues: Insertable<TeamMember>[] = []
        // const userUpdates: UserUpdate[] = [] // REMOVED
        const athleteCompetitionInserts: Array<{
          userId: string
          competitionId: string
        }> = [] // ADDED
        const teamMap = new Map<string, Selectable<Team>>()
        const processedEntries = new Set<string>()

        try {
          // Generate fake emails for entries without emails
          const processedInput = input.map((entry) => ({
            ...entry,
            email:
              entry.email ||
              `${entry.firstName.toLowerCase()}.${entry.lastName.toLowerCase()}.${uuidv4()}@generated.competition`,
          }))

          // Update the input reference to use processed entries
          input = processedInput

          // Batch process users
          const userEmails = input.map((r) => r.email)
          const existingUsers = await Promise.all(
            userEmails.map((email) => ctx.loaders.userByEmailLoader.load(email)),
          )

          const existingUserMap = new Map()
          existingUsers.forEach((user, index) => {
            if (user) {
              existingUserMap.set(userEmails[index], user)
            }
          })

          // Batch create new users (only for non-existing users)
          const usersToCreate = input.filter((r) => !existingUserMap.has(r.email))
          if (usersToCreate.length > 0) {
            for (const userToCreate of usersToCreate) {
              try {
                // Create user in Supabase Auth
                const { data: authData, error: authError } =
                  await supabase.auth.admin.createUser({
                    email: userToCreate.email,
                    email_confirm: false,
                    user_metadata: {
                      first_name: userToCreate.firstName,
                      last_name: userToCreate.lastName,
                    },
                  })

                if (authError || !authData.user) {
                  console.error(
                    `Failed to create auth user for ${userToCreate.email}:`,
                    authError,
                  )
                  continue
                }

                // Ensure a corresponding UserProfile row exists for this new auth user
                try {
                  await pg
                    .insertInto('UserProfile')
                    .values({
                      id: authData.user.id,
                      email: userToCreate.email,
                      firstName: userToCreate.firstName,
                      lastName: userToCreate.lastName || null,
                      picture: null,
                      bio: null,
                      isSuperUser: false,
                      isVerified: false,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    })
                    .execute()
                } catch (profileErr) {
                  // If the profile already exists, ignore; otherwise rethrow
                  console.warn('UserProfile insert skipped/failed:', profileErr)
                }

                // Map auth user to User format
                const newUser = {
                  id: authData.user.id,
                  email: userToCreate.email,
                  firstName: userToCreate.firstName,
                  lastName: userToCreate.lastName || null,
                  createdAt: new Date(authData.user.created_at),
                  updatedAt: new Date(
                    authData.user.updated_at || authData.user.created_at,
                  ),
                  invitationId: null,
                  isSuperUser: false,
                  isVerified: false,
                  orgId: null,
                  picture: null,
                  referralCode: null,
                  referredBy: null,
                  stripeCustomerId: null,
                  verificationToken: null,
                  athleteCompetitionIds: null,
                  createdCompetitionIds: null,
                  hashedPassword: null,
                } as Selectable<User>

                existingUserMap.set(newUser.email, newUser)
                createdUsers.push(newUser)
              } catch (error) {
                console.error(`Error creating user ${userToCreate.email}:`, error)
              }
            }
          }

          // Add existing users to createdUsers array as well
          input.forEach((registration) => {
            const existingUser = existingUserMap.get(registration.email)
            if (existingUser && !createdUsers.some((u) => u.id === existingUser.id)) {
              createdUsers.push(existingUser)
            }
          })

          // Batch load ticket types
          const ticketTypeIds = new Set(input.map((r) => r.ticketTypeId))
          const ticketTypes = (
            await ctx.loaders.ticketTypeLoader.loadMany(Array.from(ticketTypeIds))
          ).filter(
            (
              t,
            ): t is Exclude<
              Awaited<ReturnType<typeof ctx.loaders.ticketTypeLoader.load>>,
              Error | undefined
            > => t != null && !(t instanceof Error),
          )
          if (!ticketTypes || ticketTypes.length === 0) {
            throw new Error('No ticket types found for bulk registration')
          }
          const ticketTypeMap = new Map(ticketTypes.map((t) => [t.id, t]))

          // Group registrations by team
          const teamRegistrations = new Map<string, any[]>()
          for (const registration of input) {
            if (registration.teamGroupId) {
              const teamRegs = teamRegistrations.get(registration.teamGroupId) || []
              teamRegs.push(registration)
              teamRegistrations.set(registration.teamGroupId, teamRegs)
            }
          }
          console.log('🚀 ~ teamRegistrations:', { teamRegistrations, input })

          // Batch load all existing entries upfront
          const existingEntries = await pg
            .selectFrom('Entry')
            .where(
              'ticketTypeId',
              'in',
              input.map((r) => r.ticketTypeId),
            )
            .select(['userId', 'ticketTypeId'])
            .execute()

          // Create a Set for quick lookup of existing entries
          const existingEntrySet = new Set(
            existingEntries.map((e) => `${e.userId}-${e.ticketTypeId}`),
          )

          // Helper function to check if entry exists
          const hasExistingEntry = (userId: string, ticketTypeId: string) =>
            existingEntrySet.has(`${userId}-${ticketTypeId}`)

          // First, create all teams and their entries
          for (const [teamGroupId, teamMembers] of teamRegistrations.entries()) {
            if (teamMap.has(teamGroupId)) continue

            const registration = teamMembers[0] // Get first member for team details
            const ticketType = ticketTypeMap.get(registration.ticketTypeId)!
            const user = existingUserMap.get(registration.email)!

            // Check if entry already exists
            if (hasExistingEntry(user.id, registration.ticketTypeId)) {
              console.warn(`Entry already exists for team captain`)
              continue
            }

            // Check if team exists
            const existingTeam = await pg
              .selectFrom('Team')
              .where('id', '=', teamGroupId)
              .selectAll()
              .executeTakeFirst()

            // Batch collect all operations
            const teamOperations: Promise<any>[] = []
            if (!existingTeam) {
              const newTeam = await pg
                .insertInto('Team')
                .values({
                  name: registration.teamName,
                  teamCaptainId: user.id,
                })
                .returningAll()
                .executeTakeFirst()

              teamMap.set(teamGroupId, newTeam!)
            } else {
              teamMap.set(teamGroupId, existingTeam)
            }

            const team = teamMap.get(teamGroupId)!

            // Create single entry for the team (not for each member)
            if (!hasExistingEntry(user.id, registration.ticketTypeId)) {
              teamOperations.push(
                pg
                  .insertInto('Entry')
                  .values({
                    userId: user.id, // Use team captain's ID
                    teamId: team.id,
                    ticketTypeId: registration.ticketTypeId,
                  })
                  .execute(),
              )
            }

            // Execute team operations in transaction
            if (teamOperations.length > 0) {
              await Promise.all(teamOperations)
            }

            // Add all team members (this is correct - we want all members in TeamMember table)
            teamMembers.forEach((member) => {
              const user = existingUserMap.get(member.email)!
              teamMemberValues.push({
                teamId: team.id,
                userId: user.id,
              })

              registrationValues.push({
                userId: user.id,
                competitionId: ticketType.competitionId,
                ticketTypeId: registration.ticketTypeId,
              })

              // userUpdates.push({ // REMOVED
              //   id: user.id,
              //   athleteCompetitionIds: [
              //     ...(user.athleteCompetitionIds || []),
              //     ticketType.competitionId,
              //   ],
              // })
              athleteCompetitionInserts.push({
                // ADDED
                userId: user.id,
                competitionId: ticketType.competitionId,
              })
            })
          }

          // Process individual registrations
          const individualEntries = input
            .filter((r) => !r.teamGroupId)
            .filter((r) => {
              const user = existingUserMap.get(r.email)!
              const entryKey = `${user.id}-${r.ticketTypeId}`
              // Check both existing entries and ones we just processed
              return (
                !hasExistingEntry(user.id, r.ticketTypeId) &&
                !processedEntries.has(entryKey)
              )
            })
            .map((r) => {
              const userId = existingUserMap.get(r.email)!.id
              const ticketTypeId = r.ticketTypeId
              processedEntries.add(`${userId}-${ticketTypeId}`)

              // Add to registrationValues
              const ticketType = ticketTypeMap.get(ticketTypeId)!
              registrationValues.push({
                userId,
                competitionId: ticketType.competitionId,
                ticketTypeId,
              })

              // Update user for athleteCompetitionIds
              const user = existingUserMap.get(r.email)!
              // userUpdates.push({ // REMOVED
              //   id: userId,
              //   athleteCompetitionIds: [
              //     ...(user.athleteCompetitionIds || []),
              //     ticketType.competitionId,
              //   ],
              // })
              athleteCompetitionInserts.push({
                // ADDED
                userId: user.id, // userId is user.id
                competitionId: ticketType.competitionId,
              })

              return {
                userId,
                teamId: null,
                ticketTypeId,
              }
            })

          if (individualEntries.length > 0) {
            await pg.insertInto('Entry').values(individualEntries).execute()
          }

          // Execute remaining batch operations
          await Promise.all([
            // Bulk insert registrations
            registrationValues.length > 0 &&
              pg
                .insertInto('Registration')
                .values(registrationValues)
                .onConflict((oc) => oc.columns(['userId', 'competitionId']).doNothing())
                .execute(),

            // Bulk insert team members
            teamMemberValues.length > 0 &&
              pg
                .insertInto('TeamMember')
                .values(teamMemberValues)
                .onConflict((oc) => oc.columns(['teamId', 'userId']).doNothing())
                .execute(),

            // Bulk insert athlete-competition links
            athleteCompetitionInserts.length > 0 && // ADDED BLOCK
              pg
                .insertInto('AthleteCompetition')
                .values(athleteCompetitionInserts)
                .onConflict((oc) => oc.doNothing()) // Handle potential duplicates gracefully
                .execute(),

            // Bulk update users // REMOVED BLOCK for User.athleteCompetitionIds
            // pg.transaction().execute(async (trx) => {
            //   for (const update of userUpdates) {
            //     await trx
            //       .updateTable('User')
            //       .set({
            //         athleteCompetitionIds: update.athleteCompetitionIds,
            //       })
            //       .where('id', '=', update.id)
            //       .execute()

            //     // Attempt to find the user to update in cache.
            //     // Note: original existingUserMap was email-keyed, update.id is user ID.
            //     // This logic is simplified by storing all createdUsers later.
            //     const userToCache = createdUsers.find(u => u.id === update.id)
            //     if (userToCache) {
            //       storeUser(
            //         {
            //           ...userToCache,
            //           athleteCompetitionIds: update.athleteCompetitionIds, // This field is no longer updated this way
            //         },
            //         ctx,
            //       )
            //     }
            //   }
            // }),
          ])

          // After all registrations are created, regenerate heats
          const ticketType = ticketTypeMap.get(input[0].ticketTypeId)!
          // TODO: This needs to be fixed. generateHeats and createNewLanes expect a competitionId
          // and potentially other details. ticketType.competitionId should be used.
          // await generateHeats(pg, ticketType.competitionId) // Example
          // await createNewLanes(pg, ticketType.competitionId) // Example

          // Send notification email in production
          if (process.env.NODE_ENV === 'production') {
            const emailOptionsForMe = {
              to: 'nickoferrall@gmail.com',
              subject: 'Bulk registration completed!',
              body: `${input.length} registrations processed`,
              html: `
                <h1>Bulk registration completed!</h1>
                <p>${input.length} registrations processed</p>
                <p>Emails: ${input.map((r) => r.email).join(', ')}</p>
              `,
            }
            const mailgunManager = new MailgunManager()
            mailgunManager.sendEmail(emailOptionsForMe)
          }

          return createdUsers
        } catch (error: any) {
          console.error('Error in bulk registration:', error)
          throw new Error(error.message || 'Error processing bulk registrations')
        }
      },
    })
  },
})
