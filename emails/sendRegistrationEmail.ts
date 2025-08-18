import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import MailgunManager from '../lib/MailgunManager'
import { Competition } from '../src/generated/database'
import { Selectable } from 'kysely'

// Load dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const sendRegistrationEmail = async (
  email: string,
  competition: Selectable<Competition>,
  firstName: string,
  selectedHeatTime?: Date | null,
) => {
  const startDate = dayjs(competition.startDateTime)
    .tz('Europe/London') // Default to 'Europe/London' if timezone is undefined
    // .tz(competition.timezone || 'Europe/London') // Default to 'Europe/London' if timezone is undefined
    .format('MMMM D, YYYY') // Date only - no time to avoid timezone confusion
  const eventLink = `https://fitlo.co/event/${competition.id}`

  let heatTimeInfo = ''
  if (selectedHeatTime) {
    const formattedHeatTime = dayjs(selectedHeatTime)
      .tz('Europe/London')
      // .tz(competition.timezone || 'Europhttps://fitlo.co/event/nTXFrbe/London')
      .format('MMMM D, YYYY h:mm A') // Add 'z' to display the timezone abbreviation
    heatTimeInfo = `
      <li><strong>Your Heat Time:</strong> ${formattedHeatTime}</li>
      `
  }

  const emailBody = `
    <p>Hey ${firstName},</p>
    <p>Congratulations! You're now registered for <strong>${competition.name}</strong>!</p>
    <p>Here are the details of the event:</p>
    <ul>
      <li><strong>Name:</strong> ${competition.name}</li>
      <li><strong>Start Date:</strong> ${startDate}</li>
      ${heatTimeInfo}
    </ul>
    <p>You can view the event details by clicking on the link below:</p>
    <p><a href="${eventLink}">View Event</a></p>
    <p>Best of luck and enjoy!</p>
  `

  const manager = new MailgunManager()
  manager.sendEmail({
    to: email,
    subject: 'Registration Successful for ' + competition.name,
    html: emailBody,
  })
}

export default sendRegistrationEmail
