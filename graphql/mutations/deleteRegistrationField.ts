import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const DeleteRegistrationFieldMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteRegistrationField', {
      type: 'String',
      args: {
        registrationFieldId: nonNull(stringArg()),
      },
      resolve: async (
        _parent,
        { registrationFieldId }: { registrationFieldId: string },
        _ctx,
      ) => {
        const pg = getKysely()
        try {
          await pg.transaction().execute(async (trx) => {
            await trx
              .deleteFrom('RegistrationFieldTicketTypes')
              .where('registrationFieldId', '=', registrationFieldId)
              .execute()

            await trx
              .deleteFrom('RegistrationField')
              .where('id', '=', registrationFieldId)
              .execute()

            await trx
              .deleteFrom('TicketType')
              .where('id', '=', registrationFieldId)
              .execute()
          })

          return `RegistrationField with ID ${registrationFieldId} successfully deleted`
        } catch (error: any) {
          console.error('Error during deletion of RegistrationField:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
