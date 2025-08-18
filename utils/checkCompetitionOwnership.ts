import getKysely from '../src/db'
import getRedis from './getRedis'
import { Context } from '../graphql/context'

type OwnershipResult = {
  hasAccess: boolean
  reason: 'OWNER' | 'CREATOR' | 'UNAUTHORIZED'
}

export async function checkCompetitionOwnership(
  competitionId: string,
  userId: string,
  ctx: Context,
): Promise<OwnershipResult> {
  const cacheKey = `comp_ownership:${competitionId}:${userId}`

  try {
    // Try to get from cache first
    const redis = getRedis()
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached) as OwnershipResult
      }
    }
  } catch (error) {
    // If Redis fails, continue without cache
    console.warn('Redis cache read failed for ownership check:', error)
  }

  const pg = getKysely()

  try {
    // Check if user is a super user first (they can access everything)
    // Use user from context (always available now)
    const isSuperUser = ctx.user?.isSuperUser || false

    if (isSuperUser) {
      const result = { hasAccess: true, reason: 'OWNER' as const }

      // Cache the result
      try {
        const redis = getRedis()
        if (redis) {
          await redis.setex(cacheKey, 300, JSON.stringify(result)) // Cache for 5 minutes
        }
      } catch (error) {
        console.warn('Redis cache write failed for ownership check:', error)
      }

      return result
    }

    // Check if user is the competition owner
    const competition = await pg
      .selectFrom('Competition')
      .select(['createdByUserId'])
      .where('id', '=', competitionId)
      .executeTakeFirst()

    if (!competition) {
      return { hasAccess: false, reason: 'UNAUTHORIZED' }
    }

    if (competition.createdByUserId === userId) {
      const result = { hasAccess: true, reason: 'OWNER' as const }

      // Cache the result
      try {
        const redis = getRedis()
        if (redis) {
          await redis.setex(cacheKey, 300, JSON.stringify(result))
        }
      } catch (error) {
        console.warn('Redis cache write failed for ownership check:', error)
      }

      return result
    }

    // Check if user is a competition creator
    const creator = await pg
      .selectFrom('CompetitionCreator')
      .select(['userId'])
      .where('competitionId', '=', competitionId)
      .where('userId', '=', userId)
      .executeTakeFirst()

    if (creator) {
      const result = { hasAccess: true, reason: 'CREATOR' as const }

      // Cache the result
      try {
        const redis = getRedis()
        if (redis) {
          await redis.setex(cacheKey, 300, JSON.stringify(result))
        }
      } catch (error) {
        console.warn('Redis cache write failed for ownership check:', error)
      }

      return result
    }

    const result = { hasAccess: false, reason: 'UNAUTHORIZED' as const }

    // Cache negative results too (but for shorter time)
    try {
      const redis = getRedis()
      if (redis) {
        await redis.setex(cacheKey, 60, JSON.stringify(result)) // Cache for 1 minute
      }
    } catch (error) {
      console.warn('Redis cache write failed for ownership check:', error)
    }

    return result
  } catch (error) {
    console.error('Error checking competition ownership:', error)
    return { hasAccess: false, reason: 'UNAUTHORIZED' }
  }
}
