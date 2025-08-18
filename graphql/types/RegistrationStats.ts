import { extendType, objectType, stringArg, list } from 'nexus'
import getKysely from '../../src/db'
import dayjs from 'dayjs'

export const CompetitionWithStats = objectType({
  name: 'CompetitionWithStats',
  definition(t) {
    t.field('competition', { type: 'Competition' })
    t.int('registrationsInPeriod')
  },
})

export const RegistrationStats = objectType({
  name: 'RegistrationStats',
  definition(t) {
    t.int('totalRegistrations')
    t.list.field('competitions', {
      type: CompetitionWithStats,
    })
    t.string('periodStart')
    t.string('periodEnd')
  },
})

export const PaymentCompetitionMapping = objectType({
  name: 'PaymentCompetitionMapping',
  definition(t) {
    t.string('email')
    t.string('transactionId')
    t.string('amount')
    t.string('currency')
    t.string('date')
    t.field('competition', { type: 'Competition' })
    t.field('ticketType', { type: 'TicketType' })
  },
})

export const getRegistrationStatsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getRegistrationStats', {
      type: RegistrationStats,
      args: {
        days: stringArg({ default: '30' }),
      },
      resolve: async (_, { days }, ctx) => {
        const pg = getKysely()

        let startDate: Date
        let endDate: Date

        if (days === 'thisMonth') {
          // Start of current month
          startDate = dayjs().startOf('month').toDate()
          // End of today (or current time)
          endDate = dayjs().toDate()
        } else {
          // Rolling days from today
          const daysNum = parseInt(days || '30', 10)
          startDate = dayjs().subtract(daysNum, 'days').toDate()
          endDate = dayjs().toDate()
        }

        // Build the query to get registrations in the specified period
        let query = pg
          .selectFrom('Registration')
          .innerJoin('Competition', 'Competition.id', 'Registration.competitionId')
          .where('Registration.createdAt', '>=', startDate)
          .where('Registration.createdAt', '<=', endDate)
          .where('Competition.isActive', '=', true)
          // Filter out test competitions
          .where((eb) =>
            eb.and([
              eb('Competition.name', 'not ilike', '%test%'),
              eb('Competition.name', 'not ilike', '%demo%'),
              eb('Competition.name', 'not ilike', '%trial%'),
              eb('Competition.name', 'not ilike', '%staging%'),
              eb('Competition.name', 'not ilike', '%sample%'),
            ]),
          )

        const registrations = await query
          .select((eb) => [
            'Registration.competitionId',
            eb.fn.count('Registration.id').as('registrationCount'),
          ])
          .groupBy('Registration.competitionId')
          .execute()

        // Get competition details for each competition that had registrations
        const competitionIds_actual = registrations.map((r) => r.competitionId)
        const competitions = await Promise.all(
          competitionIds_actual.map(async (id) => {
            const competition = await ctx.loaders.competitionLoader.load(id)
            const registrationsInPeriod = Number(
              registrations.find((r) => r.competitionId === id)?.registrationCount || 0,
            )

            return {
              competition,
              registrationsInPeriod,
            }
          }),
        )

        // Filter out any null competitions and sort by registrations
        const validCompetitions = competitions
          .filter((c) => c.competition)
          .sort((a, b) => b.registrationsInPeriod - a.registrationsInPeriod)

        const totalRegistrations = validCompetitions.reduce(
          (sum, comp) => sum + comp.registrationsInPeriod,
          0,
        )

        return {
          totalRegistrations,
          competitions: validCompetitions,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
        }
      },
    })
  },
})

export const getPaymentMappingsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('getPaymentMappings', {
      type: PaymentCompetitionMapping,
      args: {
        emails: stringArg(),
        days: stringArg({ default: '30' }),
      },
      resolve: async (_, { emails, days }, ctx) => {
        const pg = getKysely()
        const daysNum = parseInt(days || '30', 10)
        const startDate = dayjs().subtract(daysNum, 'days').toDate()

        let query = pg
          .selectFrom('Payment')
          .innerJoin('Registration', 'Registration.id', 'Payment.registrationId')
          .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
          .innerJoin('Competition', 'Competition.id', 'TicketType.competitionId')
          .innerJoin('UserProfile', 'UserProfile.id', 'Registration.userId')
          .where('Payment.createdAt', '>=', startDate)
          .where('Competition.isActive', '=', true)
          .select([
            'UserProfile.email',
            'Payment.paymentIntentId as transactionId',
            'Payment.amount',
            'Payment.currency',
            'Payment.createdAt as date',
            'Competition.id as competitionId',
            'Competition.name as competitionName',
            'TicketType.id as ticketTypeId',
            'TicketType.name as ticketTypeName',
          ])
          .orderBy('Payment.createdAt', 'desc')

        if (emails) {
          const emailList = emails.split(',').map((e) => e.trim())
          query = query.where('UserProfile.email', 'in', emailList)
        }

        const results = await query.execute()

        return results.map((result) => ({
          email: result.email,
          transactionId: result.transactionId,
          amount: (result.amount / 100).toFixed(2), // Convert from cents
          currency: result.currency,
          date: result.date.toISOString(),
          competition: {
            id: result.competitionId,
            name: result.competitionName,
          },
          ticketType: {
            id: result.ticketTypeId,
            name: result.ticketTypeName,
          },
        }))
      },
    })
  },
})
