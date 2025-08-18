import { extendType, nonNull, stringArg } from 'nexus'
import { Currency, QuestionType, RequiredStatus } from '../../src/generated/graphql'
import getKysely from '../../src/db'

export const CreateVolunteerTicketTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createVolunteerTicketType', {
      type: 'TicketType',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, _ctx) => {
        try {
          const pg = getKysely()

          const volunteerTicketType = await pg
            .insertInto('TicketType')
            .values({
              name: 'Volunteer',
              description: `
                - Help with setup and teardown
                - Assist with registration
                - Assist with judging
                - Assist with scoring
                - Assist with equipment management
                `,
              maxEntries: 50,
              price: 0,
              teamSize: 1,
              currency: Currency.Gbp,
              competitionId,
              passOnPlatformFee: false,
              isVolunteer: true,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          const [nameField, emailField] = await Promise.all([
            pg
              .insertInto('RegistrationField')
              .values({
                question: 'Name',
                type: QuestionType.Text,
                requiredStatus: RequiredStatus.Required,
                isEditable: false,
                sortOrder: 0,
                repeatPerAthlete: true,
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
            pg
              .insertInto('RegistrationField')
              .values({
                question: 'Email',
                type: QuestionType.Text,
                requiredStatus: RequiredStatus.Required,
                isEditable: false,
                sortOrder: 1,
                repeatPerAthlete: true,
              })
              .returningAll()
              .executeTakeFirstOrThrow(),
          ])

          await pg
            .insertInto('RegistrationFieldTicketTypes')
            .values([
              {
                registrationFieldId: nameField.id,
                ticketTypeId: volunteerTicketType.id,
              },
              {
                registrationFieldId: emailField.id,
                ticketTypeId: volunteerTicketType.id,
              },
            ])
            .execute()

          return volunteerTicketType as any
        } catch (error: any) {
          console.error('Error during creation of Volunteer TicketType:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
