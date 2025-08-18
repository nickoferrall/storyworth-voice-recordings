import { extendType, nonNull, stringArg } from 'nexus'
import { inviteToTeam } from '../../emails/inviteToTeam'
import getKysely from '../../src/db'

export const ResendInvitation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('resendInvitation', {
      type: 'Boolean',
      args: {
        invitationId: nonNull(stringArg()),
      },
      resolve: async (_parent, { invitationId }, ctx) => {
        const pg = getKysely()
        const invitation = await pg
          .selectFrom('Invitation')
          .where('Invitation.id', '=', invitationId)
          .innerJoin('Team', 'Team.id', 'Invitation.teamId')
          .innerJoin('Registration', 'Registration.userId', 'Team.teamCaptainId')
          .innerJoin('Competition', 'Competition.id', 'Registration.competitionId')
          .innerJoin('UserProfile', 'UserProfile.id', 'Team.teamCaptainId')
          .select([
            'Invitation.email',
            'Invitation.token',
            'Team.name as teamName',
            'Team.id as teamId',
            'Competition.name as competitionName',
            'Competition.id as competitionId',
            'UserProfile.firstName as captainFirstName',
            'UserProfile.lastName as captainLastName',
          ])
          .executeTakeFirst()

        if (!invitation) {
          throw new Error('Invitation not found')
        }

        const captainName = invitation.captainLastName
          ? `${invitation.captainFirstName} ${invitation.captainLastName}`
          : invitation.captainFirstName

        // Fetch the ticket type ID
        const ticketType = await pg
          .selectFrom('TicketType')
          .where('competitionId', '=', invitation.competitionId)
          //   .where('isTeam', '=', true)
          .select(['id'])
          .executeTakeFirst()

        if (!ticketType) {
          throw new Error('Team ticket type not found')
        }

        if (!invitation.email) {
          throw new Error('Invitation email not found')
        }

        // Assuming inviteToTeam function can handle a single email
        const invitations = await inviteToTeam(
          [invitation.email],
          invitation.competitionName,
          ticketType.id,
          captainName,
        )
        const token = invitations[0].token

        // Update the invitation's updatedAt timestamp
        await pg
          .updateTable('Invitation')
          .set({ token, updatedAt: new Date() })
          .where('id', '=', invitationId)
          .execute()

        return true
      },
    })
  },
})
