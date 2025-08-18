import { extendType, nonNull, arg, inputObjectType } from 'nexus'
import { Currency, EarlyBirdInput, TicketType } from '../types'
import getKysely from '../../src/db'
import { reuseRegistrationFields } from './helpers/reuseRegistrationFields'
import { Currency as TCurrency } from '../../src/generated/graphql'
import { createStripeProductAndPrice } from '../../utils/createStripeProductAndPrice'
import { sql } from 'kysely'

export const TicketTypeInput = inputObjectType({
  name: 'TicketTypeInput',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.string('description')
    t.nonNull.int('maxEntries')
    t.nonNull.int('teamSize')
    t.nonNull.float('price')
    t.nonNull.field('currency', { type: Currency })
    t.boolean('isVolunteer')
    t.nonNull.string('competitionId')
    t.boolean('allowHeatSelection')
    t.field('earlyBird', { type: EarlyBirdInput })
  },
})

export const CreateEarlyBirdInput = inputObjectType({
  name: 'CreateEarlyBirdInput',
  definition(t) {
    t.field('startDateTime', { type: 'DateTime' })
    t.field('endDateTime', { type: 'DateTime' })
    t.float('price')
    t.int('limit')
  },
})

export const CreateTicketTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createTicketType', {
      type: TicketType,
      args: {
        input: nonNull(arg({ type: TicketTypeInput })),
      },
      resolve: async (_parent, { input }, ctx) => {
        const {
          name,
          description,
          maxEntries,
          teamSize,
          price,
          currency,
          isVolunteer,
          competitionId,
          allowHeatSelection,
        } = input

        const pg = getKysely()

        try {
          return await pg.transaction().execute(async (trx) => {
            let stripeProductId: string | null = null
            let stripePriceId: string | null = null
            if (price > 0) {
              const { productId, priceId } = await createStripeProductAndPrice({
                name,
                amount: price,
                currency: TCurrency.Gbp,
              })
              stripeProductId = productId
              stripePriceId = priceId
            }

            const ticketType = await pg
              .insertInto('TicketType')
              .values({
                name,
                description,
                isVolunteer: isVolunteer ?? false,
                maxEntries,
                price,
                teamSize,
                currency,
                competitionId,
                stripePriceId,
                stripeProductId,
                allowHeatSelection: allowHeatSelection ?? false,
              })
              .returningAll()
              .executeTakeFirstOrThrow()

            // Fetch the current ScoreSetting
            const currentScoreSetting = await pg
              .selectFrom('ScoreSetting')
              .where('competitionId', '=', competitionId)
              .selectAll()
              .executeTakeFirstOrThrow()

            // Update the ticketTypeOrderIds array
            const updatedOrderIds = [
              ...(currentScoreSetting.ticketTypeOrderIds || []),
              ticketType.id,
            ]

            // Update the ScoreSetting with the new array
            await pg
              .updateTable('ScoreSetting')
              .where('competitionId', '=', competitionId)
              .set({
                ticketTypeOrderIds: updatedOrderIds,
              })
              .returningAll()
              .executeTakeFirstOrThrow()

            // Call adjustHeatsForTicketType to ensure heat creation logic aligns with the update logic
            //   await adjustHeatsForTicketType({
            //     competitionId,
            //     ticketTypeId: ticketType.id,
            //     maxEntries,
            //     ctx,
            //   })
            // }

            // Handle EarlyBird Pricing
            // if (earlyBird) {
            //   const newEarlyBird = await pg
            //     .insertInto('EarlyBird')
            //     .values({
            //       startDateTime: earlyBird.startDateTime,
            //       endDateTime: earlyBird.endDateTime,
            //       price: earlyBird.price ?? 0,
            //       limit: earlyBird.limit,
            //       ticketTypeId: ticketType.id,
            //     })
            //     .returningAll()
            //     .executeTakeFirstOrThrow()

            //   await pg
            //     .updateTable('TicketType')
            //     .set({
            //       earlyBirdId: newEarlyBird.id,
            //     })
            //     .where('id', '=', ticketType.id)
            //     .execute()
            // }

            // await reuseRegistrationFields(
            //   ticketType.id,
            //   competitionId,
            //   ticketType.isVolunteer,
            // )
            await reuseRegistrationFields(
              trx,
              ticketType.id,
              competitionId,
              ticketType.isVolunteer,
            )

            return ticketType as any
          })
        } catch (error: any) {
          console.error('Error during TicketType creation:', error)
          throw new Error('Error creating TicketType')
        }
      },
    })
  },
})
