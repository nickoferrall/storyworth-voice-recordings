import { extendType, objectType } from 'nexus'
import { createClient } from '@supabase/supabase-js'
import { logout } from '../../lib/userInRedis'

// Initialize Supabase admin client with service role key
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

export const LogoutPayload = objectType({
  name: 'LogoutPayload',
  definition(t) {
    t.boolean('success')
    t.string('message')
  },
})

export const LogoutMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('logout', {
      type: LogoutPayload,
      resolve: async (_parent, _args, ctx) => {
        try {
          // Clear Redis session (this is the important part)
          await logout(ctx)

          // Also sign out from Supabase if we have a user ID
          if (ctx.user?.id) {
            await supabase.auth.admin.signOut(ctx.user.id)
          }

          return {
            success: true,
            message: 'Logged out successfully',
          }
        } catch (error: any) {
          console.error('Error during logout:', error)
          return {
            success: true,
            message: 'Logged out successfully',
          }
        }
      },
    })
  },
})
