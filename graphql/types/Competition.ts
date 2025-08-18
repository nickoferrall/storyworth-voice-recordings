import {
  objectType,
  enumType,
  extendType,
  nonNull,
  stringArg,
  list,
  booleanArg,
  intArg,
} from 'nexus'
import getKysely from '../../src/db'
import { Org } from './Org'
import { EarlyBird } from './EarlyBird'
import { CompetitionType as TCompetitionType } from '../../src/generated/graphql'
import { stringArrayToEnumArray } from '../../utils/stringToEnum'
import { TicketType } from './TicketType'

export const CompetitionType = enumType({
  name: 'CompetitionType',
  members: [
    'CHARITY',
    'CROSSFIT_LICENCED_EVENT',
    'CROSSFIT_SEMI_FINALS',
    'IN_HOUSE',
    'ELITE',
    'INTERMEDIATE',
    'MASTERS',
    'OLYMPIC_WEIGHTLIFTING',
    'POWERLIFTING',
    'PRIZE_AWARDED',
    'QUALIFIER',
    'STRONGMAN',
    'TEEN',
    'VIRTUAL',
    'WOMENS_ONLY',
  ],
})

export const Gender = enumType({
  name: 'Gender',
  members: ['MALE', 'FEMALE', 'MIXED'],
})

export const AgeGroup = enumType({
  name: 'AgeGroup',
  members: ['ADULTS', 'TEENS', 'MASTERS', 'OPEN'],
})

export const Difficulty = enumType({
  name: 'Difficulty',
  members: ['RX', 'EVERYDAY', 'ELITE', 'INTERMEDIATE', 'MASTERS', 'TEEN'],
})

export const Access = enumType({
  name: 'Access',
  members: ['PUBLIC', 'PRIVATE'],
})

export const Currency = enumType({
  name: 'Currency',
  members: [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'AUD',
    'SR',
    'CAD',
    'CHF',
    'CNY',
    'DKK',
    'HKD',
    'NOK',
    'NZD',
    'SEK',
    'SGD',
    'ZAR',
    'AED',
    'BRL',
    'INR',
    'MXN',
    'THB',
  ],
})

export const Address = objectType({
  name: 'Address',
  definition(t) {
    t.string('id')
    t.string('venue')
    t.string('street')
    t.string('city')
    t.string('region')
    t.string('postcode')
    t.string('country')
  },
})

export const AthleteCompetition = objectType({
  name: 'AthleteCompetition',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.string('competitionId')
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
    t.field('user', {
      type: 'User',
      resolve: async ({ userId }, _, ctx) => {
        return await ctx.loaders.userByIdLoader.load(userId)
      },
    })
    t.field('competition', {
      type: 'Competition',
      resolve: async ({ competitionId }, _, ctx) => {
        const comp = await ctx.loaders.competitionLoader.load(competitionId)
        return comp || null
      },
    })
  },
})

export const CompetitionCreator = objectType({
  name: 'CompetitionCreator',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.string('competitionId')
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
    t.field('user', {
      type: 'User',
      resolve: async ({ userId }, _, ctx) => {
        return await ctx.loaders.userByIdLoader.load(userId)
      },
    })
    t.field('competition', {
      type: 'Competition',
      resolve: async ({ competitionId }, _, ctx) => {
        const comp = await ctx.loaders.competitionLoader.load(competitionId)
        return comp || null
      },
    })
  },
})

