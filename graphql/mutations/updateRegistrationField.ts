import { extendType, nonNull, stringArg, arg, list } from 'nexus'
import { RegistrationField, QuestionType, RequiredStatus } from '../types'
import { nanoid } from 'nanoid'
import getKysely from '../../src/db'

export const UpdateRegistrationFieldMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateRegistrationField', {
      type: RegistrationField,
      args: {
        id: nonNull(stringArg()),
        question: stringArg(),
        type: arg({ type: QuestionType }),
        requiredStatus: arg({ type: RequiredStatus }),
        options: list(arg({ type: 'String' })),
        repeatPerAthlete: arg({ type: 'Boolean' }),
        ticketTypeIds: list(nonNull(stringArg())),
      },
      resolve: async (
        _parent,
        { id, question, type, requiredStatus, options, repeatPerAthlete, ticketTypeIds },
      ) => {
        try {
          const pg = getKysely()

          const filteredOptions =
            options?.filter((o: any): o is string => o !== null && o !== undefined) ||
            undefined
          const updatedField = await pg
            .updateTable('RegistrationField')
            .set({
              question: question || undefined,
              type: type || undefined,
              requiredStatus: requiredStatus || undefined,
              options: filteredOptions,
              repeatPerAthlete: repeatPerAthlete || undefined,
            })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          if (ticketTypeIds && ticketTypeIds.length > 0) {
            // Remove old associations
            await pg
              .deleteFrom('RegistrationFieldTicketTypes')
              .where('registrationFieldId', '=', id)
              .execute()

            const newAssociations = ticketTypeIds.map((ticketTypeId: string) => ({
              registrationFieldId: id,
              ticketTypeId,
            }))

            await pg
              .insertInto('RegistrationFieldTicketTypes')
              .values(newAssociations)
              .execute()
          }

          return updatedField as any
        } catch (error: any) {
          console.error('Error during custom registration field update:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
