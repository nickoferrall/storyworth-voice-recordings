import { extendType, nonNull, stringArg, objectType } from 'nexus'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
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

// Create a response type for the reset password mutation
export const ResetPasswordResponse = objectType({
  name: 'ResetPasswordResponse',
  definition(t) {
    t.boolean('success')
    t.string('error')
  },
})

export const ResetPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('resetPassword', {
      type: ResetPasswordResponse,
      args: {
        password: nonNull(stringArg()),
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, { password, token }, _ctx) => {
        try {
          // Update the user's password using the token
          const { error } = await supabase.auth.admin.updateUserById(token, {
            password,
          })

          if (error) {
            console.error('Password update error:', error)
            return {
              success: false,
              error:
                'Failed to update password. The link may have expired or is invalid.',
            }
          }

          // Return success
          return { success: true }
        } catch (error: any) {
          console.error('Reset password error:', error)
          return {
            success: false,
            error: 'An error occurred. Please try again later.',
          }
        }
      },
    })
  },
})
