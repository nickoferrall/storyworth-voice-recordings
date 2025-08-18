import { extendType, nonNull, arg, inputObjectType } from 'nexus'
import getKysely from '../../src/db'
import { TicketType, Currency, EarlyBirdInput } from '../types'
import { adjustHeatsForTicketType } from './helpers/adjustHeatsForTicketType'
import { Currency as TCurrency } from '../../src/generated/graphql'
import { createStripeProductAndPrice } from '../../utils/createStripeProductAndPrice'

export const UpdateTicketTypeInput = inputObjectType({
  name: 'UpdateTicketTypeInput',
  definition(t) {
    t.nonNull.string('id')
    t.string('name')
    t.string('description')
    t.int('maxEntries')
    t.int('teamSize')
    t.float('price')
    t.field('currency', { type: Currency })
    t.boolean('isVolunteer')
    t.nonNull.string('competitionId')
    t.boolean('allowHeatSelection')
    t.field('earlyBird', { type: EarlyBirdInput })
  },
})

export const UpdateTicketTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateTicketType', {
      type: TicketType,
      args: {
        input: nonNull(arg({ type: UpdateTicketTypeInput })),
      },
      resolve: async (_parent, args, ctx) => {
        const { input } = args
        const {
          id,
          name,
          description,
          maxEntries,
          teamSize,
          price,
          currency,
          isVolunteer,
          competitionId,
          allowHeatSelection,
          earlyBird,
        } = input

        const pg = getKysely()

        try {
          // Fetch the current ticket type to compare with the new input
          const currentTicketType = await pg
            .selectFrom('TicketType')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirstOrThrow()

          let earlyBirdId = null

          if (earlyBird) {
            const earlyBirdRes = await pg
              .insertInto('EarlyBird')
              .values({
                price: earlyBird.price ?? 0,
                ticketTypeId: id,
                startDateTime: earlyBird.startDateTime ?? undefined,
                endDateTime: earlyBird.endDateTime ?? undefined,
                limit: earlyBird.limit ?? undefined,
              })
              .onConflict((oc) =>
                oc.columns(['ticketTypeId']).doUpdateSet({
                  price: earlyBird.price ?? 0,
                  startDateTime: earlyBird.startDateTime ?? undefined,
                  endDateTime: earlyBird.endDateTime ?? undefined,
                  limit: earlyBird.limit ?? undefined,
                }),
              )
              .returning('id')
              .executeTakeFirstOrThrow()

            earlyBirdId = earlyBirdRes.id
          }

          let stripePriceId = currentTicketType.stripePriceId
          let stripeProductId = currentTicketType.stripeProductId
          if (
            (price && price !== currentTicketType.price) ||
            (currency && currency !== currentTicketType.currency) ||
            (name && name !== currentTicketType.name)
          ) {
            const { productId, priceId } = await createStripeProductAndPrice({
              name: name ?? currentTicketType.name,
              amount: price ?? currentTicketType.price,
              currency: (currency as TCurrency) ?? TCurrency.Gbp,
            })
            stripePriceId = priceId
            stripeProductId = productId
          }

          const updatedTicketType = await pg
            .updateTable('TicketType')
            .set({
              name: name ?? undefined,
              description: description ?? undefined,
              maxEntries: maxEntries ?? undefined,
              teamSize: teamSize ?? undefined,
              price: price ?? undefined,
              currency: currency ?? undefined,
              isVolunteer: isVolunteer ?? undefined,
              allowHeatSelection: allowHeatSelection ?? undefined,
              stripePriceId,
              stripeProductId,
              earlyBirdId: earlyBirdId ?? undefined,
            })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          // Only adjust heats if maxEntries or maxLimitPerHeat has changed
          const maxEntriesChanged = currentTicketType.maxEntries !== maxEntries

          if (allowHeatSelection && maxEntries && maxEntriesChanged) {
            // TODO: can this be removed?
            await adjustHeatsForTicketType({
              competitionId,
              ticketTypeId: updatedTicketType.id,
              maxEntries,
              ctx,
            })
          }

          return updatedTicketType as any
        } catch (error: any) {
          console.error('Error during TicketType update:', error)
          throw new Error(error)
        }
      },
    })
  },
})
