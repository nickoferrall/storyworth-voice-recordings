import { Pool } from 'pg'
import dotenv from 'dotenv'
import sleep from '../utils/sleep'
import path from 'path'

// Load environment-specific config
// const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envPath = path.join(process.cwd(), envFile)

// Try to load the environment file, fall back to default .env
try {
  dotenv.config({ path: envPath })
  console.log(`📁 Loaded environment from: ${envFile}`)
  console.log(`🔍 DB Connection Debug:`)
  console.log(`  HOST: ${process.env.DB_HOST}`)
  console.log(`  PORT: ${process.env.DB_PORT}`)
  console.log(`  NAME: ${process.env.DB_NAME}`)
  console.log(`  USER: ${process.env.DB_USER}`)
  console.log(`  PASSWORD: ${process.env.DB_PASSWORD ? '***masked***' : 'NOT SET'}`)
} catch (error) {
  console.log(`⚠️  Could not load ${envFile}, falling back to default .env`)
  dotenv.config()
}

const usesConnString = !!process.env.DATABASE_URL
const config: any = usesConnString
  ? {
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_MAX_CLIENTS || '50'),
      ssl:
        process.env.NODE_ENV === 'production' ||
        /supabase\.co/.test(process.env.DATABASE_URL || '')
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      max: parseInt(process.env.DB_MAX_CLIENTS || '50'),
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    }

let pool: Pool | undefined

const graceFullyReconnect = async () => {
  for (let i = 0; i < 1e6; i++) {
    const nextPool = new Pool(config)
    try {
      const testClient = await nextPool.connect()
      testClient.release()
      nextPool.on('error', graceFullyReconnect)
      const oldPool = pool
      pool = nextPool
      oldPool?.emit('changePool')
      return
    } catch (e) {
      await sleep(1000) // Retry after a short delay
    }
  }
}

const getPg = (schema?: string) => {
  if (!pool) {
    pool = new Pool(config)
    pool.on('error', graceFullyReconnect)
    if (schema) {
      pool.on('connect', (client) => {
        client.query(`SET search_path TO "${schema}"`)
      })
    }
  }
  return pool
}

export const closePg = async () => {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}

export default getPg
