import { extendType, nonNull, stringArg, floatArg } from 'nexus'
import getKysely from '../../src/db'

export const SuggestCompetitionEdit = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('suggestCompetitionEdit', {
      type: 'String', // Simple string response
      args: {
        competitionId: nonNull(stringArg()),
        name: stringArg(),
        description: stringArg(),
        website: stringArg(),
        email: stringArg(),
        venue: stringArg(),
        city: stringArg(),
        country: stringArg(),
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
          // Verify competition exists
          const competition = await db
            .selectFrom('Competition')
            .selectAll()
            .where('id', '=', args.competitionId)
            .executeTakeFirst()

          if (!competition) {
            throw new Error('Competition not found')
          }

          // Build the suggested changes object (only include fields that were provided)
          const suggestedChanges: any = {}
          if (args.name !== undefined && args.name !== null)
            suggestedChanges.name = args.name
          if (args.description !== undefined && args.description !== null)
            suggestedChanges.description = args.description
          if (args.website !== undefined && args.website !== null)
            suggestedChanges.website = args.website
          if (args.email !== undefined && args.email !== null)
            suggestedChanges.email = args.email
          if (args.venue !== undefined && args.venue !== null)
            suggestedChanges.venue = args.venue
          if (args.city !== undefined && args.city !== null)
            suggestedChanges.city = args.city
          if (args.country !== undefined && args.country !== null)
            suggestedChanges.country = args.country
          if (args.price !== undefined && args.price !== null)
            suggestedChanges.price = args.price
          if (args.currency !== undefined && args.currency !== null)
            suggestedChanges.currency = args.currency

          // Check if user is a super user
          const user = await db
            .selectFrom('User')
            .select(['isSuperUser'])
            .where('id', '=', ctx.user.id)
            .executeTakeFirst()

          const isSuperUser = user?.isSuperUser || false

          // Create the suggestion
          const suggestion = await db
            .insertInto('CompetitionEditSuggestion')
            .values({
              competitionId: args.competitionId,
              userId: ctx.user.id,
              suggestedChanges: JSON.stringify(suggestedChanges),
              reason: args.reason || null,
              status: isSuperUser ? 'APPROVED' : 'PENDING',
              reviewedBy: isSuperUser ? ctx.user.id : null,
              reviewedAt: isSuperUser ? new Date() : null,
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // If super user, apply changes immediately
          if (isSuperUser) {
            // Update competition fields
            const updateData: any = {}
            if (suggestedChanges.name) updateData.name = suggestedChanges.name
            if (suggestedChanges.description)
              updateData.description = suggestedChanges.description
            if (suggestedChanges.website) updateData.website = suggestedChanges.website
            if (suggestedChanges.email) updateData.email = suggestedChanges.email
            if (suggestedChanges.price !== undefined)
              updateData.price = suggestedChanges.price
            if (suggestedChanges.currency) updateData.currency = suggestedChanges.currency

            if (Object.keys(updateData).length > 0) {
              await db
                .updateTable('Competition')
                .set(updateData)
                .where('id', '=', args.competitionId)
                .execute()
            }

            // Update address if location fields changed
            if (
              suggestedChanges.venue ||
              suggestedChanges.city ||
              suggestedChanges.country
            ) {
              const addressUpdateData: any = {}
              if (suggestedChanges.venue) addressUpdateData.venue = suggestedChanges.venue
              if (suggestedChanges.city) addressUpdateData.city = suggestedChanges.city
              if (suggestedChanges.country)
                addressUpdateData.country = suggestedChanges.country

              if (competition.addressId && Object.keys(addressUpdateData).length > 0) {
                await db
                  .updateTable('Address')
                  .set(addressUpdateData)
                  .where('id', '=', competition.addressId)
                  .execute()
              }
            }

            console.log(
              `✅ Auto-approved edit suggestion for competition ${args.competitionId} by super user ${ctx.user.id}`,
            )
            return 'Changes applied successfully!'
          } else {
            // Send email notification for regular users
            try {
              // Import the email sending functionality
              const { sendEditSuggestionEmail } = await import(
                '../../emails/editSuggestionNotification'
              )

              await sendEditSuggestionEmail({
                competitionName: competition.name,
                competitionId: args.competitionId,
                userName: ctx.user.firstName + ' ' + ctx.user.lastName,
                userEmail: ctx.user.email,
                suggestedChanges,
                reason: args.reason,
                suggestionId: suggestion.id,
              })

              console.log(
                `📧 Edit suggestion email sent for competition ${args.competitionId}`,
              )
            } catch (emailError) {
              console.error('Failed to send edit suggestion email:', emailError)
              // Don't fail the mutation if email fails
            }

            return "Thank you for your suggestion! We'll review it and get back to you."
          }
        } catch (error) {
          console.error('Error in suggestCompetitionEdit:', error)
          throw new Error('Failed to submit suggestion. Please try again.')
        }
      },
    })
  },
})
