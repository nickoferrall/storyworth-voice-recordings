import getKysely from '../src/db'

type Props = {
  isTeam: boolean
  ticketTypeId: string
  answers: { registrationFieldId: string; answer: string }[]
  userId: string
}

export const createEntryHelper = async (props: Props) => {
  const { isTeam, ticketTypeId, answers, userId } = props
  const pg = getKysely()

  if (isTeam) {
    // Only create a new team if we don't have a teamId from an invitation
    const registrationFields = await pg
      .selectFrom('RegistrationField as rf')
      .innerJoin(
        'RegistrationFieldTicketTypes as rftt',
        'rf.id',
        'rftt.registrationFieldId',
      )
      .selectAll('rf')
      .where('rftt.ticketTypeId', '=', ticketTypeId)
      .orderBy('rf.sortOrder', 'asc')
      .execute()

    const teamQuestion = registrationFields.find(
      (registrationField) => registrationField.question === 'Team Name',
    )
    const teamName = answers.find(
      (answer) => answer.registrationFieldId === teamQuestion?.id,
    )?.answer

    const team = await pg
      .insertInto('Team')
      .values({
        name: teamName,
        teamCaptainId: userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    const entry = await pg
      .insertInto('Entry')
      .values({
        userId,
        teamId: team.id,
        ticketTypeId: ticketTypeId,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return entry
  } else {
    const entry = await pg
      .insertInto('Entry')
      .values({
        userId,
        teamId: null,
        ticketTypeId: ticketTypeId,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return entry
  }
}
