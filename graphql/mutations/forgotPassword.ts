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

// Create a response type for the forgot password mutation
export const ForgotPasswordResponse = objectType({
  name: 'ForgotPasswordResponse',
  definition(t) {
    t.boolean('success')
    t.string('error')
  },
})

export const ForgotPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('forgotPassword', {
      type: ForgotPasswordResponse,
      args: {
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, { email }, _ctx) => {
        try {
          // Set the redirect URL for the password reset link
          const baseUrl =
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000'
              : 'https://fitlo.co'

          // Ensure the URL is properly formatted with the reset-password path
          const redirectTo = `${baseUrl}/reset-password`

          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
          })

          if (resetError) {
            console.error('Password reset error:', resetError)

            // Provide more specific error messages based on error type
            if (
              resetError.message?.includes('rate limit') ||
              resetError.message?.includes('too many requests')
            ) {
              return {
                success: false,
                error:
                  'Too many reset attempts. Please wait a few minutes before trying again.',
              }
            }

            if (
              resetError.message?.includes('email not found') ||
              resetError.message?.includes('not found')
            ) {
              return {
                success: false,
                error: 'No account found with this email address.',
              }
            }

            return {
              success: false,
              error:
                'Failed to send password reset email. Please check your email address and try again.',
            }
          }

          // Return success
          return { success: true }
        } catch (error: any) {
          console.error('Forgot password error:', error)
          return {
            success: false,
            error: 'An error occurred. Please try again later.',
          }
        }
      },
    })
  },
})
