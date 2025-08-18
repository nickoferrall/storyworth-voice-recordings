import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()

  // First add the new columns
  await pg.schema
    .alterTable('DirectoryComp')
    .addColumn('ticketWebsite', 'text')
    // .addColumn('ctaLink', 'text')
    .execute()

  // Move existing website values to ctaLink
  await pg
    .updateTable('DirectoryComp')
    .set({
      ctaLink: sql`website`,
    })
    .execute()

  // Now we can safely modify the website column since its data has been preserved
  // No need to drop and recreate since we're keeping the same type
}

export async function down(db: Kysely<any>) {
  const pg = getKysely()

  // // Move ctaLink back to website
  // await pg
  //   .updateTable('DirectoryComp')
  //   .set({
  //     website: sql`ctaLink`,
  //   })
  //   .execute()

  // Remove the new columns
  // await pg.schema.alterTable('DirectoryComp').dropColumn('ticketWebsite').execute()
}
