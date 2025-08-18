import { objectType, enumType, extendType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const PartnerRequestStatus = enumType({
  name: 'PartnerRequestStatus',
  members: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
})

export const PartnerRequest = objectType({
  name: 'PartnerRequest',
  definition(t) {
    t.nonNull.string('id')
    t.string('fromInterestId')
    t.string('fromUserId')
    t.nonNull.string('toInterestId')
    t.string('message')
    t.string('phone')
    t.string('instagram')
    t.nonNull.field('status', { type: PartnerRequestStatus })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.field('fromInterest', {
      type: 'PartnerInterest',
      resolve: async (parent, _args, ctx) => {
        return parent.fromInterestId
          ? ctx.loaders.partnerInterestByIdLoader.load(parent.fromInterestId)
          : null
      },
    })
    t.field('fromUser', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return parent.fromUserId
          ? ctx.loaders.userByIdLoader.load(parent.fromUserId)
          : null
      },
    })
    t.field('toInterest', {
      type: 'PartnerInterest',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.partnerInterestByIdLoader.load(parent.toInterestId)
      },
    })
  },
})

export const GetPartnerRequests = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('getPartnerRequests', {
      type: 'PartnerRequest',
      resolve: async (_root, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }

        console.log('🔍 GetPartnerRequests called for user:', ctx.user.id)
        const startTime = Date.now()

        const pg = getKysely()
        const userId = ctx.user.id

        console.log('🔍 Fetching user interests...')
        const interestsStart = Date.now()
        // First, get all the user's partner interest IDs
        const userInterests = await pg
          .selectFrom('PartnerInterest')
          .where('userId', '=', userId)
          .select('id')
          .execute()
        const interestsEnd = Date.now()
        console.log(
          `🔍 User interests fetched in ${interestsEnd - interestsStart}ms, found ${userInterests.length} interests`,
        )

        const userInterestIds = userInterests.map((interest) => interest.id)

        console.log('🔍 Fetching partner requests...')
        const requestsStart = Date.now()
        // Get requests where user is either sender or receiver
        // This is much faster than using subqueries in OR conditions
        const query = pg
          .selectFrom('PartnerRequest')
          .where((eb) =>
            eb.or([
              eb('fromUserId', '=', userId),
              ...(userInterestIds.length > 0
                ? [
                    eb('fromInterestId', 'in', userInterestIds),
                    eb('toInterestId', 'in', userInterestIds),
                  ]
                : []),
            ]),
          )

        const requests = await query
          .selectAll()
          .orderBy('createdAt', 'desc') // Order by newest first at database level
          .execute()
        const requestsEnd = Date.now()
        console.log(
          `🔍 Partner requests fetched in ${requestsEnd - requestsStart}ms, found ${requests.length} requests`,
        )

        const result = requests.map((request) => ({
          id: request.id,
          fromInterestId: request.fromInterestId,
          fromUserId: request.fromUserId,
          toInterestId: request.toInterestId,
          message: request.message,
          phone: request.phone,
          status: request.status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        }))

        const endTime = Date.now()
        console.log(`🔍 GetPartnerRequests completed in ${endTime - startTime}ms`)

        return result
      },
    })
  },
})
