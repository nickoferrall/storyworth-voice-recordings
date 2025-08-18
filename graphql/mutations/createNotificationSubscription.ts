import { extendType, nonNull, inputObjectType } from 'nexus'
import { NotificationSubscription } from '../types/NotificationSubscription'
import getKysely from '../../src/db'
import MailgunManager from '../../lib/MailgunManager'

export const CreateNotificationSubscriptionInput = inputObjectType({
  name: 'CreateNotificationSubscriptionInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('eventType')
    t.string('gender')
    t.string('teamSize')
    t.string('difficulty')
    t.list.string('countries')
    t.list.string('locations')
    t.list.nonNull.string('tags')
  },
})

export const CreateNotificationSubscription = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNotificationSubscription', {
      type: NotificationSubscription,
      args: {
        input: nonNull(CreateNotificationSubscriptionInput),
      },
      resolve: async (_parent, { input }, ctx) => {
        console.log('🚀 ~ input:', input)
        const pg = getKysely()

        // If user is logged in, link the subscription to their account
        const userId = ctx.user?.id

        const subscription = await pg
          .insertInto('NotificationSubscription')
          .values({
            email: input.email,
            userId,
            eventType: input.eventType || null,
            gender: input.gender || null,
            teamSize: input.teamSize || null,
            difficulty: input.difficulty || null,
            countries: input.countries || [],
            locations: input.locations || [],
            tags: input.tags || [],
          })
          .returningAll()
          .executeTakeFirst()

        // Send notification email
        const emailOptions = {
          to: 'nickoferrall@gmail.com',
          subject: 'New notification subscription!',
          body: input.email,
          html: `
            <h1>New Notification Subscription</h1>
            <p>Email: ${input.email}</p>
            <p>Event Type: ${input.eventType || 'Any'}</p>
            <p>Gender: ${input.gender || 'Any'}</p>
            <p>Team Size: ${input.teamSize || 'Any'}</p>
            <p>Difficulty: ${input.difficulty || 'Any'}</p>
            <p>Countries: ${input.countries?.join(', ') || 'Any'}</p>
            <p>Locations: ${input.locations?.join(', ') || 'Any'}</p>
            <p>Tags: ${input.tags?.join(', ') || 'None'}</p>
          `,
        }
        const mailgunManager = new MailgunManager()
        mailgunManager.sendEmail(emailOptions)

        return subscription
      },
    })
  },
})
