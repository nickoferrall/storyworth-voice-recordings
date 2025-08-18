import { objectType, enumType, extendType, nonNull, stringArg, list } from 'nexus'
import { Address } from './Competition'
import getKysely from '../../src/db'

export const PotentialCompetitionStatus = enumType({
  name: 'PotentialCompetitionStatus',
  members: ['PENDING', 'APPROVED', 'REJECTED'],
})

export const PotentialTicketType = objectType({
  name: 'PotentialTicketType',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('potentialCompetitionId')
    t.nonNull.string('name')
    t.string('description')
    t.nonNull.float('price', {
      resolve: ({ price }) => {
        return typeof price === 'string' ? parseFloat(price) : price
      },
    })
    t.string('currency')
    t.nonNull.int('maxEntries')
    t.nonNull.int('teamSize')
    t.nonNull.boolean('isVolunteer')
    t.nonNull.boolean('allowHeatSelection')
    t.nonNull.boolean('passOnPlatformFee')
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
  },
})

export const PotentialCompetition = objectType({
  name: 'PotentialCompetition',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.string('description')
    t.field('startDateTime', { type: 'DateTime' })
    t.field('endDateTime', { type: 'DateTime' })
    t.string('addressId')
    t.string('timezone')
    t.string('logo')
    t.string('website')
    t.string('email')
    t.string('instagramHandle')
    t.string('currency')
    t.float('price', {
      resolve: ({ price }) => {
        return typeof price === 'string' ? parseFloat(price) : price
      },
    })
    t.nonNull.string('source')
    t.string('country')
    t.string('state')
    t.string('region')
    t.string('orgName')
    t.string('scrapedData', {
      resolve: ({ scrapedData }) => {
        if (!scrapedData) return null
        return typeof scrapedData === 'string' ? scrapedData : JSON.stringify(scrapedData)
      },
    })
    t.nonNull.field('status', { type: PotentialCompetitionStatus })
    t.string('reviewedBy')
    t.field('reviewedAt', { type: 'DateTime' })
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })

    t.field('address', {
      type: Address,
      resolve: async ({ addressId }, _, { loaders }) => {
        if (!addressId) return null
        return await loaders.addressLoader.load(addressId)
      },
    })

    t.list.field('potentialTicketTypes', {
      type: PotentialTicketType,
      resolve: async ({ id }, _, { loaders }) => {
        return await loaders.potentialTicketTypesByPotentialCompetitionIdLoader.load(id)
      },
    })

    t.field('reviewer', {
      type: 'User',
      resolve: async ({ reviewedBy }, _, ctx) => {
        if (!reviewedBy) return null
        return await ctx.loaders.userByIdLoader.load(reviewedBy)
      },
    })
  },
})

// Query to get all potential competitions for super users
export const GetPotentialCompetitions = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getPotentialCompetitions', {
      type: 'PotentialCompetition',
      resolve: async (_src, _, { user }) => {
        // Check if user is super user
        if (!user?.isSuperUser) {
          throw new Error('Access denied. Super user privileges required.')
        }

        const kysely = getKysely()

        return await kysely
          .selectFrom('PotentialCompetition')
          .selectAll()
          .orderBy('createdAt', 'desc')
          .execute()
      },
    })
  },
})

// Query to get a single potential competition
export const GetPotentialCompetition = extendType({
  type: 'Query',
  definition(t) {
    t.field('getPotentialCompetition', {
      type: 'PotentialCompetition',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_src, { id }, { user }) => {
        // Check if user is super user
        if (!user?.isSuperUser) {
          throw new Error('Access denied. Super user privileges required.')
        }

        const kysely = getKysely()

        return await kysely
          .selectFrom('PotentialCompetition')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst()
      },
    })
  },
})
