import { extendType, nonNull, inputObjectType } from 'nexus'
import { NotificationSubscription } from '../types/NotificationSubscription'
import getKysely from '../../src/db'

export const UpdateNotificationSubscriptionInput = inputObjectType({
  name: 'UpdateNotificationSubscriptionInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('eventType')
    t.list.string('countries')
    t.list.string('locations')
    t.string('gender')
    t.string('teamSize')
    t.string('difficulty')
    t.list.nonNull.string('tags')
  },
})

export const UpdateNotificationSubscription = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateNotificationSubscription', {
      type: NotificationSubscription,
      args: {
        input: nonNull(UpdateNotificationSubscriptionInput),
      },
      resolve: async (_parent, { input }, ctx) => {
        const pg = getKysely()

        const subscription = await pg
          .updateTable('NotificationSubscription')
          .set({
            eventType: input.eventType || null,
            countries: input.countries || null,
            locations: input.locations || null,
            gender: input.gender || null,
            teamSize: input.teamSize || null,
            difficulty: input.difficulty || null,
            tags: input.tags || [],
          })
          .where('email', '=', input.email)
          .returningAll()
          .executeTakeFirst()

        if (!subscription) {
          throw new Error('Notification subscription not found')
        }

        return subscription
      },
    })
  },
})
