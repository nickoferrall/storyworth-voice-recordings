import { objectType } from 'nexus'
import getKysely from '../../src/db'
import { RegistrationField } from './RegistrationField'

export const RegistrationAnswer = objectType({
  name: 'RegistrationAnswer',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('answer')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('userId')
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.userId) {
          throw new Error('RegistrationAnswer has no userId')
        }
        return await ctx.loaders.userByIdLoader.load(parent.userId)
      },
    })
    t.nonNull.string('registrationFieldId')
    t.field('registrationField', {
      type: RegistrationField,
      resolve: async (parent, _args, ctx) => {
        const field = await ctx.loaders.registrationFieldByIdLoader.load(
          parent.registrationFieldId,
        )
        if (!field) throw new Error('RegistrationField not found')
        return field as any
      },
    })
    t.nonNull.string('ticketTypeId')
    t.nonNull.string('competitionId')
    t.field('competition', {
      type: 'Competition',
      resolve: async (parent, _args, ctx) => {
        const pg = getKysely()
        const competition = await pg
          .selectFrom('Competition')
          .where('id', '=', parent.competitionId)
          .selectAll()
          .executeTakeFirst()

        if (!competition) {
          throw new Error('Competition not found')
        }

        return competition
      },
    })
  },
})
