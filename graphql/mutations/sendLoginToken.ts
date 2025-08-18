import { extendType, nonNull, inputObjectType } from 'nexus'
import crypto from 'crypto'
import getRedis from '../../utils/getRedis'
import MailgunManager from '../../lib/MailgunManager'
import getKysely from '../../src/db'

const SendLoginTokenInput = inputObjectType({
  name: 'SendLoginTokenInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('redirectPath')
  },
})

export const SendLoginToken = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('sendLoginToken', {
      args: {
        input: nonNull(SendLoginTokenInput),
      },
      resolve: async (_parent, { input }, ctx) => {
        const { email, redirectPath } = input

        const normalizedEmail = email.trim().toLowerCase()
        const pg = getKysely()
        const redis = getRedis()

        // Case-insensitive lookup on UserProfile (post-migration)
        const user = await pg
          .selectFrom('UserProfile')
          .where('email', 'ilike', normalizedEmail)
          .selectAll()
          .executeTakeFirst()

        if (!user) {
          throw new Error(`We can't find an account with that email address.`)
        }

        try {
          const token = crypto.randomBytes(32).toString('hex')
          // 600 seconds = 10 minutes
          await redis.set(`loginToken:${token}`, normalizedEmail, 'EX', 600)

          const isProd = process.env.NODE_ENV === 'production'
          const baseUrl = isProd ? 'https://fitlo.co' : 'http://localhost:3000'
          let loginLink = `${baseUrl}/authenticate?token=${token}`

          if (redirectPath && isValidRedirectPath(redirectPath)) {
            loginLink += `&redirectPath=${encodeURIComponent(redirectPath)}`
          }

          const mailgunManager = new MailgunManager()
          await mailgunManager.sendEmail({
            to: normalizedEmail,
            subject: 'Your fitlo Login Link',
            html: `
              <p>Hello,</p>
              <p>Click the link below to log in to your account:</p>
              <p><a href="${loginLink}">Log in to your account</a></p>
              <p>This link will expire in 10 minutes.</p>
            `,
          })

          return true
        } catch (error) {
          console.error('Error sending login token:', error)
          throw new Error('Failed to send login token.')
        }
      },
    })
  },
})

function isValidRedirectPath(path: string) {
  const trimmed = path.trim()
  return (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('://') &&
    // Prevent open redirects via encoded schemes
    !/^%2f%2f/i.test(trimmed)
  )
}
