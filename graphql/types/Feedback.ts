import { objectType, enumType, extendType, nonNull, stringArg } from 'nexus'

export const Feedback = objectType({
  name: 'Feedback',
  definition(t) {
    t.string('id')
    t.nullable.string('userId')
    t.field('createdAt', { type: 'DateTime' })
    t.string('text')
  },
})

export const SubmitFeedbackMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('submitFeedback', {
      type: Feedback,
      args: {
        text: nonNull(stringArg()),
      },
      resolve: async (_parent, { text }, ctx) => {
        // const userId = ctx.user?.id
        // const feedback = await submitFeedbackInDb({
        //   userId,
        //   text,
        // })
        // const mailgunManager = new MailgunManager()

        // const user = ctx.user?.id
        //   ? await getUserByIdInDb({
        //       id: userId,
        //     })
        //   : null
        // const emailOptions = {
        //   from: 'TalHub Team <hey@mail.talhub.app>',
        //   to: ['nickoferrall@gmail.com'],
        //   subject: 'There is feedback!',
        //   body: `We got some feedback from ${user?.email ?? 'Not logged in'}!`,
        //   html: `
        //     <h1>Here is the feedback!</h1>
        //     <p>${text}</p>
        //   `,
        // }
        // await mailgunManager.sendEmail(emailOptions)
        return null
      },
    })
  },
})
