import { extendType, nonNull, stringArg, arg, inputObjectType, list } from 'nexus'
import { RegistrationField, QuestionType, RequiredStatus } from '../types'
import {
  QuestionType as TQuestionType,
  RequiredStatus as TRequiredStatus,
} from '../../src/generated/graphql'
import getKysely from '../../src/db'
import { sql } from 'kysely'

export const RegistrationFieldInput = inputObjectType({
  name: 'RegistrationFieldInput',
  definition(t) {
    t.nonNull.string('question')
    t.nonNull.field('type', { type: QuestionType })
    t.nonNull.field('requiredStatus', { type: RequiredStatus })
    t.list.string('options')
    t.boolean('repeatPerAthlete')
  },
})

export const CreateRegistrationFieldMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createRegistrationField', {
      type: RegistrationField,
      args: {
        ticketTypeIds: nonNull(list(nonNull(stringArg()))),
        registrationField: nonNull(arg({ type: RegistrationFieldInput })),
      },
      resolve: async (_parent, { ticketTypeIds, registrationField }, ctx) => {
        try {
          const pg = getKysely()

          const existingField = await pg
            .selectFrom('RegistrationField as rf')
            .select('rf.question')
            .innerJoin(
              'RegistrationFieldTicketTypes as rftt',
              'rf.id',
              'rftt.registrationFieldId',
            )
            .where('rftt.ticketTypeId', 'in', ticketTypeIds)
            .where('rf.question', '=', registrationField.question)
            .executeTakeFirst()

          if (existingField) {
            throw new Error(
              'A registration field with this question already exists for the provided ticket types.',
            )
          }

          const result = await pg
            .selectFrom('RegistrationField as rf')
            .select(sql`COALESCE(MAX(rf."sortOrder"), 0) + 1`.as('nextSortOrder'))
            .innerJoin(
              'RegistrationFieldTicketTypes as rftt',
              'rf.id',
              'rftt.registrationFieldId',
            )
            .where('rftt.ticketTypeId', '=', ticketTypeIds[0])
            .executeTakeFirstOrThrow()

          const nextSortOrder = result.nextSortOrder as number

          const createdField = await pg
            .insertInto('RegistrationField')
            .values({
              question: registrationField.question,
              type: registrationField.type as TQuestionType, // Cast to the correct type
              requiredStatus: registrationField.requiredStatus as TRequiredStatus, // Cast to the correct type
              options: registrationField.options as any,
              sortOrder: nextSortOrder || 0,
              isEditable: true,
              repeatPerAthlete: registrationField.repeatPerAthlete ?? false,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          await Promise.all(
            ticketTypeIds.map((ticketTypeId: any) =>
              pg
                .insertInto('RegistrationFieldTicketTypes')
                .values({
                  registrationFieldId: createdField.id,
                  ticketTypeId,
                })
                .execute(),
            ),
          )

          // TODO: fix this type
          return createdField as any
        } catch (error: any) {
          console.error('Error during custom registration field creation:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
