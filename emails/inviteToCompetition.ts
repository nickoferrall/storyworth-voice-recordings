import MailgunManager from '../lib/MailgunManager'

export const sendCompetitionInvitationEmail = async (
  email: string,
  competitionName: string,
  token: string,
  senderName: string,
) => {
  const manager = new MailgunManager()

  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/competition-invite/${token}`

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Competition Management Invitation</h2>
      
      <p>Hi,</p>
      
      <p>You have been invited by <strong>${senderName}</strong> to help manage the <strong>${competitionName}</strong> competition on Fitlo.</p>
      
      <p>As a competition manager, you'll be able to:</p>
      <ul style="color: #555;">
        <li>View and manage competition details</li>
        <li>Manage participants and registrations</li>
        <li>Create and manage heats</li>
        <li>Enter scores and results</li>
        <li>Send emails to participants</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" 
           style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      
      <p>This invitation will expire in 30 days.</p>
      
      <p>If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Best regards,<br>The Fitlo Team</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
        This email was sent to ${email}. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `

  try {
    await manager.sendEmail({
      to: email,
      subject: `Invitation to manage ${competitionName}`,
      html: emailBody,
      senderName: 'Fitlo',
      disableTracking: true,
    })
    return true
  } catch (error) {
    console.error('Failed to send competition invitation email:', error)
    return false
  }
}
