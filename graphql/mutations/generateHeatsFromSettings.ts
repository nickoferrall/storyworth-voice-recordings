import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { extendType, nonNull, stringArg, inputObjectType, arg } from 'nexus'
import getKysely from '../../src/db'
import { UpdateObject } from 'kysely'
import { HeatLimitType } from '../types'
import { generateHeats } from './helpers/generateHeats'
import { createNewLanes } from './helpers/createNewLanes'
import { DB } from '../../src/generated/database'

dayjs.extend(utc)
dayjs.extend(timezone)

export const GenerateHeatsInput = inputObjectType({
  name: 'GenerateHeatsInput',
  definition(t) {
    t.boolean('oneTicketPerHeat')
    t.field('firstHeatStartTime', { type: 'DateTime' })
    t.int('heatsEveryXMinutes')
    t.int('lanes')
    t.int('totalHeatsPerWorkout')
    t.int('maxLimitPerHeat')
    t.field('heatLimitType', { type: HeatLimitType })
    t.list.nonNull.string('ticketTypeOrderIds')
  },
})

export const GenerateHeatsFromSettings = extendType({
  type: 'Mutation',
  definition(t) {
    t.list.nonNull.field('generateHeatsFromSettings', {
      type: 'Heat',
      args: {
        competitionId: nonNull(stringArg()),
        input: nonNull(arg({ type: GenerateHeatsInput })),
      },
      resolve: async (_parent, { competitionId, input }, ctx) => {
        const pg = getKysely()

        return await pg.transaction().execute(async (trx) => {
          try {
            const competition = await ctx.loaders.competitionLoader.load(competitionId)
            if (!competition || !competition.timezone) {
              throw new Error('Competition not found or timezone not set')
            }

            const { firstHeatStartTime, ...restInput } = input
            const validInput = Object.fromEntries(
              Object.entries(restInput).filter(([_, v]) => v != null),
            ) as UpdateObject<DB, 'ScoreSetting', 'ScoreSetting'>

            const updatedScoreSetting = await pg
              .updateTable('ScoreSetting')
              .set(validInput)
              .where('competitionId', '=', competitionId)
              .returningAll()
              .executeTakeFirstOrThrow()

            const workouts =
              await ctx.loaders.workoutsByCompetitionIdLoader.load(competitionId)

            // Fetch ticket types
            const ticketTypes = await pg
              .selectFrom('TicketType')
              .selectAll()
              .where('competitionId', '=', competitionId)
              .where('isVolunteer', '=', false)
              .execute()

            // Fetch entry counts
            const entryCounts = await trx
              .selectFrom('Entry')
              .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
              .select(['Entry.ticketTypeId', trx.fn.count('Entry.id').as('count')])
              .where('TicketType.competitionId', '=', competitionId)
              .groupBy('Entry.ticketTypeId')
              .execute()
              .then((results) =>
                results.reduce(
                  (acc, { ticketTypeId, count }) => {
                    acc[ticketTypeId] = Number(count)
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              )

            // Fetch all entries for the competition
            const allEntries = await trx
              .selectFrom('Entry')
              .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
              .select([
                'Entry.id as entryId',
                'Entry.ticketTypeId',
                'TicketType.teamSize',
              ])
              .where('TicketType.competitionId', '=', competitionId)
              .execute()

            const oldHeats = await trx
              .selectFrom('Heat')
              .where(
                'workoutId',
                'in',
                workouts.map((w: any) => w.id),
              )
              .select('id')
              .execute()

            // Delete old lanes and heats before creating new ones
            await trx
              .deleteFrom('Lane')
              .where(
                'heatId',
                'in',
                oldHeats.map((heat) => heat.id),
              )
              .execute()

            await trx
              .deleteFrom('Heat')
              .where(
                'id',
                'in',
                oldHeats.map((heat) => heat.id),
              )
              .execute()

            const startTime = firstHeatStartTime ?? competition.startDateTime
            // Generate new heats
            const totalHeatsPerWorkout = input.totalHeatsPerWorkout
              ? Math.min(input.totalHeatsPerWorkout, 100)
              : null
            const { heats, heatTicketTypes } = await generateHeats(
              workouts,
              ticketTypes,
              updatedScoreSetting,
              competition,
              startTime,
              entryCounts,
              input.ticketTypeOrderIds as string[],
              trx,
            )
            console.log('New heats:', heats)

            // Insert the new Heat records
            const insertedHeats = await trx
              .insertInto('Heat')
              .values(heats)
              .returningAll()
              .execute()

            // Insert the HeatTicketTypes joiner records
            await trx.insertInto('HeatTicketTypes').values(heatTicketTypes).execute()

            // Create new lanes based on all entries and new heats
            const newLanesResult = await createNewLanes(
              trx,
              allEntries,
              insertedHeats,
              updatedScoreSetting,
              workouts,
              input.ticketTypeOrderIds as string[],
            )

            if (!newLanesResult.success) {
              throw new Error(newLanesResult.error)
            }

            return insertedHeats
          } catch (error: any) {
            console.error('Error generating heats:', error)
            throw new Error(`Unable to generate heats: ${error.message}`)
          }
        })
      },
    })
  },
})
