import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  await pg
    .updateTable('Heat')
    .set({
      ticketTypeIds: sql`ARRAY["ticketTypeId"]::uuid[]`,
    })
    .where('ticketTypeId', 'is not', null)
    .execute()

  // Verify the update
  const result = await pg
    .selectFrom('Heat')
    .selectAll()
    .where('ticketTypeIds', 'is not', null)
    .limit(2)
    .execute()

  result.forEach((row) => {
    console.log(`ID: ${row.id}, ticketTypeIds: ${JSON.stringify(row.ticketTypeIds)}`)
  })
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  await pg
    .updateTable('Heat')
    .set({
      ticketTypeIds: null,
    })
    .where('ticketTypeIds', 'is not', null)
    .execute()
}
