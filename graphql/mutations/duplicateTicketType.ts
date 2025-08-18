import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { createStripeProductAndPrice } from '../../utils/createStripeProductAndPrice'
import { Currency as GqlCurrency } from '../../src/generated/graphql'
import { reuseRegistrationFields } from './helpers/reuseRegistrationFields'

export const DuplicateTicketType = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('duplicateTicketType', {
      type: 'TicketType',
      args: {
        originalId: nonNull(stringArg()),
      },
      resolve: async (_parent, { originalId }, ctx) => {
        const pg = getKysely()

        return await pg.transaction().execute(async (trx) => {
          const original = await trx
            .selectFrom('TicketType')
            .where('id', '=', originalId)
            .selectAll()
            .executeTakeFirst()

          if (!original) {
            throw new Error('Original TicketType not found')
          }

          const name = `${original.name} (Copy)`

          let stripeProductId: string | null = null
          let stripePriceId: string | null = null

          const inserted = await trx
            .insertInto('TicketType')
            .values({
              name,
              description: original.description,
              maxEntries: original.maxEntries,
              teamSize: original.teamSize,
              price: original.price,
              currency: original.currency,
              isVolunteer: original.isVolunteer,
              competitionId: original.competitionId,
              allowHeatSelection: original.allowHeatSelection,
              stripeProductId: null,
              stripePriceId: null,
              passOnPlatformFee: original.passOnPlatformFee,
              divisionScoreType: original.divisionScoreType,
              refundPolicy: original.refundPolicy ?? null,
              earlyBirdId: null,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          if (inserted.price > 0) {
            try {
              const { productId, priceId } = await createStripeProductAndPrice({
                name,
                amount: inserted.price,
                currency:
                  (inserted.currency as unknown as GqlCurrency) ?? GqlCurrency.Gbp,
              })
              stripeProductId = productId
              stripePriceId = priceId

              await trx
                .updateTable('TicketType')
                .set({ stripeProductId, stripePriceId })
                .where('id', '=', inserted.id)
                .execute()
            } catch (_) {
              // Leave Stripe fields null if creation fails
            }
          }

          const currentScoreSetting = await trx
            .selectFrom('ScoreSetting')
            .where('competitionId', '=', inserted.competitionId)
            .selectAll()
            .executeTakeFirst()

          if (currentScoreSetting) {
            const updatedOrderIds = [
              ...(currentScoreSetting.ticketTypeOrderIds || []),
              inserted.id,
            ]
            await trx
              .updateTable('ScoreSetting')
              .where('competitionId', '=', inserted.competitionId)
              .set({ ticketTypeOrderIds: updatedOrderIds })
              .execute()
          }

          await reuseRegistrationFields(
            trx,
            inserted.id,
            inserted.competitionId,
            inserted.isVolunteer,
          )

          const final = await trx
            .selectFrom('TicketType')
            .where('id', '=', inserted.id)
            .selectAll()
            .executeTakeFirstOrThrow()

          return final as any
        })
      },
    })
  },
})
