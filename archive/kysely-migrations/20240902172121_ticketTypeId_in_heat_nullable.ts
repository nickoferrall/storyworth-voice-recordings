import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()
  await pg.schema
    .alterTable('Heat')
    .alterColumn('ticketTypeId', (col) => col.dropNotNull())
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()
  await pg.schema
    .alterTable('Heat')
    .alterColumn('ticketTypeId', (col) => col.setNotNull())
    .execute()
}
