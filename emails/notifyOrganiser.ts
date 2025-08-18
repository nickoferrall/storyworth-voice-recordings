import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import MailgunManager from '../lib/MailgunManager'
import { Context } from '../graphql/context'
import getKysely from '../src/db'

dayjs.extend(utc)
dayjs.extend(timezone)

const notifyOrganiser = async (
  athleteEmail: string,
  orgId: string,
  athleteName: string,
  ticketTypeId: string,
  ctx: Context,
  selectedHeatTime?: Date | null,
) => {
  const pg = getKysely()

  const ticketType = await ctx.loaders.ticketTypeLoader.load(ticketTypeId)
  const org = await pg
    .selectFrom('Org')
    .selectAll()
    .where('id', '=', orgId)
    .executeTakeFirst()

  if (!org) {
    throw new Error(`Organization with ID ${orgId} not found`)
  }

  // Fetch competition details from the ticket type (correct way)
  const competition = await pg
    .selectFrom('Competition')
    .selectAll()
    .where('id', '=', ticketType!.competitionId)
    .executeTakeFirst()

  if (!competition) {
    throw new Error(`Competition for organization ${orgId} not found`)
  }

  let heatTimeInfo = ''
  if (selectedHeatTime) {
    const formattedHeatTime = dayjs(selectedHeatTime).tz('Europe/London').format('h:mm A') // Only show time for heat - date is already clear from context
    heatTimeInfo = `
      <li><strong>Athlete's Heat Time:</strong> ${formattedHeatTime}</li>
    `
  }

  const ticketTypeInfo = ticketType
    ? `<li><strong>Ticket Type:</strong> ${ticketType.name}</li>`
    : ''

  // Email body for the organizer
  const emailBody = `
    <p>Hi ${org.name},</p>
    <p>An athlete has just registered for your competition <strong>${competition.name}</strong>.</p>
    <p>Here are the details:</p>
    <ul>
      <li><strong>Athlete Name:</strong> ${athleteName}</li>
      <li><strong>Athlete Email:</strong> ${athleteEmail}</li>
      ${ticketTypeInfo}
      ${heatTimeInfo}
    </ul>
    <p>Best regards,</p>
    <p>fitlo</p>
  `

  const manager = new MailgunManager()
  await manager.sendEmail({
    to: org.email, // Assuming 'org.email' is the organiser's email
    subject: `New Athlete Registration for ${competition.name}`,
    html: emailBody,
  })
}

export default notifyOrganiser