export const Competition = objectType({
  name: 'Competition',
  definition(t) {
    t.nonNull.string('id')
    t.string('name')
    t.list.field('types', {
      type: CompetitionType,
      resolve: (parent) => {
        const res = stringArrayToEnumArray((parent as any).types, TCompetitionType)
        return res
      },
    })
    t.field('lastTicketType', {
      type: TicketType,
      resolve: async (parent, _, ctx) => {
        const lastTicket = await ctx.loaders.lastCreatedTicketTypeLoader.load(parent.id)
        if (!lastTicket) {
          return null
        }
        return lastTicket as any
      },
    })
    t.field('gender', { type: 'Gender' })
    t.field('ageGroup', { type: 'AgeGroup' })
    t.field('difficulty', { type: 'Difficulty' })
    t.string('description')
    t.field('startDateTime', { type: 'DateTime' })
    t.field('endDateTime', { type: 'DateTime' })
    t.field('deadline', { type: 'DateTime' })
    t.field('access', { type: 'Access' })
    t.string('location')
    t.nonNull.boolean('hasWorkouts', {
      resolve: async ({ id }, _, ctx) => {
        return await ctx.loaders.hasWorkoutsByCompetitionIdLoader.load(id)
      },
    })
    t.nonNull.string('addressId')
    t.field('releaseDateTime', {
      type: 'DateTime',
      resolve: async ({ id }, _, ctx) => {
        const workouts = await ctx.loaders.workoutsByCompetitionIdLoader.load(id)

        if (workouts.length > 0) {
          return workouts[0].releaseDateTime
        }
      },
    })
    t.nonNull.field('address', {
      type: Address,
      resolve: async ({ addressId }, _, { loaders }) => {
        if (!addressId) {
          throw new Error('Competition must have an address')
        }
        return await loaders.addressLoader.load(addressId)
      },
    })
    t.field('earlyBird', {
      type: EarlyBird,
      resolve: async (parent, _, ctx) => {
        const lastTicket = await ctx.loaders.lastCreatedTicketTypeLoader.load(parent.id)
        if (!lastTicket) return null
        const res = await ctx.loaders.earlyBirdByTicketTypeLoader.load(lastTicket.id)
        if (!res) return null
        return res
      },
    })
    t.string('timezone')
    t.string('logo')
    t.string('website')
    t.string('email')
    t.string('instagramHandle')
    t.field('currency', { type: Currency })
    t.float('price')
    t.string('source')
    t.nonNull.boolean('isActive') // false if deleted
    t.nonNull.boolean('registrationEnabled') // allows organizers to quickly disable registrations
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
    t.string('orgName', {
      resolve: async (parent, _args, ctx) => {
        // First check if the competition has its own orgName
        if ((parent as any).orgName) {
          return (parent as any).orgName
        }

        // Fallback to the Organiser table for backwards compatibility
        if ((parent as any).orgId) {
          const org = await ctx.loaders.orgLoader.load((parent as any).orgId)
          return org?.name || null
        }

        return null
      },
    })
    t.field('createdBy', {
      type: 'User',
      resolve: async ({ createdByUserId }, _, ctx) => {
        // Return null if no createdByUserId (e.g., for scraped competitions)
        if (!createdByUserId) {
          return null
        }
        const creator = await ctx.loaders.userByIdLoader.load(createdByUserId)
        if (!creator) {
          return null
        }
        return creator as any
      },
    })
    t.nonNull.string('createdByUserId')
    t.nonNull.field('registrationsCount', {
      type: 'Int',
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.registrationCountLoader.load(id)
      },
    })
    t.nonNull.field('participantsCount', {
      type: 'Int',
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.participantsCountLoader.load(id)
      },
    })
    t.nonNull.field('teamsCount', {
      type: 'Int',
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.teamsCountLoader.load(id)
      },
    })
    t.list.field('registrationTrend', {
      type: 'DailyRegistration',
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.registrationTrendLoader.load(id)
      },
    })
    t.field('org', {
      type: Org,
      resolve: async (parent, _, ctx) => {
        if (!(parent as any).orgId) {
          return null
        }
        return await ctx.loaders.orgLoader.load((parent as any).orgId)
      },
    })
    t.list.field('creators', {
      type: CompetitionCreator,
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.competitionCreatorsByCompetitionIdLoader.load(id)
      },
    })
    t.list.field('athletes', {
      type: AthleteCompetition,
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.athleteCompetitionsByCompetitionIdLoader.load(id)
      },
    })
    // NEW: Add linking to DirectoryComp
    t.string('directoryCompId')
    t.field('directoryComp', {
      type: 'DirectoryComp',
      resolve: async (parent, _args, ctx) => {
        if (!(parent as any).directoryCompId) return null
        return ctx.loaders.directoryCompByIdLoader.load((parent as any).directoryCompId)
      },
    })
    t.list.field('ticketTypes', {
      type: 'TicketType',
      resolve: async ({ id }, _, ctx) => {
        return ctx.loaders.ticketTypesByCompetitionIdLoader.load(id)
      },
    })
  },
})

