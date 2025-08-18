import MailgunManager from '../lib/MailgunManager'

interface PartnerInterestCreatedEmailData {
  userEmail: string
  userName: string
  competitionTitle: string
  category: {
    difficulty: string
    gender: string
    teamSize: number
  }
  description?: string
}

interface PartnerRequestReceivedEmailData {
  recipientEmail: string
  recipientName: string
  requesterName: string
  competitionTitle: string
  category: {
    difficulty: string
    gender: string
    teamSize: number
  }
  message?: string
  phone?: string
}

interface PartnerMatchedEmailData {
  userEmail: string
  userName: string
  partnerName: string
  partnerEmail: string
  partnerPhone?: string
  competitionTitle: string
  category: {
    difficulty: string
    gender: string
    teamSize: number
  }
  isUSCompetition: boolean
}

export const sendPartnerInterestCreatedEmail = async (
  data: PartnerInterestCreatedEmailData,
) => {
  const { userEmail, userName, competitionTitle, category, description } = data

  const categoryText = `${category.difficulty} ${category.gender} ${
    category.teamSize === 1 ? 'Individual' : `Team of ${category.teamSize}`
  }`

  const partnerDashboardLink = 'https://fitlo.co/partners'

  const emailBody = `
    <p>Hi ${userName},</p>
    <p>Your partner listing for <strong>${competitionTitle}</strong> has been created successfully!</p>
    
    <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #333;">Your Listing Details:</h3>
      <p style="margin: 4px 0;"><strong>Category:</strong> ${categoryText}</p>
      ${description ? `<p style="margin: 4px 0;"><strong>Description:</strong> "${description}"</p>` : ''}
    </div>

    <p>Other athletes looking for partners in this category will now be able to see your listing and send you requests.</p>
    
    <p>You can manage your partner requests and view your teams at:</p>
    <p><a href="${partnerDashboardLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Partner Dashboard</a></p>
    
    <p>Good luck finding your perfect training partner!</p>
    <p>Best regards,<br>The Fitlo Team</p>
  `

  const manager = new MailgunManager()
  await manager.sendEmail({
    to: userEmail,
    subject: `Partner listing created for ${competitionTitle}`,
    html: emailBody,
  })
}

export const sendPartnerRequestReceivedEmail = async (
  data: PartnerRequestReceivedEmailData,
) => {
  const {
    recipientEmail,
    recipientName,
    requesterName,
    competitionTitle,
    category,
    message,
    phone,
  } = data

  const categoryText = `${category.difficulty} ${category.gender} ${
    category.teamSize === 1 ? 'Individual' : `Team of ${category.teamSize}`
  }`

  const partnerDashboardLink = 'https://fitlo.co/partners'

  const emailBody = `
    <p>Hi ${recipientName},</p>
    <p><strong>${requesterName}</strong> wants to team up with you for <strong>${competitionTitle}</strong>!</p>
    
    <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #333;">Request Details:</h3>
      <p style="margin: 4px 0;"><strong>Category:</strong> ${categoryText}</p>
      <p style="margin: 4px 0;"><strong>From:</strong> ${requesterName}</p>
      ${phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
      ${message ? `<p style="margin: 8px 0 4px 0;"><strong>Message:</strong></p><p style="margin: 4px 0; font-style: italic;">"${message}"</p>` : ''}
    </div>

    <p>You can accept or decline this request in your partner dashboard:</p>
    <p><a href="${partnerDashboardLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request</a></p>
    
    <p>Don't keep them waiting too long!</p>
    <p>Best regards,<br>The Fitlo Team</p>
  `

  const manager = new MailgunManager()
  await manager.sendEmail({
    to: recipientEmail,
    subject: `New partner request for ${competitionTitle}`,
    html: emailBody,
  })
}

export const sendPartnerMatchedEmail = async (data: PartnerMatchedEmailData) => {
  const {
    userEmail,
    userName,
    partnerName,
    partnerEmail,
    partnerPhone,
    competitionTitle,
    category,
    isUSCompetition,
  } = data

  const categoryText = `${category.difficulty} ${category.gender} ${
    category.teamSize === 1 ? 'Individual' : `Team of ${category.teamSize}`
  }`

  const partnerDashboardLink = 'https://fitlo.co/partners'

  let contactInfo = `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${partnerEmail}">${partnerEmail}</a></p>`

  if (partnerPhone) {
    if (isUSCompetition) {
      contactInfo += `<p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${partnerPhone}">${partnerPhone}</a></p>`
    } else {
      contactInfo += `<p style="margin: 4px 0;"><strong>WhatsApp:</strong> <a href="https://wa.me/${partnerPhone.replace(/[^\d]/g, '')}">${partnerPhone}</a></p>`
    }
  }

  const emailBody = `
    <p>Hi ${userName},</p>
    <p>🎉 <strong>Great news!</strong> You've been matched with a partner for <strong>${competitionTitle}</strong>!</p>
    
    <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #333;">Your Partner:</h3>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${partnerName}</p>
      <p style="margin: 4px 0;"><strong>Category:</strong> ${categoryText}</p>
      ${contactInfo}
    </div>

    <div style="background-color: #e7f3ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #0066cc;">Next Steps:</h3>
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li>Reach out to ${partnerName} to coordinate your training</li>
        <li>Discuss your competition strategy and goals</li>
        <li>Make sure you're both registered for the event</li>
        <li>Plan your competition day logistics</li>
      </ul>
    </div>

    <p>You can view all your teams and manage your partner listings at:</p>
    <p><a href="${partnerDashboardLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Teams</a></p>
    
    <p>Best of luck with your partnership and the competition!</p>
    <p>Best regards,<br>The Fitlo Team</p>
  `

  const manager = new MailgunManager()
  await manager.sendEmail({
    to: userEmail,
    subject: `🎉 You've got a partner for ${competitionTitle}!`,
    html: emailBody,
  })
}
