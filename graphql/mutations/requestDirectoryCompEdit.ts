import { extendType, nonNull, inputObjectType } from 'nexus'
import MailgunManager from '../../lib/MailgunManager'

export const RequestDirectoryCompEditInput = inputObjectType({
  name: 'RequestDirectoryCompEditInput',
  definition(t) {
    t.nonNull.string('eventId')
    t.nonNull.string('eventTitle')
    t.string('title')
    t.string('location')
    t.float('price')
    t.string('website')
    t.string('ticketWebsite')
    t.string('email')
    t.string('instagramHandle')
    t.string('logo')
    t.string('description')
  },
})

export const RequestDirectoryCompEdit = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('requestDirectoryCompEdit', {
      type: 'Boolean',
      args: {
        input: nonNull(RequestDirectoryCompEditInput),
      },
      resolve: async (_root, { input }, ctx) => {
        if (!ctx.user) {
          throw new Error('Not authenticated')
        }

        const mailgunManager = new MailgunManager()

        // Build the changes object with only the fields that were provided
        const changes: Record<string, any> = {}
        if (input.title) changes.title = input.title
        if (input.location) changes.location = input.location
        if (input.price !== undefined) changes.price = input.price
        if (input.website) changes.website = input.website
        if (input.ticketWebsite) changes.ticketWebsite = input.ticketWebsite
        if (input.email) changes.email = input.email
        if (input.instagramHandle) changes.instagramHandle = input.instagramHandle
        if (input.logo) changes.logo = input.logo
        if (input.description) changes.description = input.description

        // Build HTML content for the email
        const changesHtml = Object.entries(changes)
          .map(([field, value]) => {
            const fieldName =
              field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
            return `<li><strong>${fieldName}:</strong> ${value}</li>`
          })
          .join('')

        await mailgunManager.sendEmail({
          to: 'nickoferrall@gmail.com',
          subject: `Directory Competition Edit Request - ${input.eventTitle}`,
          html: `
            <h1>Directory Competition Edit Request</h1>
            <h2>${input.eventTitle}</h2>
            <p><strong>Event ID:</strong> ${input.eventId}</p>
            <p><strong>Requested by:</strong> ${ctx.user.firstName} ${ctx.user.lastName || ''} (${ctx.user.email})</p>
            
            <h3>Requested Changes:</h3>
            <ul>
              ${changesHtml}
            </ul>
            
            <p>Please review and update the competition details as appropriate.</p>
          `,
          body: `
Directory Competition Edit Request

Event: ${input.eventTitle}
Event ID: ${input.eventId}
Requested by: ${ctx.user.firstName} ${ctx.user.lastName || ''} (${ctx.user.email})

Requested Changes:
${Object.entries(changes)
  .map(([field, value]) => {
    const fieldName =
      field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
    return `- ${fieldName}: ${value}`
  })
  .join('\n')}

Please review and update the competition details as appropriate.
          `,
        })

        return true
      },
    })
  },
})
