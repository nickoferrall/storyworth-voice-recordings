import getKysely from '../../../src/db'
import { QuestionType, RequiredStatus } from '../../../src/generated/graphql'
import { PartnerEmailQuestion } from '../../../utils/constants'
import { TicketType } from '../../../src/generated/database'
import { Selectable } from 'kysely'

export const createRegistrationFields = async (
  ticketType: Selectable<TicketType>,
  volunteerTicketType: Selectable<TicketType>,
) => {
  try {
    const fieldConfigs = [
      {
        question: 'Name',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 0,
        isEditable: false,
        repeatPerAthlete: true,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: 'Example Athlete',
      },
      {
        question: 'Your Email',
        type: QuestionType.Email,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 1,
        isEditable: false,
        repeatPerAthlete: true,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: 'captain@example.com',
      },
      {
        question: PartnerEmailQuestion,
        type: QuestionType.Email,
        requiredStatus: RequiredStatus.Optional,
        sortOrder: 2,
        isEditable: false,
        repeatPerAthlete: false,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: 'partner1@example.com',
        onlyTeams: true,
      },
      {
        question: 'Phone Number',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Off,
        sortOrder: 3,
        isEditable: true,
        repeatPerAthlete: true,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: '07591 123456',
      },
      {
        question: 'Emergency Contact Name',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 4,
        isEditable: true,
        repeatPerAthlete: true,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: 'Example Emergency Contact',
      },
      {
        question: 'Emergency Contact Number',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 5,
        isEditable: true,
        repeatPerAthlete: true,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: '07591 123456',
      },
      {
        question: 'Team Name',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 6,
        isEditable: true,
        repeatPerAthlete: false,
        ticketTypeIds: [ticketType.id],
        defaultAnswer: 'Example Team Name',
        onlyTeams: true,
      },
      {
        question: 'Name',
        type: QuestionType.Text,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 0,
        isEditable: false,
        repeatPerAthlete: true,
        ticketTypeIds: [volunteerTicketType.id],
        defaultAnswer: 'Example Volunteer',
      },
      {
        question: 'Your Email',
        type: QuestionType.Email,
        requiredStatus: RequiredStatus.Required,
        sortOrder: 1,
        isEditable: false,
        repeatPerAthlete: true,
        ticketTypeIds: [volunteerTicketType.id],
        defaultAnswer: 'volunteer@example.com',
      },
    ]

    const pg = getKysely()
    const results = await Promise.all(
      fieldConfigs.map(async (config) => {
        try {
          const createdField = await pg
            .insertInto('RegistrationField')
            .values({
              question: config.question,
              type: config.type,
              requiredStatus: config.requiredStatus,
              isEditable: config.isEditable,
              sortOrder: config.sortOrder,
              repeatPerAthlete: config.repeatPerAthlete,
              onlyTeams: config.onlyTeams,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          const ticketTypeResults = await Promise.all(
            config.ticketTypeIds.map((ticketTypeId) => {
              return pg
                .insertInto('RegistrationFieldTicketTypes')
                .values({
                  registrationFieldId: createdField.id,
                  ticketTypeId,
                })
                .returningAll()
                .execute()
            }),
          )

          return { createdField, ticketTypeResults }
        } catch (error) {
          console.error('Error creating registration field:', config.question, error)
          throw error
        }
      }),
    )

    console.log(`Successfully created ${results.length} registration fields`)
    return results
  } catch (error) {
    console.error('Error in createRegistrationFields:', error)
    throw error
  }
}
