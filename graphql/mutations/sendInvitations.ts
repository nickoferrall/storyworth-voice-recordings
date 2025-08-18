import { nonNull, stringArg, list, extendType } from 'nexus'
import { handleTeamInvitations } from './helpers/handleTeamInvitations'
import getKysely from '../../src/db'

export const SendInvitationsMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('sendInvitations', {
      type: 'Boolean',
      args: {
        emails: nonNull(list(nonNull(stringArg()))),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (
        _parent,
        { emails, competitionId }: { emails: string[]; competitionId: string },
        ctx,
      ) => {
        const userId = ctx.user?.id
        if (!userId) {
          throw new Error('User not authenticated')
        }
        const pg = getKysely()

        try {
          // Get the ticket type by user and competition
          const ticketType = await pg
            .selectFrom('Registration')
            .innerJoin('TicketType', 'Registration.ticketTypeId', 'TicketType.id')
            .where('Registration.userId', '=', userId)
            .where('Registration.competitionId', '=', competitionId)
            .select([
              'TicketType.id as ticketTypeId',
              'TicketType.name as ticketTypeName',
            ])
            .executeTakeFirstOrThrow()

          const ticketTypeId = ticketType.ticketTypeId

          // Fetch competition and entry data
          const [comp, entry] = await Promise.all([
            pg
              .selectFrom('Competition')
              .innerJoin('TicketType', 'Competition.id', 'TicketType.competitionId')
              .where('TicketType.id', '=', ticketTypeId)
              .select('Competition.name')
              .executeTakeFirstOrThrow(),
            pg
              .selectFrom('Entry')
              .where('ticketTypeId', '=', ticketTypeId)
              .where('userId', '=', userId)
              .selectAll()
              .executeTakeFirstOrThrow(),
          ])

          // Handle team invitations
          if (!ctx.user) {
            throw new Error('User not authenticated')
          }

          await handleTeamInvitations({
            sender: {
              id: ctx.user.id,
              firstName: ctx.user.firstName,
              lastName: ctx.user.lastName,
            },
            teamId: entry.teamId,
            emails,
            compName: comp.name,
            ticketTypeId,
          })

          return true
        } catch (error: any) {
          console.error('Error sending invitations:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
