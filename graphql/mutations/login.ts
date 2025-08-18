import { extendType, nonNull, stringArg, objectType } from 'nexus'
import { User } from '../types'
import { storeUser, logout } from '../../lib/userInRedis'
import { createClient } from '@supabase/supabase-js'
import getKysely from '../../src/db'

console.log(`🔧 [Login] Using Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
console.log(
  `🔧 [Login] Service role key ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`,
)

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

// Create a new type for login response
export const LoginResponse = objectType({
  name: 'LoginResponse',
  definition(t) {
    t.field('user', { type: User })
    t.string('error')
  },
})

export const LoginMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('login', {
      type: LoginResponse,
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        try {
          // Use Supabase auth instead of custom implementation
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            })

          if (authError) {
            if (
              authError.code === 'email_not_confirmed' ||
              authError.message.includes('Email not confirmed') ||
              authError.message.includes('not confirmed')
            ) {
              // For unconfirmed emails, still try to get user from UserProfile
              const pg = getKysely()
              const userProfile = await pg
                .selectFrom('UserProfile')
                .where('email', '=', email)
                .selectAll()
                .executeTakeFirst()

              if (userProfile) {
                // Create session with unverified status
                const userData = {
                  ...userProfile,
                  isVerified: false, // Override to false for unconfirmed email
                }

                await storeUser(userData, ctx)
                return { user: userData }
              }
            }

            return { error: authError.message }
          }

          // Fetch user data from UserProfile table instead of Supabase metadata
          const pg = getKysely()
          const userProfile = await pg
            .selectFrom('UserProfile')
            .where('id', '=', authData.user.id)
            .selectAll()
            .executeTakeFirst()

          if (!userProfile) {
            // If no UserProfile exists, create one with minimal info
            await pg
              .insertInto('UserProfile')
              .values({
                id: authData.user.id,
                email: authData.user.email!,
                firstName: '', // Will need to be updated by user
                lastName: null,
                picture: null,
                bio: null,
                isSuperUser: false,
                isVerified: authData.user.email_confirmed_at !== null,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .execute()

            // Fetch the newly created profile
            const newUserProfile = await pg
              .selectFrom('UserProfile')
              .where('id', '=', authData.user.id)
              .selectAll()
              .executeTakeFirstOrThrow()

            const user = newUserProfile

            // Logout any existing session
            await logout(ctx)

            // Store new user session
            await storeUser(user, ctx)

            return { user }
          }

          // Use data entirely from UserProfile table
          const user = userProfile

          // Logout any existing session
          await logout(ctx)

          // Store new user session
          await storeUser(user, ctx)

          return { user }
        } catch (error) {
          console.error('Login error:', error)
          return { error: 'An error occurred during login. Please try again.' }
        }
      },
    })
  },
})
