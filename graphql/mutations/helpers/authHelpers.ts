import { Context } from '../../context'

/**
 * Requires the current user to be authenticated and have super user privileges.
 * Throws descriptive errors for unauthorized access attempts.
 *
 * Use this helper in mutations that should only be accessible to super users.
 *
 * @param ctx - GraphQL context containing user information
 * @throws {Error} When user is not authenticated or not a super user
 */
export const requireSuperUser = (ctx: Context) => {
  if (!ctx.user) {
    throw new Error('Authentication required. Please log in to access this feature.')
  }

  if (!ctx.user.isSuperUser) {
    throw new Error(
      'Super user access required. This action is restricted to administrators only.',
    )
  }
}

/**
 * Requires the current user to be authenticated.
 * Throws descriptive error for unauthenticated access attempts.
 *
 * @param ctx - GraphQL context containing user information
 * @throws {Error} When user is not authenticated
 */
export const requireAuthentication = (ctx: Context) => {
  if (!ctx.user) {
    throw new Error('Authentication required. Please log in to access this feature.')
  }
}
