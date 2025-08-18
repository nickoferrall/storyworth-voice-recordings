import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import getRedis from '../../utils/getRedis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Only allow in development or for super users
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionToken = cookies.sessionToken
  const redis = getRedis()

  const debugInfo = {
    timestamp: new Date().toISOString(),
    hasSessionToken: !!sessionToken,
    sessionTokenPreview: sessionToken ? `${sessionToken.slice(0, 8)}...` : null,
    allCookies: Object.keys(cookies),
    rawCookieHeader: req.headers.cookie,
    userAgent: req.headers['user-agent'],
    host: req.headers.host,
    sessionInRedis: false,
    sessionData: null as any,
    totalSessionsInRedis: 0,
    redisError: null,
  }

  try {
    // Check if session exists in Redis
    if (sessionToken) {
      const userString = await redis.get(`session:${sessionToken}`)
      if (userString) {
        debugInfo.sessionInRedis = true
        const user = JSON.parse(userString)
        debugInfo.sessionData = {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          hasRequiredFields:
            user.hasOwnProperty('isSuperUser') && user.hasOwnProperty('isVerified'),
        }
      }
    }

    // Count total sessions
    const allSessionKeys = await redis.keys('session:*')
    debugInfo.totalSessionsInRedis = allSessionKeys.length
  } catch (error: any) {
    debugInfo.redisError = error.message
  }

  res.status(200).json(debugInfo)
}
