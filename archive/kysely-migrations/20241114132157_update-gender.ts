import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()

  // First, drop any constraints using the enum for both tables
  await sql`ALTER TABLE "Category" ALTER COLUMN "gender" DROP DEFAULT`.execute(pg)
  await sql`ALTER TABLE "Category" ALTER COLUMN "gender" TYPE text`.execute(pg)
  await sql`ALTER TABLE "Competition" ALTER COLUMN "gender" DROP DEFAULT`.execute(pg)
  await sql`ALTER TABLE "Competition" ALTER COLUMN "gender" TYPE text`.execute(pg)

  // Drop and recreate the enum with new values
  await sql`DROP TYPE IF EXISTS "Gender"`.execute(pg)
  await sql`CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'MIXED')`.execute(pg)

  // Convert columns back to enum type
  await sql`ALTER TABLE "Category" ALTER COLUMN "gender" TYPE "Gender" USING gender::"Gender" `.execute(
    pg,
  )
  await sql`ALTER TABLE "Competition" ALTER COLUMN "gender" TYPE "Gender" USING gender::"Gender"`.execute(
    pg,
  )
}

export async function down(db: Kysely<any>) {}
