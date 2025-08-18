import { extendType, idArg, nonNull } from 'nexus'
import getKysely from '../../src/db'
import { Transaction } from 'kysely'
import { DB } from '../../src/generated/database'

export const DeleteTeamMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteTeam', {
      type: 'Boolean',
      args: {
        teamId: nonNull(idArg()),
        competitionId: nonNull(idArg()),
      },
      resolve: async (_parent, { teamId, competitionId }, ctx) => {
        console.log('🚀 ~ teamId:', teamId)
        const pg = getKysely()

        try {
          await pg.transaction().execute(async (trx) => {
            await deleteTeamAndRelatedRecords(trx, teamId, competitionId)
          })

          return true
        } catch (error: any) {
          console.error('Error deleting team:', error)
          throw new Error(error.message || 'Failed to delete team')
        }
      },
    })
  },
})

async function deleteTeamAndRelatedRecords(
  trx: Transaction<DB>,
  teamId: string,
  competitionId: string,
) {
  try {
    // Get team members
    const teamMembers = await trx
      .selectFrom('TeamMember')
      .where('teamId', '=', teamId)
      .select(['userId'])
      .execute()

    // Delete team members and their related records
    for (const member of teamMembers) {
      await deleteTeamMemberRecords(trx, member.userId, competitionId)
    }

    // Delete the team
    await trx.deleteFrom('Team').where('id', '=', teamId).execute()
  } catch (error: any) {
    console.error('Error in deleteTeamAndRelatedRecords:', error.message)
    throw new Error(`Failed to delete team and related records: ${error.message}`)
  }
}

async function deleteTeamMemberRecords(
  trx: Transaction<DB>,
  userId: string,
  competitionId: string,
) {
  console.log(
    `Starting deleteTeamMemberRecords for userId: ${userId}, competitionId: ${competitionId}`,
  )

  try {
    // Get the Entry ID
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

    console.log('🚀 ~ entry:', entry)

    if (entry) {
      const entryId = entry.id
      console.log(`Found entry with id: ${entryId}`)

      // Delete related Lane record
      const lane = await trx.deleteFrom('Lane').where('entryId', '=', entryId).execute()
      console.log('🚀 ~ lane deleted:', lane)

      // Delete Score record (if exists)
      const score = await trx.deleteFrom('Score').where('entryId', '=', entryId).execute()
      console.log('🚀 ~ score deleted:', score)

      // Delete the entry
      const deletedEntry = await trx
        .deleteFrom('Entry')
        .where('id', '=', entryId)
        .execute()
      console.log('🚀 ~ entry deleted:', deletedEntry)
    } else {
      console.log('No Entry found for this user and competition')
    }

    // Delete team member
    const deletedTeamMember = await trx
      .deleteFrom('TeamMember')
      .where('userId', '=', userId)
      .execute()
    console.log('🚀 ~ team member deleted:', deletedTeamMember)

    // Delete registration
    const deletedRegistration = await trx
      .deleteFrom('Registration')
      .where('userId', '=', userId)
      .where('competitionId', '=', competitionId)
      .execute()
    console.log('🚀 ~ registration deleted:', deletedRegistration)

    // Remove the user's athlete association with this competition from the joiner table
    const deletedAthleteCompetitionLink = await trx
      .deleteFrom('AthleteCompetition')
      .where('userId', '=', userId)
      .where('competitionId', '=', competitionId)
      .execute()
    console.log('🚀 ~ athlete competition link deleted:', deletedAthleteCompetitionLink)

    console.log(`Completed deleteTeamMemberRecords for userId: ${userId}`)
  } catch (error: any) {
    console.error(`Error in deleteTeamMemberRecords for userId ${userId}:`, error.message)
    throw new Error(
      `Failed to delete team member records for user ${userId}: ${error.message}`,
    )
  }
}
