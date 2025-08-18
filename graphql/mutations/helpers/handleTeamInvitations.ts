import { inviteToTeam } from '../../../emails/inviteToTeam'
import getKysely from '../../../src/db'

type Props = {
  sender: {
    id: string
    firstName: string
    lastName: string | null
  }
  teamId: string | null
  emails?: string[]
  compName: string
  ticketTypeId: string
}

export const handleTeamInvitations = async (props: Props) => {
  const { sender, teamId, emails, compName, ticketTypeId } = props

  if (emails?.length && teamId) {
    const captainName = sender.lastName
      ? `${sender.firstName} ${sender.lastName}`
      : sender.firstName

    const invitations = inviteToTeam(emails, compName, ticketTypeId, captainName)

    const invitationData = invitations.map(({ email, token }) => ({
      email,
      teamId,
      token,
      sentByUserId: sender.id,
    }))

    // Perform bulk insert using Kysely
    const pg = getKysely()
    await pg.insertInto('Invitation').values(invitationData).execute()
  }
}
