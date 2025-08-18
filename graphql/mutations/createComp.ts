import { arg, objectType } from 'nexus'
import { nanoid } from 'nanoid'
import { Competition } from '../types/Competition'
import { extendType, nonNull, stringArg } from 'nexus'
import { Currency } from '../../src/generated/graphql'
import StripeManager from '../../lib/stripeManager'
import { createRegistrationFields } from './helpers/createRegistrationFields'
import getKysely from '../../src/db'
import { exampleRefundPolicy } from '../../utils/constants'
import { createHeats } from './helpers/createExampleHeats'
import { getWorkoutsToInsert } from './helpers/getWorkoutsToInsert'
import MailgunManager from '../../lib/MailgunManager'

export const CompetitionPayload = objectType({
  name: 'CompetitionPayload',
  definition(t) {
    t.field('competition', { type: Competition })
    t.string('message')
  },
})

export const CreateCompetitionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createComp', {
      type: CompetitionPayload,
      args: {
        name: nonNull(stringArg()),
        startDateTime: nonNull(arg({ type: 'DateTime' })),
        endDateTime: nonNull(arg({ type: 'DateTime' })),
        numberOfWorkouts: nonNull(arg({ type: 'Int' })),
        timezone: stringArg(),
        orgName: stringArg(),
      },
      resolve: async (
        _parent,
        { name, startDateTime, endDateTime, numberOfWorkouts, timezone, orgName },
        ctx,
      ) => {
        try {
          const pg = getKysely()
          const stripeManager = new StripeManager()

          const address = await pg
            .insertInto('Address')
            .values({
              venue: 'Example Venue',
              street: 'Example Street',
              city: 'Example City',
              postcode: 'EX4 MPL',
              country: 'United Kingdom',
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          const [competition, stripeProduct, org] = await Promise.all([
            pg
              .insertInto('Competition')
              .values({
                id: nanoid(6),
                name,
                startDateTime,
                endDateTime,
                createdByUserId: ctx.user?.id ?? '',
                addressId: address.id,
                timezone: timezone ?? 'UTC',
                orgName: orgName ?? 'Example Org',
                logo: 'https://res.cloudinary.com/dkeppgndn/image/upload/v1722856988/org_images/r3VomDmdG9o62fJd6KeXp1_1722856988012.jpg',
                description:
                  'This is where the description of your competition will show up',
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
            stripeManager.createProduct('Mixed RX Pairs Example'),
            pg
              .insertInto('Org')
              .values({
                name: orgName ?? 'Example Org',
                email: ctx.user?.email ?? '',
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
          ])

          const stripePrice = await stripeManager.createPrice(
            200 * 100,
            Currency.Gbp,
            stripeProduct.id,
          )

          const workoutsToInsert = getWorkoutsToInsert(
            numberOfWorkouts,
            competition.id,
            new Date(startDateTime as any),
          )

          const [ticketTypes, workouts] = await Promise.all([
            pg
              .insertInto('TicketType')
              .values([
                {
                  name: 'Mixed RX Pairs Example',
                  description: `Athletes should be able to do:
                  - Double unders
                  - Kettlebell swings 24kg (M) / 16kg (F)
                  - Jerk 80kg (M) / 60kg (F)
                  - Clean 90kg (M) / 70kg (F)
                  - Snatch 70kg (M) / 50kg (F)
                  - Deadlift 120kg (M) / 100kg (F)`,
                  maxEntries: 50,
                  price: 200,
                  teamSize: 2,
                  currency: Currency.Gbp,
                  competitionId: competition.id,
                  stripePriceId: stripePrice.id,
                  stripeProductId: stripeProduct.id,
                  refundPolicy: exampleRefundPolicy,
                  passOnPlatformFee: false,
                  isVolunteer: false,
                },
                {
                  name: 'Volunteer',
                  description: `Volunteer: Help with setup and teardown, manage registration, assist with athlete check-ins, guide spectators, and provide general event support.`,
                  maxEntries: 50,
                  price: 0,
                  teamSize: 1,
                  currency: Currency.Gbp,
                  competitionId: competition.id,
                  stripePriceId: stripePrice.id,
                  stripeProductId: stripeProduct.id,
                  passOnPlatformFee: false,
                  isVolunteer: true,
                },
              ])
              .returningAll()
              .execute(),
            pg.insertInto('Workout').values(workoutsToInsert).returningAll().execute(),
            pg
              .updateTable('Competition')
              .set({
                orgId: org.id,
              })
              .where('id', '=', competition.id)
              .execute(),
          ])

          const [ticketType, volunteerTicketType] = ticketTypes

          await Promise.all([
            pg
              .insertInto('ScoreSetting')
              .values({
                competitionId: competition.id,
                penalizeIncomplete: true,
                penalizeScaled: true,
                handleTie: 'BEST_OVERALL_FINISH',
                scoring: 'POINTS_PER_PLACE',
                ticketTypeOrderIds: [ticketType.id],
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
            pg
              .insertInto('CompetitionCreator')
              .values({
                competitionId: competition.id,
                userId: ctx.user?.id ?? '',
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
            createHeats({
              workouts,
              startDateTime,
              ticketTypeId: ticketType.id,
            }),
            createRegistrationFields(ticketType, volunteerTicketType).catch((error) => {
              console.error('Failed to create registration fields:', error)
              throw error
            }),
          ])

          if (process.env.NODE_ENV === 'production') {
            const emailOptionsForMe = {
              to: 'nickoferrall@gmail.com',
              subject: 'New competition created!',
              body: `${ctx.user?.email} created ${name}`,
              html: `
                <h1>Someone created a competition!</h1>
                <p>Name: ${name}</p>
                <p>Creator: ${ctx.user?.email}</p>
                <p>Start: ${startDateTime}</p>
              `,
            }
            const mailgunManager = new MailgunManager()
            mailgunManager.sendEmail(emailOptionsForMe)
          }

          return {
            competition,
            message: 'Competition created successfully',
          }
        } catch (error: any) {
          console.error('Error during competition creation:', error)
          throw new Error(`Error creating competition: ${error.message}`)
        }
      },
    })
  },
})
