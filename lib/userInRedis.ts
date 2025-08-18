import getRedis from '../utils/getRedis'
import cookie from 'cookie'
import { Context } from '../graphql/context'
import { User, UserProfile } from '../src/generated/database'
import { Selectable } from 'kysely'
import getKysely from '../src/db'

import { v4 as uuidv4 } from 'uuid'

export const storeUser = async (user: Selectable<UserProfile>, ctx: Context) => {
  const sessionToken = uuidv4()
  const isProduction = process.env.NODE_ENV === 'production'
  const oneYearFromNow = new Date()
  oneYearFromNow.setDate(oneYearFromNow.getDate() + 365)

  // Use Lax instead of Strict for better compatibility
  // Strict can cause issues with some navigation patterns
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    expires: oneYearFromNow,
    maxAge: 31536000, // 1 year in seconds
  }

  const cookieString = cookie.serialize('sessionToken', sessionToken, cookieOptions)

  ctx.res.setHeader('Set-Cookie', cookieString)

  // Update the cookie in the request headers for subsequent operations in the same request lifecycle
  ctx.req.headers.cookie = cookieString

  const redis = getRedis()

  try {
    await redis.set(`session:${sessionToken}`, JSON.stringify(user), 'EX', 31536000)
    console.log(
      `Session stored for user ${user.id} (${user.email}) with token ${sessionToken.slice(0, 8)}...`,
    )
  } catch (error) {
    console.error('Failed to store session in Redis:', error)
    throw error
  }
}

export const getUser = async (ctx: Context): Promise<Selectable<UserProfile> | null> => {
  const { req } = ctx
  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionToken = cookies.sessionToken

  if (!sessionToken) {
    console.log('No session token found in cookies')
    return null
  }

  const redis = getRedis()

  try {
    const userString = await redis.get(`session:${sessionToken}`)
    if (userString) {
      const user = JSON.parse(userString)
      console.log(
        `Session found for user ${user.id} (${user.email}) with token ${sessionToken.slice(0, 8)}...`,
      )

      // Check if this is an old session missing required fields
      if (!user.hasOwnProperty('isSuperUser') || !user.hasOwnProperty('isVerified')) {
        const shouldMigrateOldSessions = process.env.MIGRATE_OLD_SESSIONS !== 'false'

        if (shouldMigrateOldSessions) {
          console.log(
            `Old session detected for user ${user.email}. Attempting to migrate to UserProfile format...`,
          )

          try {
            // Try to get user data from UserProfile table
            const pg = getKysely()
            const userProfile = await pg
              .selectFrom('UserProfile')
              .where('email', '=', user.email)
              .selectAll()
              .executeTakeFirst()

            if (userProfile) {
              // Update the session with complete UserProfile data
              await redis.set(
                `session:${sessionToken}`,
                JSON.stringify(userProfile),
                'EX',
                31536000,
              )
              console.log(`Successfully migrated session for user ${user.email}`)
              return userProfile
            } else {
              console.log(`No UserProfile found for ${user.email}, clearing session`)
              await redis.del(`session:${sessionToken}`)
              return null
            }
          } catch (migrationError) {
            console.error('Error migrating session:', migrationError)
            // Clear the invalid session as fallback
            await redis.del(`session:${sessionToken}`)
            return null
          }
        } else {
          console.log(
            `Old session detected for user ${user.email}, clearing session (migration disabled)`,
          )
          await redis.del(`session:${sessionToken}`)
          return null
        }
      }

      return user
    } else {
      console.log(`No session found in Redis for token ${sessionToken.slice(0, 8)}...`)
      return null
    }
  } catch (error) {
    console.error('Failed to retrieve session from Redis:', error)
    return null
  }
}

export const logout = async (ctx: Context) => {
  const { req, res } = ctx
  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionToken = cookies.sessionToken

  if (sessionToken) {
    const redis = getRedis()
    try {
      await redis.del(`session:${sessionToken}`)
      console.log(`Session deleted for token ${sessionToken.slice(0, 8)}...`)
    } catch (error) {
      console.error('Failed to delete session from Redis:', error)
    }
  }

  if (!res.headersSent) {
    const isProduction = process.env.NODE_ENV === 'production'
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('sessionToken', '', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        expires: new Date(0),
        maxAge: 0,
      }),
    )
  }
}