export const GetCompetitionsById = extendType({
  type: 'Query',
  definition(t) {
    t.field('getCompetitionById', {
      type: 'Competition',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, { loaders }) => {
        const comp = await loaders.competitionLoader.load(id)
        if (!comp) return null

        if (!comp.addressId) {
          throw new Error('Competition must have an address')
        }
        const address = await loaders.addressLoader.load(comp.addressId)

        return {
          ...comp,
          address,
        }
      },
    })
  },
})

export const GetCompetitionsByUser = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getCompetitionsByUser', {
      type: 'Competition',
      resolve: async (_parent, _, ctx) => {
        if (!ctx.user) return []

        const competitions = await ctx.loaders.competitionsAsCreatorByUserIdLoader.load(
          ctx.user.id,
        )
        return competitions.filter((comp) => comp.isActive)
      },
    })
  },
})

export const GetCompetitionsByIds = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getCompetitionsByIds', {
      type: 'Competition',
      args: {
        ids: nonNull(list(nonNull(stringArg()))),
      },
      resolve: async (_parent, { ids }, { loaders }) => {
        const competitions = await Promise.all(
          ids.map(async (id: string) => {
            try {
              const comp = await loaders.competitionLoader.load(id)
              if (!comp || !comp.addressId) return null
              const address = await loaders.addressLoader.load(comp.addressId)
              return {
                ...comp,
                address,
              }
            } catch (error) {
              console.error(`Failed to load competition ${id}:`, error)
              return null
            }
          }),
        )

        return competitions.filter(Boolean) as any[]
      },
    })
  },
})

export const GetExploreCompetitions = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getExploreCompetitions', {
      args: {
        limit: nonNull(intArg({ default: 20 })),
        offset: nonNull(intArg({ default: 0 })),
        search: stringArg(),
        countries: list(nonNull(stringArg())),
        cities: list(nonNull(stringArg())),
        genders: list(nonNull(stringArg())),
        teamSize: stringArg(),
        startDate: stringArg(),
        endDate: stringArg(),
      },
      type: 'Competition',
      resolve: async (
        _src,
        {
          limit,
          offset,
          search,
          countries,
          cities,
          genders,
          teamSize,
          startDate,
          endDate,
        }: {
          limit: number
          offset: number
          search?: string | null
          countries?: string[] | null
          cities?: string[] | null
          genders?: string[] | null
          teamSize?: string | null
          startDate?: string | null
          endDate?: string | null
        },
        { loaders },
      ) => {
        const db = getKysely()

        let query = db
          .selectFrom('Competition')
          .innerJoin('Address', 'Address.id', 'Competition.addressId')
          .selectAll('Competition')
          .select([
            'Address.id as addressId',
            'Address.city as addressCity',
            'Address.country as addressCountry',
            'Address.venue as addressVenue',
          ])
          .where('Competition.isActive', '=', true)
          .where('Competition.startDateTime', '>', new Date())

        // Apply search filter - search in competition name AND description
        if (search && search.trim()) {
          const searchTerm = search.trim()
          query = query.where((eb) =>
            eb.or([
              eb('Competition.name', 'ilike', `%${searchTerm}%`),
              eb('Competition.description', 'ilike', `%${searchTerm}%`),
            ]),
          )
        }

        // Apply country filter with normalization
        if (countries && countries.length > 0) {
          query = query.where((eb) => {
            const conditions = countries.map((country) => {
              // Handle both "United Kingdom" and "UK"
              if (country === 'United Kingdom') {
                return eb.or([
                  eb('Address.country', '=', 'United Kingdom'),
                  eb('Address.country', '=', 'UK'),
                ])
              }
              return eb('Address.country', '=', country)
            })
            return eb.or(conditions)
          })
        }

        // Apply city filter
        if (cities && cities.length > 0) {
          query = query.where('Address.city', 'in', cities)
        }

        // Apply date range filter
        if (startDate) {
          query = query.where('Competition.startDateTime', '>=', new Date(startDate))
        }
        if (endDate) {
          query = query.where('Competition.startDateTime', '<=', new Date(endDate))
        }

        // Team size filter requires joining ticket types
        if (teamSize && teamSize !== 'ALL') {
          const teamSizeNum = parseInt(teamSize)
          if (!isNaN(teamSizeNum)) {
            query = query.where((eb) =>
              eb.exists(
                eb
                  .selectFrom('TicketType')
                  .select('TicketType.id')
                  .where('TicketType.competitionId', '=', eb.ref('Competition.id'))
                  .where('TicketType.teamSize', '=', teamSizeNum)
                  .where('TicketType.isVolunteer', '=', false),
              ),
            )
          }
        }

        const competitions = await query
          .orderBy('Competition.startDateTime', 'asc')
          .limit(limit)
          .offset(offset)
          .execute()

        return competitions.map((comp) => ({
          ...comp,
          address: {
            id: comp.addressId,
            city: comp.addressCity,
            country: comp.addressCountry,
            venue: comp.addressVenue,
          },
        }))
      },
    })
  },
})

