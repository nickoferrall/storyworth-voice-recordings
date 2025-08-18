import { nonNull, stringArg, list, extendType } from 'nexus'
import MailgunManager from '../../lib/MailgunManager'
import getKysely from '../../src/db'

export const SendEmailsMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('sendEmails', {
      type: 'Boolean',
      args: {
        recipients: nonNull(list(nonNull(stringArg()))),
        subject: nonNull(stringArg()),
        message: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { recipients, subject, message, competitionId }, ctx) => {
        const userId = ctx.user?.id
        if (!userId) {
          throw new Error('User not authenticated')
        }

        const mailgunManager = new MailgunManager()

        try {
          const result = await mailgunManager.sendEmail({
            to: recipients,
            subject,
            body: message,
            senderName: ctx.user?.firstName,
          })

          if (!result) {
            throw new Error('Failed to send emails')
          }

          const pg = getKysely()
          await pg
            .insertInto('SentEmail')
            .values({
              userId,
              recipients,
              subject,
              message,
              competitionId,
              sentAt: new Date(),
            })
            .execute()

          return true
        } catch (error: any) {
          console.error('Error sending emails:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
