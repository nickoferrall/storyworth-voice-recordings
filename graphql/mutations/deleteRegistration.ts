import { extendType, idArg, nonNull } from 'nexus'
import getKysely from '../../src/db'
import { Transaction } from 'kysely' // Import the Transaction type
import { DB } from '../../src/generated/database'

export const DeleteRegistrationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteRegistration', {
      type: 'Boolean',
      args: {
        userId: idArg(),
        registrationId: nonNull(idArg()),
        competitionId: nonNull(idArg()),
        teamId: idArg(),
      },
      resolve: async (
        _parent,
        { registrationId, userId, competitionId, teamId },
        ctx,
      ) => {
        console.log('🚀 ~ deleteRegistration called with registrationId:', registrationId)
        const pg = getKysely()

        try {
          await pg.transaction().execute(async (trx) => {
            if (teamId) {
              await deleteTeamRegistration(trx, teamId, competitionId, registrationId)
            } else if (userId) {
              await deleteUserRelatedRecords(trx, userId, competitionId, registrationId)
            } else {
              throw new Error('Either userId or teamId must be provided')
            }

            // Delete the registration
            const deletedRegistration = await trx
              .deleteFrom('Registration')
              .where('id', '=', registrationId)
              .executeTakeFirstOrThrow() // Ensure registration exists or throw
            console.log('🚀 ~ registration deleted:', deletedRegistration)
          })

          return true
        } catch (error: any) {
          console.error('Error deleting registration:', error)
          throw new Error(`Failed to delete registration: ${error.message}`)
        }
      },
    })
  },
})

async function deleteTeamRegistration(
  trx: Transaction<DB>,
  teamId: string,
  competitionId: string,
  registrationId: string,
) {
  console.log(`Deleting team registration for teamId: ${teamId}`)
  // Delete all team members
  const teamMembers = await trx
    .selectFrom('TeamMember')
    .where('teamId', '=', teamId)
    .select(['userId'])
    .execute()

  for (const member of teamMembers) {
    await deleteUserRelatedRecords(trx, member.userId, competitionId, registrationId)
  }

  // Delete the team
  const deletedTeam = await trx
    .deleteFrom('Team')
    .where('id', '=', teamId)
    .executeTakeFirstOrThrow()
  console.log('🚀 ~ team deleted:', deletedTeam)
}

async function deleteUserRelatedRecords(
  trx: Transaction<DB>,
  userId: string,
  competitionId: string,
  registrationId: string,
) {
  console.log(
    `Deleting user related records for userId: ${userId} in competitionId: ${competitionId}`,
  )
  // First, get the Entry ID associated with this user for this competition's ticket types
  const entry = await trx
    .selectFrom('Entry')
    .where('userId', '=', userId)
    .where(
      'ticketTypeId',
      'in',
      trx
        .selectFrom('TicketType')
        .where('competitionId', '=', competitionId)
        .select('id'),
    )
    .select('id')
    .executeTakeFirst()

  if (entry) {
    const entryId = entry.id
    console.log(`Found entry with id: ${entryId} for user ${userId}`)

    // Delete related records
    // RegistrationAnswer is linked to registrationId
    const deletedAnswers = await trx
      .deleteFrom('RegistrationAnswer')
      .where('registrationId', '=', registrationId)
      // Potentially add .where('userId', '=', userId) if answers are also directly linked to user
      .execute()
    console.log('🚀 ~ registration answers deleted:', deletedAnswers)

    const deletedLanes = await trx
      .deleteFrom('Lane')
      .where('entryId', '=', entryId)
      .execute()
    console.log('🚀 ~ lanes deleted:', deletedLanes)

    const deletedScores = await trx
      .deleteFrom('Score')
      .where('entryId', '=', entryId)
      .execute()
    console.log('🚀 ~ scores deleted:', deletedScores)

    // Delete the entry itself
    const deletedEntry = await trx
      .deleteFrom('Entry')
      .where('id', '=', entryId)
      .executeTakeFirstOrThrow()
    console.log('🚀 ~ entry deleted:', deletedEntry)
  } else {
    console.log(
      `No entry found for userId: ${userId} and competitionId: ${competitionId}. RegistrationAnswers might still be deleted if registrationId is valid.`,
    )
    // If there's no entry, we might still want to delete RegistrationAnswers if they are only linked by registrationId
    // and not dependent on an entry existing for this specific user/competition combo.
    // The current logic for RegistrationAnswer deletion is outside the if(entry) block, which is fine.
  }

  // Delete TeamMember record for this user (if they were part of any team in general,
  // or specifically for this competition if TeamMember has a competitionId)
  // Assuming TeamMember links a user to a team, and a team is often competition-specific.
  // If TeamMember is not competition-specific, this might be too broad.
  // For now, let's assume it's okay to remove the user from any team they are part of
  // when their registration is deleted. If a user can be in multiple teams across multiple
  // competitions, this needs refinement (e.g., delete from TeamMember where teamId is in
  // (select id from Team where competitionId = ?))
  const deletedTeamMember = await trx
    .deleteFrom('TeamMember')
    .where('userId', '=', userId)
    // If TeamMember has a competitionId or teamId that can be linked to competitionId:
    // .where('teamId', 'in', trx.selectFrom('Team').where('competitionId', '=', competitionId).select('id'))
    .execute()
  console.log('🚀 ~ team member records deleted for user:', deletedTeamMember)

  // Remove the user's athlete association with this competition from the joiner table
  const deletedAthleteCompetitionLink = await trx
    .deleteFrom('AthleteCompetition')
    .where('userId', '=', userId)
    .where('competitionId', '=', competitionId)
    .execute()
  console.log('🚀 ~ athlete competition link deleted:', deletedAthleteCompetitionLink)

  // The old logic for updating User.athleteCompetitionIds array is no longer needed here
  // as AthleteCompetition table is the source of truth.
  // const user = await trx
  //   .selectFrom('User')
  // ... (old code removed) ...
  // } else {
  //   console.log(`No athleteCompetitionIds found for userId: ${userId}`)
  // }
  console.log(
    `Successfully processed related records deletion for userId: ${userId} in competitionId: ${competitionId}`,
  )
}
