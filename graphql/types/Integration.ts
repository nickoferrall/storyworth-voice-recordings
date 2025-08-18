import { objectType, enumType, extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const IntegrationType = enumType({
  name: 'IntegrationType',
  members: ['STRAVA'], // Add more integration types as needed
})

export const Integration = objectType({
  name: 'Integration',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.field('type', { type: IntegrationType })
    t.nonNull.string('registrationAnswerId')
    t.nonNull.string('accessToken')
    t.nonNull.string('refreshToken')
    t.field('expiresAt', { type: 'DateTime' })
    t.nonNull.string('athleteId')
    t.string('athleteFirstname')
    t.string('athleteLastname')
    t.string('athleteProfile')
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
  },
})

// Query to get Integration by ID
export const GetIntegration = extendType({
  type: 'Query',
  definition(t) {
    t.field('getIntegration', {
      type: Integration,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, _ctx) => {
        const pg = getKysely()

        const integration = await pg
          .selectFrom('Integration')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst()

        if (!integration) {
          throw new Error(`Integration not found with id ${id}`)
        }

        return integration
      },
    })
  },
})

// Query to get Integration by RegistrationAnswerId
export const GetIntegrationByRegistrationAnswerId = extendType({
  type: 'Query',
  definition(t) {
    t.field('getIntegrationByRegistrationAnswerId', {
      type: Integration,
      args: {
        registrationAnswerId: nonNull(stringArg()),
      },
      resolve: async (_parent, { registrationAnswerId }, _ctx) => {
        const pg = getKysely()

        const integration = await pg
          .selectFrom('Integration')
          .selectAll()
          .where('registrationAnswerId', '=', registrationAnswerId)
          .executeTakeFirst()

        if (!integration) {
          throw new Error(
            `Integration not found with registrationAnswerId ${registrationAnswerId}`,
          )
        }

        return integration
      },
    })
  },
})
