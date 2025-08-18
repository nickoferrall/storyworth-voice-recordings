import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()

  // Update records where website contains instagram.com
  await pg
    .updateTable('DirectoryComp')
    .set({
      website: sql`CASE 
        WHEN website LIKE '%instagram.com/%' 
        THEN NULL
        ELSE website 
      END`,
    })
    .execute()
}

export async function down(db: Kysely<any>) {
  // This migration is not reversible since we're cleaning data
  // We can't reliably reconstruct the original website URLs
  return
}
