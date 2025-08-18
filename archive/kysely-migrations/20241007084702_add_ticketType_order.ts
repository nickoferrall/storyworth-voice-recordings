import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  await pg.schema
    .alterTable('ScoreSetting')
    .addColumn('ticketTypeOrderIds', sql`uuid[]`, (col) =>
      col.notNull().defaultTo(sql`'{}'::uuid[]`),
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  await pg.schema.alterTable('ScoreSetting').dropColumn('ticketTypeOrderIds').execute()
}
