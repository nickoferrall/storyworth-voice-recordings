import { extendType, nonNull, arg, inputObjectType } from 'nexus'
import { User } from '../types'
import { createRegistration } from './helpers/createRegistration'

export const RegistrationAnswerInput = inputObjectType({
  name: 'RegistrationAnswerInput',
  definition(t) {
    t.nonNull.string('registrationFieldId')
    t.nonNull.string('answer')
    t.nullable.field('integration', {
      type: IntegrationInput,
    })
  },
})

export const IntegrationInput = inputObjectType({
  name: 'IntegrationInput',
  definition(t) {
    t.nonNull.string('type')
    t.nonNull.string('accessToken')
    t.nonNull.string('refreshToken')
    t.nonNull.string('expiresAt')
    t.nonNull.string('athleteId')
    t.string('athleteFirstname')
    t.string('athleteLastname')
    t.string('athleteProfile')
  },
})

export const CreateRegistrationInput = inputObjectType({
  name: 'CreateRegistrationInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.string('email')
    t.nonNull.string('ticketTypeId')
    t.nullable.string('invitationToken')
    t.string('selectedHeatId')
    t.nonNull.list.field('answers', { type: nonNull('RegistrationAnswerInput') })
  },
})

export const CreateRegistrationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createRegistration', {
      type: User,
      args: {
        input: nonNull(
          arg({
            type: CreateRegistrationInput,
          }),
        ),
      },
      resolve: async (
        _parent,
        {
          input: { name, email, ticketTypeId, answers, invitationToken, selectedHeatId },
        },
        ctx,
      ) => {
        const { updatedUser } = await createRegistration({
          email,
          name,
          ticketTypeId,
          answers,
          selectedHeatId: selectedHeatId ?? null,
          invitationToken: invitationToken ?? null,
          context: ctx,
        })
        return updatedUser as any
      },
    })
  },
})
