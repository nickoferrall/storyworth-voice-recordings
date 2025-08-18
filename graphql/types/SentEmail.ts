import { extendType, idArg, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const SentEmail = objectType({
  name: 'SentEmail',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.list.nonNull.string('recipients')
    t.nonNull.string('subject')
    t.nonNull.string('message')
    t.string('competitionId')
    t.nonNull.field('sentAt', { type: 'DateTime' })
  },
})

export const GetSentEmails = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getSentEmails', {
      type: 'SentEmail',
      args: {
        compId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        const userId = ctx.user?.id
        if (!userId) {
          throw new Error('User not authenticated')
        }
        const pg = getKysely()
        const emails = await pg
          .selectFrom('SentEmail')
          .selectAll()
          .where('userId', '=', userId)
          .where('competitionId', '=', args.compId)
          .execute()

        if (emails.length === 0) {
          return [
            {
              id: 'example-id',
              userId,
              recipients: ['example@example.com'],
              subject: 'Example Email',
              message: 'This is the description of your example email.',
              sentAt: new Date(),
            },
          ]
        }

        return emails
      },
    })
  },
})
