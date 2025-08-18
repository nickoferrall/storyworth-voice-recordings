import { NextApiRequest, NextApiResponse } from 'next'
import getKysely from '../../src/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connection
    const db = getKysely()
    await db.selectFrom('User').select('id').limit(1).execute()

    // Check environment
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: process.env.npm_package_version || 'unknown',
    }

    res.status(200).json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
