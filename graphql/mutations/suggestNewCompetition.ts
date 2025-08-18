import { extendType, nonNull, stringArg, floatArg } from 'nexus'
import getKysely from '../../src/db'
import MailgunManager from '../../lib/MailgunManager'

export const SuggestNewCompetition = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('suggestNewCompetition', {
      type: 'String',
      args: {
        name: nonNull(stringArg()),
        description: stringArg(),
        website: stringArg(),
        email: stringArg(),
        venue: stringArg(),
        city: stringArg(),
        country: stringArg(),
        startDate: stringArg(),
        endDate: stringArg(),
        price: floatArg(),
        currency: stringArg(),
        reason: stringArg(),
      },
      resolve: async (_, args, ctx) => {
        if (!ctx.user) {
          throw new Error('Authentication required')
        }

        const db = getKysely()

        try {
          // Create address first
          const address = await db
            .insertInto('Address')
            .values({
              venue: args.venue?.slice(0, 255) || null,
              street: null,
              city: args.city?.slice(0, 255) || null,
              postcode: null,
              country: args.country?.slice(0, 255) || null,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Parse dates
          const startDateTime = args.startDate ? new Date(args.startDate) : new Date()
          const endDateTime = args.endDate ? new Date(args.endDate) : startDateTime

          // Create suggested competition
          const suggestedCompetition = await db
            .insertInto('PotentialCompetition')
            .values({
              name: args.name.slice(0, 255),
              description: args.description || null,
              startDateTime,
              endDateTime,
              addressId: address.id,
              timezone: 'UTC',
              logo: null,
              website: args.website || null,
              email: args.email || null,
              currency: args.currency || 'USD',
              price: args.price || null,
              source: 'USER_SUGGESTED',
              country: args.country || null,
              scrapedData: JSON.stringify({
                suggestedBy: ctx.user.id,
                reason: args.reason,
                submittedAt: new Date().toISOString(),
              }),
              status: 'PENDING',
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Create default ticket type
          await db
            .insertInto('PotentialTicketType')
            .values({
              potentialCompetitionId: suggestedCompetition.id,
              name: 'General Entry',
              description: 'Standard entry - details available on website',
              price: args.price || 0,
              currency: args.currency || 'USD',
              maxEntries: 100,
              teamSize: 1,
              isVolunteer: false,
              allowHeatSelection: false,
              passOnPlatformFee: true,
            })
            .execute()

          // Send email notification
          const mailgun = new MailgunManager()
          const emailContent = `
A new competition has been suggested on Fitlo:

Competition Details:
- Name: ${args.name}
- Description: ${args.description || 'Not provided'}
- Website: ${args.website || 'Not provided'}
- Email: ${args.email || 'Not provided'}
- Location: ${args.venue || ''} ${args.city || ''}, ${args.country || ''}
- Start Date: ${args.startDate || 'Not provided'}
- End Date: ${args.endDate || 'Not provided'}
- Price: ${args.price ? `${args.currency || 'USD'} ${args.price}` : 'Not provided'}
- Reason: ${args.reason || 'Not provided'}

Suggested by User ID: ${ctx.user.id}

Review at: https://fitlo.co/admin/potential-competitions
          `

          await mailgun.sendEmail({
            to: 'nickoferrall@gmail.com',
            subject: `New Competition Suggested: ${args.name}`,
            body: emailContent,
          })

          return 'Competition suggestion submitted successfully! We will review it shortly.'
        } catch (error) {
          console.error('Error creating competition suggestion:', error)
          throw new Error('Failed to submit competition suggestion')
        }
      },
    })
  },
})
