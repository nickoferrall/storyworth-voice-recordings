import { extendType, nonNull, stringArg, booleanArg } from 'nexus'
import getKysely from '../../src/db'

export const CheckInAthlete = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('checkInAthlete', {
      type: 'Registration',
      args: {
        registrationId: nonNull(stringArg()), // ID of the registration
        isCheckedIn: nonNull(booleanArg()), // Check-in status
      },
      resolve: async (_parent, { registrationId, isCheckedIn }, ctx) => {
        const pg = getKysely()

        // Update the registration to set isCheckedIn status
        const updatedRegistration = await pg
          .updateTable('Registration')
          .set({ isCheckedIn })
          .where('id', '=', registrationId)
          .returningAll()
          .executeTakeFirst()

        if (!updatedRegistration) {
          throw new Error('Registration not found or could not be updated')
        }

        return updatedRegistration
      },
    })
  },
})
