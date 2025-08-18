import { objectType, enumType, extendType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const PartnerInterestType = enumType({
  name: 'PartnerInterestType',
  members: ['LOOKING_FOR_JOINERS', 'LOOKING_TO_JOIN'],
})

export const PartnerPreference = enumType({
  name: 'PartnerPreference',
  members: ['ANYONE', 'SAME_GYM'],
})

export const PartnerInterestStatus = enumType({
  name: 'PartnerInterestStatus',
  members: ['ACTIVE', 'FILLED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_FILLED'],
})

export const PartnerInterest = objectType({
  name: 'PartnerInterest',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.field('interestType', { type: 'PartnerInterestType' })
    t.nonNull.field('partnerPreference', { type: 'PartnerPreference' })
    t.string('categoryId')
    t.string('ticketTypeId')
    t.string('description')
    t.string('phone')
    t.string('instagram')
    t.nonNull.string('status')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.userByIdLoader.load(parent.userId)
      },
    })
    t.field('category', {
      type: 'Category',
      resolve: async (parent, _args, ctx) => {
        if (!parent.categoryId) return null
        try {
          const category = await ctx.loaders.categoryByIdLoader.load(parent.categoryId)
          if (!category) return null
          return {
            ...category,
            price: category.price || 0,
          } as any // Cast to any to resolve enum type mismatch
        } catch (error) {
          console.warn(`Failed to load category ${parent.categoryId}:`, error)
          return null
        }
      },
    })
    t.field('ticketType', {
      type: 'TicketType',
      resolve: async (parent, _args, ctx) => {
        if (!parent.ticketTypeId) return null
        const ticketType = await ctx.loaders.ticketTypeLoader.load(parent.ticketTypeId)
        if (!ticketType) return null
        return {
          ...ticketType,
          currency: ticketType.currency || 'GBP', // Provide default value
        } as any // Cast to any to resolve enum type mismatch
      },
    })
    t.list.field('partnerRequests', {
      type: 'PartnerRequest',
      resolve: async (parent, _args, ctx) => {
        // Load all partner requests for the interest owner
        if (ctx.user?.id === parent.userId) {
          return ctx.loaders.partnerRequestsByInterestIdLoader.load(parent.id)
        }

        // For other users, only return accepted partner requests so they can see team composition
        // This allows correct team size calculation and member name display
        const allRequests = await ctx.loaders.partnerRequestsByInterestIdLoader.load(
          parent.id,
        )
        return allRequests.filter((request) => request.status === 'ACCEPTED')
      },
    })
    t.list.field('teamMembers', {
      type: 'PartnerInterestTeamMember',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.partnerInterestTeamMembersByInterestIdLoader.load(parent.id)
      },
    })
  },
})

