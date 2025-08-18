import MailgunManager from '../lib/MailgunManager'
import generateToken from '../utils/createToken'
import { makeInviteLink } from '../utils/makeInviteLink'

export const inviteToTeam = (
  teamEmails: string[],
  competitionName: string,
  ticketTypeId: string,
  captainName: string,
) => {
  const manager = new MailgunManager()
  return teamEmails.map((email) => {
    const token = generateToken(email) // Generate a unique token

    const eventLink = makeInviteLink(ticketTypeId, token)

    const emailBody = `
      <p>Hi,</p>
      <p>You have been invited by ${captainName} to join a team for the <strong>${competitionName}</strong>.</p>
      <p>Please click on the link below to register for the event and sign the waiver:</p>
      <p><a href="${eventLink}">Register Here</a></p>
      <p>Best of luck and have fun!</p>
    `

    manager.sendEmail({
      to: email,
      subject: 'Team Invitation for ' + competitionName,
      html: emailBody,
      disableTracking: true, // Disable tracking to prevent URL corruption
    })

    return { email, token }
  })
}
