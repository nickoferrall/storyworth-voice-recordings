import { extendType, idArg, nonNull, arg, inputObjectType } from 'nexus'
import StripeManager from '../../lib/stripeManager'
import getKysely from '../../src/db'
import { Currency } from '../../src/generated/graphql'
import getRedis from '../../utils/getRedis' // Import the Redis utility

export const CreatePaymentLinkInput = inputObjectType({
  name: 'CreatePaymentLinkInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.string('email')
    t.nonNull.string('ticketTypeId')
    t.nullable.string('invitationToken')
    t.string('selectedHeatId')
    t.string('redirectTo')
    t.nonNull.list.field('answers', { type: nonNull('RegistrationAnswerInput') })
  },
})

export const CreatePaymentLinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createPaymentLink', {
      type: 'String',
      args: {
        input: nonNull(
          arg({
            type: CreatePaymentLinkInput,
          }),
        ),
      },
      resolve: async (_parent, { input }, ctx) => {
        const stripeManager = new StripeManager()
        const pg = getKysely()
        const redis = getRedis() // Get Redis client
        const { ticketTypeId } = input

        // Fetch the ticket type to get the price and currency
        const ticketType = await pg
          .selectFrom('TicketType')
          .selectAll()
          .where('id', '=', ticketTypeId)
          .executeTakeFirstOrThrow()

        if (!ticketType) {
          throw new Error('Ticket type not found')
        }

        // Check if a Price ID exists, otherwise create one dynamically
        let priceId = ticketType.stripePriceId // Assuming you store Price ID in DB

        if (!priceId) {
          const newPrice = await stripeManager.createPrice(
            ticketType.price * 100, // Price in cents
            ticketType.currency as Currency, // Currency (e.g., 'usd')
            ticketType.name, // Product name
          )

          // Save the new price ID to the database
          await pg
            .updateTable('TicketType')
            .set({
              stripePriceId: newPrice.id,
            })
            .where('id', '=', ticketTypeId)
            .execute()

          priceId = newPrice.id
        }

        // Prepare the metadata (only include essential, non-sensitive data)
        const stripeMetadata = {
          name: input.name,
          ticketTypeId: input.ticketTypeId,
          invitationToken: input.invitationToken || '',
          selectedHeatId: input.selectedHeatId || '',
        }

        // Create the checkout session with error logging
        let url, sessionId
        try {
          const result = await stripeManager.createCheckoutSession(
            [{ price: priceId, quantity: 1 }],
            input.email,
          )
          url = result.url
          sessionId = result.sessionId

          // Log successful payment link creation
          console.log(
            `✅ Payment link created successfully for ${input.email}, competition: ${ticketType.competitionId}, priceId: ${priceId}`,
          )
        } catch (stripeError: any) {
          // Log detailed Stripe error information
          console.error(`❌ Stripe checkout session creation failed:`, {
            error: stripeError.message,
            priceId,
            ticketTypeId,
            competitionId: ticketType.competitionId,
            userEmail: input.email,
            stripePriceId: ticketType.stripePriceId,
          })

          // Re-throw with more context
          throw new Error(
            `Payment setup failed: ${stripeError.message}. Please contact support if this persists.`,
          )
        }

        const fullMetadata = {
          ...stripeMetadata,
          email: input.email,
          answers: input.answers,
          redirectTo: input.redirectTo,
        }
        await redis.set(
          `checkout:${sessionId}`,
          JSON.stringify(fullMetadata),
          'EX',
          86400,
        ) // Expire in 1 day

        return url
      },
    })
  },
})
