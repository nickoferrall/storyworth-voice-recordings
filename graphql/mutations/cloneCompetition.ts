import { extendType, nonNull, stringArg } from 'nexus'
import { nanoid } from 'nanoid'
import getKysely from '../../src/db'
import { v4 as uuidv4 } from 'uuid'
import { updateSubsequentHeatTimes } from '../../utils/updateSubsequentHeatTimes'

export const CloneCompetitionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('cloneCompetition', {
      type: 'Competition',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
          throw new Error('You must be logged in to clone a competition')
        }

        const pg = getKysely()

        try {
          return await pg.transaction().execute(async (trx) => {
            const originalCompetition = await trx
              .selectFrom('Competition')
              .where('id', '=', id)
              .selectAll()
              .executeTakeFirstOrThrow()

            // Clone the address if it exists
            let newAddressId = null
            if (originalCompetition.addressId) {
              const originalAddress = await trx
                .selectFrom('Address')
                .where('id', '=', originalCompetition.addressId)
                .selectAll()
                .executeTakeFirst()

              if (originalAddress) {
                const clonedAddress = {
                  ...originalAddress,
                  id: uuidv4(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }

                await trx.insertInto('Address').values(clonedAddress).execute()
                newAddressId = clonedAddress.id
              }
            }

            const clonedCompetition = {
              ...originalCompetition,
              id: nanoid(6),
              name: `${originalCompetition.name} (Clone)`,
              addressId: newAddressId,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdByUserId: ctx.user!.id,
            }

            const newComp = await trx
              .insertInto('Competition')
              .values(clonedCompetition)
              .returningAll()
              .executeTakeFirstOrThrow()

            // Insert record into CompetitionCreator to link user to the competition
            await trx
              .insertInto('CompetitionCreator')
              .values({
                competitionId: newComp.id,
                userId: ctx.user!.id,
              })
              .execute()

            // Clone TicketTypes
            const originalTicketTypes = await trx
              .selectFrom('TicketType')
              .where('competitionId', '=', id)
              .selectAll()
              .execute()

            const clonedTicketTypes = originalTicketTypes.map((tt) => ({
              ...tt,
              id: uuidv4(),
              competitionId: newComp.id,
              // Clear Stripe IDs to force creation of new unique ones
              stripePriceId: null as string | null,
              stripeProductId: null as string | null,
            }))

            await trx.insertInto('TicketType').values(clonedTicketTypes).execute()

            // Clone Workouts
            const originalWorkouts = await trx
              .selectFrom('Workout')
              .where('competitionId', '=', id)
              .selectAll()
              .execute()

            const clonedWorkouts = originalWorkouts.map((w) => ({
              ...w,
              id: uuidv4(),
              competitionId: newComp.id,
            }))

            await trx.insertInto('Workout').values(clonedWorkouts).execute()

            // Clone ScoreSetting
            let clonedScoreSetting = null
            const originalScoreSetting = await trx
              .selectFrom('ScoreSetting')
              .where('competitionId', '=', id)
              .selectAll()
              .executeTakeFirst()

            if (originalScoreSetting) {
              clonedScoreSetting = {
                ...originalScoreSetting,
                id: uuidv4(),
                competitionId: newComp.id,
                ticketTypeOrderIds: clonedTicketTypes.map((tt) => tt.id),
                heatsEveryXMinutes: originalScoreSetting.heatsEveryXMinutes ?? 15,
              }
            } else {
              // Create a default ScoreSetting if the original doesn't have one
              clonedScoreSetting = {
                id: uuidv4(),
                competitionId: newComp.id,
                ticketTypeOrderIds: clonedTicketTypes.map((tt) => tt.id),
                heatsEveryXMinutes: 15,
                penalizeIncomplete: true,
                penalizeScaled: true,
                handleTie: 'BEST_OVERALL_FINISH',
                scoring: 'POINTS_PER_PLACE',
                heatLimitType: 'ATHLETES',
                maxLimitPerHeat: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            }

            if (clonedScoreSetting) {
              console.log('🔍 Inserting ScoreSetting:', clonedScoreSetting)
              await trx.insertInto('ScoreSetting').values(clonedScoreSetting).execute()
              console.log('✅ ScoreSetting inserted successfully')
            } else {
              console.log('❌ No ScoreSetting to insert')
            }

            // Clone Heats
            const originalHeats = await trx
              .selectFrom('Heat')
              .where(
                'workoutId',
                'in',
                originalWorkouts.map((w) => w.id),
              )
              .selectAll()
              .execute()

            const clonedHeats = originalHeats
              .map((h) => {
                const workoutId = clonedWorkouts.find(
                  (w) =>
                    w.name === originalWorkouts.find((ow) => ow.id === h.workoutId)?.name,
                )?.id

                if (!workoutId) return null

                return {
                  ...h,
                  id: uuidv4(),
                  workoutId,
                }
              })
              .filter((heat): heat is NonNullable<typeof heat> => heat !== null)

            if (clonedHeats.length > 0) {
              const insertedHeats = await trx
                .insertInto('Heat')
                .values(clonedHeats)
                .returningAll()
                .execute()

              // Insert records into the HeatTicketTypes joiner table
              for (const heat of insertedHeats) {
                const heatTicketTypeValues = clonedTicketTypes.map((ticketType) => ({
                  heatId: heat.id,
                  ticketTypeId: ticketType.id,
                }))
                await trx
                  .insertInto('HeatTicketTypes')
                  .values(heatTicketTypeValues)
                  .execute()
              }

              // Only call updateSubsequentHeatTimes if ScoreSetting was cloned
              if (clonedScoreSetting) {
                console.log(
                  '🔍 About to call updateSubsequentHeatTimes for competition:',
                  newComp.id,
                )
                await updateSubsequentHeatTimes(
                  newComp.id,
                  newComp.startDateTime,
                  ctx,
                  trx,
                )
                console.log('✅ updateSubsequentHeatTimes completed successfully')
              }
            }

            // Clone RegistrationFields and their associations
            const originalRegistrationFields = await trx
              .selectFrom('RegistrationField as rf')
              .innerJoin(
                'RegistrationFieldTicketTypes as rftt',
                'rf.id',
                'rftt.registrationFieldId',
              )
              .innerJoin('TicketType as tt', 'rftt.ticketTypeId', 'tt.id')
              .where('tt.competitionId', '=', id)
              .selectAll('rf')
              .select(['tt.id as ttId'])
              .execute()

            const clonedRegistrationFields = originalRegistrationFields.reduce<
              Record<string, any>
            >((acc, field) => {
              if (!acc[field.id]) {
                acc[field.id] = {
                  ...field,
                  id: uuidv4(),
                  ticketTypeIds: [],
                }
              }
              acc[field.id].ticketTypeIds.push(field.ttId)
              return acc
            }, {})

            for (const field of Object.values(clonedRegistrationFields)) {
              const { id, ticketTypeIds, rfId, ttId, ...fieldData } = field

              // Insert the new RegistrationField and get the new ID
              const newRegistrationField = await trx
                .insertInto('RegistrationField')
                .values(fieldData)
                .returningAll()
                .executeTakeFirstOrThrow()

              const clonedTicketTypeIds = ticketTypeIds
                .map(
                  (origTtId: string) =>
                    clonedTicketTypes.find(
                      (ctt) =>
                        ctt.name ===
                        originalTicketTypes.find((ott) => ott.id === origTtId)?.name,
                    )?.id,
                )
                .filter(Boolean)

              for (const clonedTtId of clonedTicketTypeIds) {
                await trx
                  .insertInto('RegistrationFieldTicketTypes')
                  .values({
                    registrationFieldId: newRegistrationField.id, // Use the new ID here
                    ticketTypeId: clonedTtId,
                  })
                  .execute()
              }
            }

            if (!newComp) return null
            if (newComp.addressId === null) newComp.addressId = ''
            return newComp
          })
        } catch (error) {
          console.error('Error cloning competition:', error)
          throw new Error('Failed to clone competition')
        }
      },
    })
  },
})
