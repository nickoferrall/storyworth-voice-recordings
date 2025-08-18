import DataLoader from 'dataloader'
import { Kysely } from 'kysely'
import { DB } from '../../src/generated/database'
import { Context } from '../../graphql/context'

export const createEntryLoaders = (pg: Kysely<DB>, ctx: Context) => ({
  entryLoader: new DataLoader(async (keys) => {
    const entries = await pg
      .selectFrom('Entry')
      .where('id', 'in', keys as string[])
      .selectAll()
      .execute()

    return keys.map((key) => entries.find((entry) => entry.id === key))
  }),
  entriesByCompetitionIdLoader: new DataLoader(async (keys: readonly string[]) => {
    // Fix: Batch all competition IDs into a single query
    const entries = await pg
      .selectFrom('Entry as e')
      .innerJoin('TicketType as tt', 'e.ticketTypeId', 'tt.id')
      .where('tt.competitionId', 'in', keys) // Single query with all keys
      .selectAll('e')
      .select('tt.competitionId')
      .execute()

    // Group entries by competition ID
    return keys.map((competitionId) =>
      entries.filter((entry) => entry.competitionId === competitionId),
    )
  }),
  entriesByCompetitionIdAndTicketTypeIdLoader: new DataLoader(
    async (keys: readonly { competitionId: string; ticketTypeId: string }[]) => {
      // Fix: Batch all keys into a single query
      const competitionIds = keys.map((k) => k.competitionId)
      const ticketTypeIds = keys.map((k) => k.ticketTypeId)

      const entries = await pg
        .selectFrom('Entry as e')
        .innerJoin('TicketType as tt', 'e.ticketTypeId', 'tt.id')
        .where('tt.competitionId', 'in', competitionIds)
        .where('e.ticketTypeId', 'in', ticketTypeIds)
        .selectAll('e')
        .select('tt.competitionId')
        .execute()

      // Group entries by the specific key combination
      return keys.map(({ competitionId, ticketTypeId }) =>
        entries.filter(
          (entry) =>
            entry.competitionId === competitionId && entry.ticketTypeId === ticketTypeId,
        ),
      )
    },
  ),
  entryByTicketTypeIdLoader: new DataLoader(async (keys: readonly string[]) => {
    const entries = await pg
      .selectFrom('Entry')
      .where('ticketTypeId', 'in', keys)
      .selectAll()
      .execute()

    return keys.map((key) => entries.filter((entry) => entry.ticketTypeId === key))
  }),
})
