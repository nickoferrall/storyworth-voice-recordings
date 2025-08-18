import { booleanArg, extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { enumType } from 'nexus'
import { QuestionType as TQuestionType } from '../../src/generated/graphql'
import { stringToEnum } from '../../utils/stringToEnum'
import { RequiredStatus as TRequiredStatus } from '../../src/generated/graphql'
import { TicketType } from './TicketType'

export const QuestionType = enumType({
  name: 'QuestionType',
  members: [
    'TEXT',
    'EMAIL',
    'MULTIPLE_CHOICE',
    'STATEMENT',
    'MULTIPLE_CHOICE_SELECT_ONE',
    'DROPDOWN',
    'INTEGRATION',
  ],
})

export const RequiredStatus = enumType({
  name: 'RequiredStatus',
  members: ['REQUIRED', 'OPTIONAL', 'OFF'],
})

export const SuggestedField = enumType({
  name: 'SuggestedField',
  members: [
    'NAME',
    'BOX',
    'ADDRESS',
    'PHONE',
    'EMERGENCY_CONTACT_NAME',
    'EMERGENCY_CONTACT_NUMBER',
    'DATE_OF_BIRTH',
    'T_SHIRT_SIZE',
    'INSTAGRAM',
    'EMAIL',
    'GENDER',
  ],
})

export const RegistrationField = objectType({
  name: 'RegistrationField',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('question')
    t.nonNull.field('type', {
      type: QuestionType,
      resolve: (parent) => {
        return stringToEnum((parent as any).type, TQuestionType) as any
      },
    })
    t.nonNull.field('requiredStatus', {
      type: RequiredStatus,
      resolve: (parent) => {
        return stringToEnum((parent as any).requiredStatus, TRequiredStatus) as any
      },
    })
    t.nonNull.boolean('isEditable')
    t.nonNull.boolean('isVolunteer')
    t.nonNull.boolean('repeatPerAthlete')
    t.nonNull.field('onlyTeams', {
      type: 'Boolean',
      resolve: (parent) => {
        return (parent as any).onlyTeams ?? false
      },
    })
    t.nonNull.int('sortOrder')
    t.list.nonNull.string('options')

    t.nonNull.list.nonNull.field('ticketTypes', {
      type: TicketType,
      resolve: async ({ id }, _args, ctx) => {
        const ticketTypes =
          await ctx.loaders.ticketTypeByRegistrationFieldIdLoader.load(id)
        if (!ticketTypes.length) {
          throw new Error(`ticketTypes not found for RegistrationField with id ${id}`)
        }
        return ticketTypes as any
      },
    })

    t.string('integration', {
      resolve: (parent) => {
        return (parent as any).type === TQuestionType.Integration
          ? (parent as any).question
          : null
      },
    })
  },
})

export const GetRegistrationFieldsByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getRegistrationFieldsByCompetitionId', {
      type: 'RegistrationField',
      args: {
        competitionId: nonNull(stringArg()),
        isVolunteer: nonNull(booleanArg({ default: false })),
      },
      resolve: async (_parent, { competitionId, isVolunteer = false }, ctx) => {
        const pg = getKysely()

        const registrationFields = await pg
          .selectFrom('RegistrationField as rf')
          .innerJoin(
            'RegistrationFieldTicketTypes as rftt',
            'rf.id',
            'rftt.registrationFieldId',
          )
          .innerJoin('TicketType as tt', 'rftt.ticketTypeId', 'tt.id')
          .where('tt.competitionId', '=', competitionId)
          .where('tt.isVolunteer', '=', isVolunteer)
          .selectAll('rf')
          .select('tt.isVolunteer')
          .orderBy('rf.sortOrder')
          .distinct()
          .execute()

        return registrationFields
      },
    })
  },
})
