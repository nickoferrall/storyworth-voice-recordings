import MailgunManager from '../lib/MailgunManager'

interface EditSuggestionEmailData {
  competitionName: string
  competitionId: string
  userName: string
  userEmail: string
  suggestedChanges: any
  reason?: string | null
  suggestionId: string
}

export async function sendEditSuggestionEmail(data: EditSuggestionEmailData) {
  const mailgun = new MailgunManager()

  // Format the suggested changes for email
  const changesText = Object.entries(data.suggestedChanges)
    .map(([field, value]) => `• ${field}: ${value}`)
    .join('\n')

  const subject = `Competition Edit Suggestion: ${data.competitionName}`

  const htmlContent = `
    <h2>New Competition Edit Suggestion</h2>
    
    <p><strong>Competition:</strong> ${data.competitionName} (ID: ${data.competitionId})</p>
    <p><strong>Suggested by:</strong> ${data.userName} (${data.userEmail})</p>
    
    <h3>Suggested Changes:</h3>
    <pre>${changesText}</pre>
    
    ${data.reason ? `<h3>Reason:</h3><p>${data.reason}</p>` : ''}
    
    <p><strong>Suggestion ID:</strong> ${data.suggestionId}</p>
    
    <p>You can review and approve/reject this suggestion in the admin panel.</p>
  `

  const textContent = `
    New Competition Edit Suggestion
    
    Competition: ${data.competitionName} (ID: ${data.competitionId})
    Suggested by: ${data.userName} (${data.userEmail})
    
    Suggested Changes:
    ${changesText}
    
    ${data.reason ? `Reason: ${data.reason}` : ''}
    
    Suggestion ID: ${data.suggestionId}
    
    You can review and approve/reject this suggestion in the admin panel.
  `

  await mailgun.sendEmail({
    to: 'nickoferrall@gmail.com',
    subject,
    body: textContent,
    html: htmlContent,
  })
}
