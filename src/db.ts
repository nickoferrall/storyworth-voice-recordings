import { Kysely, PostgresDialect } from 'kysely'
import { DB } from './generated/database' // Import the generated types
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment-specific config
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envPath = path.join(process.cwd(), envFile)

// Try to load the environment file, fall back to default .env
try {
  dotenv.config({ path: envPath })
  console.log(`🔧 [Kysely] Loaded environment from: ${envFile}`)
  console.log(`🔧 [Kysely] DB Connection Debug:`)
  console.log(`  HOST: ${process.env.DB_HOST}`)
  console.log(`  PORT: ${process.env.DB_PORT}`)
  console.log(`  NAME: ${process.env.DB_NAME}`)
  console.log(`  USER: ${process.env.DB_USER}`)
  console.log(`  PASSWORD: ${process.env.DB_PASSWORD ? '***masked***' : 'NOT SET'}`)
} catch (error) {
  console.log(`⚠️  Could not load ${envFile}, falling back to default .env`)
  dotenv.config()
}

// Singleton instance of Kysely
let kysely: Kysely<DB> | undefined

// Create a pool that connects to production database
const createPool = () => {
  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_MAX_CLIENTS || '50'),
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

// Function to create a new Kysely instance
const makeKysely = (schema?: string): Kysely<DB> => {
  const pool = createPool()

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool,
    }),
    // Uncomment this section if you want to enable query logging
    // log(event) {
    //   if (event.level === 'query') {
    //     console.log(event.query.sql);
    //     console.log(event.query.parameters);
    //   }
    // },
  })
}

// Function to get the Kysely instance, initializing it if necessary
const getKysely = (schema?: string): Kysely<DB> => {
  if (!kysely) {
    kysely = makeKysely(schema)
  }
  return kysely
}

export default getKysely
