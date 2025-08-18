import { extendType, nonNull, stringArg, objectType } from 'nexus'
import { storeUser } from '../../lib/userInRedis'
import { User } from '../types'
import { createClient } from '@supabase/supabase-js'
import getKysely from '../../src/db'
import MailgunManager from '../../lib/MailgunManager'

console.log(`🔧 [SignUp] Using Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
console.log(
  `🔧 [SignUp] Service role key ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`,
)

// Create a response type for signup
export const SignupResponse = objectType({
  name: 'SignupResponse',
  definition(t) {
    t.field('user', { type: User })
    t.string('error')
  },
})

// Initialize Supabase client with environment-specific config
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export const SignupMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('signUp', {
      type: SignupResponse,
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password, firstName, lastName }, ctx) => {
        try {
          const pg = getKysely()
          // Check if user already exists in User table
          const existingUser = await pg
            .selectFrom('UserProfile')
            .where('email', '=', email)
            .selectAll()
            .executeTakeFirst()

          console.log('🚀 ~ existingUser:', existingUser)
          if (existingUser) {
            return { error: 'User already exists' }
          }

          // Create user in Supabase Auth (minimal metadata)
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
            })

          if (authError) {
            console.error('Error creating user:', authError)
            return { error: 'Failed to create user' }
          }

          if (!authData.user) {
            return { error: 'Failed to create user' }
          }

          // Create user in UserProfile table
          await pg
            .insertInto('UserProfile')
            .values({
              id: authData.user.id,
              email,
              firstName,
              lastName,
              picture: null,
              bio: null,
              isSuperUser: false,
              isVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .execute()

          const user = {
            id: authData.user.id,
            email,
            firstName,
            lastName,
            picture: null,
            bio: null,
            isSuperUser: false,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            invitationId: null,
            referredBy: null,
            referralCode: null,
            orgId: null,
          }

          // Store user in Redis
          await storeUser(user, ctx)

          if (process.env.NODE_ENV === 'production') {
            const emailOptionsForMe = {
              to: 'nickoferrall@gmail.com',
              subject: 'New signup!',
              body: email,
              html: `
                <h1>Someone signed up!</h1>
                <p>Email: ${email}</p>
                <p>Name: ${firstName} ${lastName}</p>
              `,
            }
            const mailgunManager = new MailgunManager()
            mailgunManager.sendEmail(emailOptionsForMe)
          }

          return { user }
        } catch (error) {
          console.error('Error during signup:', error)
          return { error: 'An error occurred during signup. Please try again.' }
        }
      },
    })
  },
})
