import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()

  // Add new currency values
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'CAD'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'CHF'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'CNY'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'DKK'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'HKD'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'NOK'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'NZD'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'SEK'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'SGD'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'ZAR'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'AED'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'BRL'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'INR'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'MXN'`.execute(pg)
  await sql`ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'THB'`.execute(pg)
}

export async function down(db: Kysely<any>) {
  // PostgreSQL doesn't support removing enum values
}