export const GetCompetitionFilters = extendType({
  type: 'Query',
  definition(t) {
    t.field('getCompetitionFilters', {
      type: objectType({
        name: 'CompetitionFilters',
        definition(t) {
          t.nonNull.list.nonNull.string('countries')
          t.nonNull.list.nonNull.string('cities')
          t.nonNull.list.nonNull.int('teamSizes')
        },
      }),
      resolve: async () => {
        const db = getKysely()

        // Get all unique countries where active competitions exist
        const countryResults = await db
          .selectFrom('Competition')
          .innerJoin('Address', 'Address.id', 'Competition.addressId')
          .select('Address.country')
          .where('Competition.isActive', '=', true)
          .where('Competition.startDateTime', '>', new Date())
          .where('Address.country', 'is not', null)
          .distinct()
          .execute()

        // Get all unique cities where active competitions exist
        const cityResults = await db
          .selectFrom('Competition')
          .innerJoin('Address', 'Address.id', 'Competition.addressId')
          .select('Address.city')
          .where('Competition.isActive', '=', true)
          .where('Competition.startDateTime', '>', new Date())
          .where('Address.city', 'is not', null)
          .distinct()
          .execute()

        // Get all unique team sizes from ticket types
        const teamSizeResults = await db
          .selectFrom('TicketType')
          .innerJoin('Competition', 'Competition.id', 'TicketType.competitionId')
          .select('TicketType.teamSize')
          .where('Competition.isActive', '=', true)
          .where('Competition.startDateTime', '>', new Date())
          .where('TicketType.isVolunteer', '=', false)
          .distinct()
          .orderBy('TicketType.teamSize', 'asc')
          .execute()

        // Normalize and filter countries
        const countries = countryResults
          .map((row) => {
            const country = row.country?.trim()
            if (!country) return null

            // Fix data quality issues
            if (country === 'UK') return 'United Kingdom'
            if (country === 'US') return 'United States'
            if (country === 'Dublin') return null // Dublin is a city, not a country

            return country
          })
          .filter(Boolean)
          .filter((country) => {
            // Only include valid countries from our continent data
            const {
              getCountriesByContinent,
            } = require('../../utils/getCountriesByContinent')
            return (
              getCountriesByContinent('Europe').includes(country as string) ||
              getCountriesByContinent('North America').includes(country as string) ||
              getCountriesByContinent('Oceania').includes(country as string)
            )
          })

        const uniqueCountries = Array.from(new Set(countries)).sort()

        // Filter cities (remove nulls and empty strings)
        const cities = cityResults.map((row) => row.city?.trim()).filter(Boolean)

        const uniqueCities = Array.from(new Set(cities)).sort()

        // Get unique team sizes
        const teamSizes = teamSizeResults
          .map((row) => row.teamSize)
          .filter((size) => size && size > 0)

        const uniqueTeamSizes = Array.from(new Set(teamSizes)).sort((a, b) => a - b)

        return {
          countries: uniqueCountries,
          cities: uniqueCities,
          teamSizes: uniqueTeamSizes,
        }
      },
    })
  },
})
