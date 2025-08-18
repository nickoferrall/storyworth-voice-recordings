import { extendType, nonNull, stringArg, objectType } from 'nexus'
import { createClient } from '@supabase/supabase-js'

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

export const ResetPasswordResult = objectType({
  name: 'ResetPasswordResult',
  definition(t) {
    t.boolean('success')
    t.string('error')
  },
})

export const AdminResetPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('adminResetPassword', {
      type: ResetPasswordResult,
      args: {
        userId: nonNull(stringArg()),
        newPassword: nonNull(stringArg()),
      },
      resolve: async (_, { userId, newPassword }, { user }) => {
        try {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword,
          })

          if (error) {
            return { error: error.message, success: false }
          }

          return { success: true }
        } catch (error) {
          return { error: 'Failed to reset password', success: false }
        }
      },
    })
  },
})
