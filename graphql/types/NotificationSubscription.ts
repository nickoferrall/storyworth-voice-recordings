import { objectType, extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const NotificationSubscription = objectType({
  name: 'NotificationSubscription',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('email')
    t.string('userId')
    t.string('eventType')
    t.list.string('countries')
    t.string('gender')
    t.string('difficulty')
    t.list.string('locations')
    t.string('teamSize')
    t.list.nonNull.string('tags')
  },
})

export const GetNotificationSubscription = extendType({
  type: 'Query',
  definition(t) {
    t.field('getNotificationSubscription', {
      type: NotificationSubscription,
      args: {
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, { email }, ctx) => {
        const pg = getKysely()

        const subscription = await pg
          .selectFrom('NotificationSubscription')
          .selectAll()
          .where('email', '=', email)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .executeTakeFirst()

        return subscription
      },
    })
  },
})
