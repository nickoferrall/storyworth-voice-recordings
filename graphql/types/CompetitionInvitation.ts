import { objectType, extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const CompetitionInvitationDetails = objectType({
  name: 'CompetitionInvitationDetails',
  definition(t) {
    t.nonNull.string('id')
    t.string('email')
    t.nonNull.field('competition', { type: 'Competition' })
    t.field('sender', { type: 'User' })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.string('status')
  },
})

export const GetCompetitionInvitationQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getCompetitionInvitation', {
      type: 'CompetitionInvitationDetails',
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, { token }, ctx) => {
        const pg = getKysely()

        const invitation = await pg
          .selectFrom('CompetitionInvitation')
          .where('token', '=', token)
          .selectAll()
          .executeTakeFirst()

        if (!invitation) {
          throw new Error('Invalid or expired invitation token')
        }

        // Check if invitation has expired (30 days from creation)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        if (new Date(invitation.createdAt) < thirtyDaysAgo) {
          throw new Error('This invitation has expired')
        }

        // Get the competition details
        const competition = await ctx.loaders.competitionLoader.load(
          invitation.competitionId,
        )
        if (!competition) {
          throw new Error('Competition not found')
        }

        // Get the sender details
        const sender = await ctx.loaders.userByIdLoader.load(invitation.sentByUserId)

        return {
          id: invitation.id,
          email: invitation.email,
          competition: competition as any,
          sender: sender as any,
          createdAt: invitation.createdAt,
          status: invitation.status,
        } as any
      },
    })
  },
})
