import { objectType } from 'nexus'

export const RegistrationFieldTicketTypes = objectType({
  name: 'RegistrationFieldTicketTypes',
  definition(t) {
    t.nonNull.string('registrationFieldId')
    t.nonNull.string('ticketTypeId')
  },
})