export const GetPartnerInterests = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('getPartnerInterests', {
      type: 'PartnerInterest',
      args: {
        status: stringArg(),
        interestType: stringArg(),
        directoryCompId: stringArg(),
        competitionId: stringArg(),
      },
      resolve: async (
        _root,
        { status, interestType, directoryCompId, competitionId },
        ctx,
      ) => {
        const pg = getKysely()

        // Define status filter once
        const statusFilter = status ? [status] : ['ACTIVE', 'PARTIALLY_FILLED', 'FILLED']

        // OPTIMIZED: Single query using UNION for directoryCompId case
        if (directoryCompId) {
          // Use UNION to combine category-based and ticket-based interests in single query
          let categorySubquery = pg
            .selectFrom('PartnerInterest as pi')
            .innerJoin('Category as c', 'c.id', 'pi.categoryId')
            .where('c.directoryCompId', '=', directoryCompId)
            .where('pi.status', 'in', statusFilter)
            .selectAll('pi')

          let ticketSubquery = pg
            .selectFrom('PartnerInterest as pi')
            .innerJoin('TicketType as tt', 'tt.id', 'pi.ticketTypeId')
            .innerJoin('Competition as comp', 'comp.id', 'tt.competitionId')
            .innerJoin('DirectoryComp as dc', 'dc.competitionId', 'comp.id')
            .where('dc.id', '=', directoryCompId)
            .where('pi.status', 'in', statusFilter)
            .selectAll('pi')

          // Apply interestType filter to both subqueries if provided
          if (interestType) {
            categorySubquery = categorySubquery.where(
              'pi.interestType',
              '=',
              interestType,
            )
            ticketSubquery = ticketSubquery.where('pi.interestType', '=', interestType)
          }

          // Combine with UNION DISTINCT to avoid duplicates
          const unionQuery = categorySubquery.union(ticketSubquery)

          // Execute the unified query with ordering and limit
          const interests = await pg
            .selectFrom(unionQuery.as('unified'))
            .selectAll()
            .orderBy('createdAt', 'desc')
            .limit(100) // Add pagination to prevent huge result sets
            .execute()

          return interests.map((interest) => ({
            id: interest.id,
            userId: interest.userId,
            interestType: interest.interestType as
              | 'LOOKING_FOR_JOINERS'
              | 'LOOKING_TO_JOIN',
            partnerPreference: interest.partnerPreference as 'ANYONE' | 'SAME_GYM',
            categoryId: interest.categoryId,
            ticketTypeId: interest.ticketTypeId,
            description: interest.description,
            phone: interest.phone,
            status: interest.status,
            createdAt: interest.createdAt,
            updatedAt: interest.updatedAt,
          }))
        }

        // OPTIMIZED: Competition-based query with proper filtering at DB level
        if (competitionId) {
          let competitionQuery = pg
            .selectFrom('PartnerInterest as pi')
            .innerJoin('TicketType as tt', 'tt.id', 'pi.ticketTypeId')
            .where('tt.competitionId', '=', competitionId)
            .where('pi.status', 'in', statusFilter)

          if (interestType) {
            competitionQuery = competitionQuery.where(
              'pi.interestType',
              '=',
              interestType,
            )
          }

          const interests = await competitionQuery
            .selectAll('pi')
            .orderBy('pi.createdAt', 'desc')
            .limit(100)
            .execute()

          return interests.map((interest) => ({
            id: interest.id,
            userId: interest.userId,
            interestType: interest.interestType as
              | 'LOOKING_FOR_JOINERS'
              | 'LOOKING_TO_JOIN',
            partnerPreference: interest.partnerPreference as 'ANYONE' | 'SAME_GYM',
            categoryId: interest.categoryId,
            ticketTypeId: interest.ticketTypeId,
            description: interest.description,
            phone: interest.phone,
            status: interest.status,
            createdAt: interest.createdAt,
            updatedAt: interest.updatedAt,
          }))
        }

        // Default case: user's own interests or general query
        let query = pg.selectFrom('PartnerInterest').where('status', 'in', statusFilter)

        if (interestType) {
          query = query.where('interestType', '=', interestType)
        }

        // If user is authenticated and no specific filters, show only their interests
        if (ctx.user?.id && !directoryCompId && !competitionId) {
          query = query.where('userId', '=', ctx.user.id)
        }

        const interests = await query
          .selectAll()
          .orderBy('createdAt', 'desc')
          .limit(100)
          .execute()

        return interests.map((interest) => ({
          id: interest.id,
          userId: interest.userId,
          interestType: interest.interestType as
            | 'LOOKING_FOR_JOINERS'
            | 'LOOKING_TO_JOIN',
          partnerPreference: interest.partnerPreference as 'ANYONE' | 'SAME_GYM',
          categoryId: interest.categoryId,
          ticketTypeId: interest.ticketTypeId,
          description: interest.description,
          phone: interest.phone,
          status: interest.status,
          createdAt: interest.createdAt,
          updatedAt: interest.updatedAt,
        }))
      },
    })
  },
})
