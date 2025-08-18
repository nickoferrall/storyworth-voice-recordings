// graphql/mutations/sendBulkEmail.ts

import { extendType } from 'nexus'
import MailgunManager from '../../lib/MailgunManager'

const gyms: any = []

export const SendBulkEmail = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('sendBulkEmail', {
      resolve: async (_parent, _args, ctx) => {
        // Optional: Check for authentication and authorization

        const manager = new MailgunManager()
        let emailSent = false
        for (const gym of gyms) {
          if (emailSent) {
            // If an email has already been sent, stop processing (remove this if you want to send to all)
            // break
          }
          const email = gym.email
          const gymName = gym.name || 'there' // Fallback if gym name is missing

          if (email) {
            try {
              console.log('🚀 ~ Sending email to gym:', gymName)

              const emailContent = `
                <p>Hey ${gymName},</p>
                <p>I was wondering if you host any competitions at your box, such as a Christmas throwdown?</p>
                <p>I'm the founder of <a href="https://fitlo.co/">fitlo</a> - a new platform that makes it easier to organise competitions. You can have a live leaderboard, sell tickets, customise heats, and more.</p>
                <p>If it sounds interesting, would you like to have a quick call? You can select a time <a href="https://calendly.com/hello-fitlo/30min">here</a>.</p>
                <p>All the best,<br>Nick</p>
              `

              await manager.sendEmail({
                to: email,
                // to: 'nickoferrall@gmail.com',
                subject: 'Quick call about comps?',
                html: emailContent,
              })
              console.log(`Email sent to ${email}`)
              //   emailSent = true // Set this to true to send only one email (for testing)
            } catch (error) {
              console.error(`Failed to send email to ${email}:`, error)
            }
          } else {
            console.log(`No email found for ${gymName}`)
          }
        }

        console.log('All emails processed.')
        return true
      },
    })
  },
})
