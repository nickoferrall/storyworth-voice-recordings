import { objectType, enumType, extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { Invitation } from './Invitation'

export const TeamStatus = enumType({
  name: 'TeamStatus',
  members: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
})

export const Team = objectType({
  name: 'Team',
  definition(t) {
    t.nonNull.string('id')
    t.string('name')
    t.string('teamCaptainId')
    t.field('teamCaptain', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.teamCaptainId) return null
        return ctx.loaders.userByIdLoader.load(parent.teamCaptainId)
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.list.nonNull.field('members', {
      type: 'TeamMember',
      resolve: async (parent, _args, ctx) => {
        const teamMembers = await ctx.loaders.teamMembersByTeamIdLoader.load(parent.id)
        return teamMembers
      },
    })

    t.field('category', {
      type: 'Category',
      resolve: async ({ categoryId }, _, ctx) => {
        if (!categoryId) return null
        const category = await ctx.loaders.categoryByIdLoader.load(categoryId)
        return category
      },
    })

    t.nonNull.list.nonNull.field('invitations', {
      type: Invitation,
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.invitationsByTeamIdLoader.load(parent.id)
      },
    })
  },
})

export const GetAvailableTeamsForMove = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getAvailableTeamsForMove', {
      type: 'Team',
      args: {
        competitionId: nonNull(stringArg()),
        ticketTypeId: nonNull(stringArg()),
        excludeTeamId: stringArg(),
      },
      resolve: async (_parent, { competitionId, ticketTypeId, excludeTeamId }, ctx) => {
        const pg = getKysely()

        // Get ticket type to check team size
        const ticketType = await pg
          .selectFrom('TicketType')
          .where('id', '=', ticketTypeId)
          .select(['teamSize'])
          .executeTakeFirst()

        if (!ticketType) {
          throw new Error('Ticket type not found')
        }

        // Get teams for this ticket type with member counts
        let query = pg
          .selectFrom('Team')
          .innerJoin('Entry', 'Entry.teamId', 'Team.id')
          .leftJoin('TeamMember', 'TeamMember.teamId', 'Team.id')
          .where('Entry.ticketTypeId', '=', ticketTypeId)
          .groupBy([
            'Team.id',
            'Team.name',
            'Team.teamCaptainId',
            'Team.createdAt',
            'Team.updatedAt',
          ])
          .select([
            'Team.id',
            'Team.name',
            'Team.teamCaptainId',
            'Team.createdAt',
            'Team.updatedAt',
            (eb) => eb.fn.count('TeamMember.id').as('memberCount'),
          ])

        // Exclude current team if specified
        if (excludeTeamId) {
          query = query.where('Team.id', '!=', excludeTeamId)
        }

        const teams = await query.orderBy('Team.name', 'asc').execute()

        // Return all teams (no longer filtering by capacity since we removed the restriction)
        return teams as any
      },
    })
  },
})

export const MoveAthleteToTeamMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('moveAthleteToTeam', {
      type: 'Boolean',
      args: {
        userId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
        targetTeamId: nonNull(stringArg()),
      },
      resolve: async (_parent, { userId, competitionId, targetTeamId }, ctx) => {
        const pg = getKysely()

        // Verify user has permission to modify this competition
        if (!ctx.user?.id) {
          throw new Error('Authentication required')
        }

        // Check competition ownership/creator permissions using DataLoader
        const ownershipResult = await ctx.loaders.competitionOwnershipLoader.load({
          competitionId,
          userId: ctx.user.id,
        })
        if (!ownershipResult.hasAccess) {
          throw new Error(
            'You do not have permission to manage athletes in this competition',
          )
        }

        return await pg.transaction().execute(async (trx) => {
          // Find the user's current registration
          const currentRegistration = await trx
            .selectFrom('Registration')
            .where('userId', '=', userId)
            .where('competitionId', '=', competitionId)
            .select(['id', 'ticketTypeId'])
            .executeTakeFirst()

          if (!currentRegistration) {
            throw new Error('Registration not found for this user in this competition')
          }

          // Find current entry - handle broken team cases
          let currentEntry = await trx
            .selectFrom('Entry')
            .where('userId', '=', userId)
            .where('ticketTypeId', '=', currentRegistration.ticketTypeId)
            .select(['id', 'teamId'])
            .executeTakeFirst()

          // If no entry found, this might be a broken team registration
          // Create an entry record for this user
          if (!currentEntry) {
            console.log(
              `Creating missing Entry record for user ${userId} with ticket type ${currentRegistration.ticketTypeId}`,
            )
            currentEntry = await trx
              .insertInto('Entry')
              .values({
                userId,
                teamId: null, // Will be updated to targetTeamId below
                ticketTypeId: currentRegistration.ticketTypeId,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returningAll()
              .executeTakeFirst()

            if (!currentEntry) {
              throw new Error('Failed to create Entry record for user')
            }
          }

          // Verify target team exists and is for the same ticket type
          const targetTeam = await trx
            .selectFrom('Team')
            .innerJoin('Entry', 'Entry.teamId', 'Team.id')
            .where('Team.id', '=', targetTeamId)
            .where('Entry.ticketTypeId', '=', currentRegistration.ticketTypeId)
            .select(['Team.id', 'Team.name'])
            .executeTakeFirst()

          if (!targetTeam) {
            throw new Error(
              'Target team not found or not compatible with user ticket type',
            )
          }

          // Get ticket type to check team size limits
          const ticketType = await trx
            .selectFrom('TicketType')
            .where('id', '=', currentRegistration.ticketTypeId)
            .select(['teamSize'])
            .executeTakeFirst()

          if (!ticketType) {
            throw new Error('Ticket type not found')
          }

          // Remove from current team if they have one
          if (currentEntry.teamId) {
            await trx
              .deleteFrom('TeamMember')
              .where('userId', '=', userId)
              .where('teamId', '=', currentEntry.teamId)
              .execute()
          }

          // Add to target team
          await trx
            .insertInto('TeamMember')
            .values({
              userId,
              teamId: targetTeamId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflict((oc) => oc.columns(['teamId', 'userId']).doNothing())
            .execute()

          // Check if target team already has an Entry record
          const existingTargetEntry = await trx
            .selectFrom('Entry')
            .where('teamId', '=', targetTeamId)
            .where('ticketTypeId', '=', currentRegistration.ticketTypeId)
            .select('id')
            .executeTakeFirst()

          if (existingTargetEntry) {
            // Target team already has an Entry - delete the current user's Entry
            // User will be part of team via TeamMember, scores/lanes stay with existing Entry
            await trx.deleteFrom('Entry').where('id', '=', currentEntry.id).execute()
          } else {
            // Target team doesn't have an Entry - update current Entry to point to it
            await trx
              .updateTable('Entry')
              .set({
                teamId: targetTeamId,
                updatedAt: new Date(),
              })
              .where('id', '=', currentEntry.id)
              .execute()
          }

          return true
        })
      },
    })
  },
})
