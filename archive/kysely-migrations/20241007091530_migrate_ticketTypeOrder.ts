import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Update the column with default values
  const competitions = await pg
    .selectFrom('ScoreSetting')
    .select('competitionId')
    .execute()

  for (const { competitionId } of competitions) {
    const ticketTypeIds = await pg
      .selectFrom('TicketType')
      .select('id')
      .where('competitionId', '=', competitionId)
      .where('isVolunteer', '=', false)
      .orderBy('createdAt', 'asc')
      .execute()

    await pg
      .updateTable('ScoreSetting')
      .set({
        ticketTypeOrderIds: ticketTypeIds.map((tt) => tt.id),
      })
      .where('competitionId', '=', competitionId)
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  //noop
}
