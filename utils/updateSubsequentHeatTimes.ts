import dayjs from 'dayjs'
import getKysely from '../src/db'
import { Context } from '../graphql/context'
import { Kysely } from 'kysely'
import { DB } from '../src/generated/database'

export const updateSubsequentHeatTimes = async (
  competitionId: string,
  newHeatStartTime: Date,
  ctx: Context,
  trx?: Kysely<DB>,
) => {
  const pg = trx || getKysely()

  const heatsToUpdate = await pg
    .selectFrom('Heat')
    .innerJoin('Workout', 'Heat.workoutId', 'Workout.id')
    .select(['Heat.id', 'Heat.startTime'])
    .where('Workout.competitionId', '=', competitionId)
    .orderBy('Heat.startTime', 'asc')
    .execute()

  const scoreSetting = await pg
    .selectFrom('ScoreSetting')
    .where('competitionId', '=', competitionId)
    .selectAll()
    .executeTakeFirst()

  if (!scoreSetting) {
    throw new Error('ScoreSetting not found for competition')
  }

  for (const [index, heat] of heatsToUpdate.entries()) {
    const newStartTime = dayjs(newHeatStartTime)
      .add(index * scoreSetting.heatsEveryXMinutes, 'minutes')
      .toDate()

    await pg
      .updateTable('Heat')
      .set({ startTime: newStartTime })
      .where('id', '=', heat.id)
      .execute()
  }
}
