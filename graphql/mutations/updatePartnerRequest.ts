import { extendType, nonNull, inputObjectType, arg } from 'nexus'
import getKysely from '../../src/db'
import { PartnerRequestStatus } from '../types/PartnerRequest'
import { sendPartnerMatchedEmail } from '../../emails/partnerNotifications'

export const UpdatePartnerRequestInput = inputObjectType({
  name: 'UpdatePartnerRequestInput',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.field('status', { type: PartnerRequestStatus })
  },
})

export const UpdatePartnerRequestMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updatePartnerRequest', {
      type: 'PartnerRequest',
      args: {
        input: nonNull(arg({ type: 'UpdatePartnerRequestInput' })),
      },
      resolve: async (_root, { input }, ctx) => {
        const pg = getKysely()
        const { id: requestId, status } = input

        // Fetch the request
        const request = await pg
          .selectFrom('PartnerRequest')
          .where('id', '=', requestId)
          .selectAll()
          .executeTakeFirst()
        if (!request) throw new Error('Request not found')
        if (request.status !== 'PENDING') throw new Error('Request is not pending')

        // Fetch the related interests
        const toInterest = await pg
          .selectFrom('PartnerInterest')
          .where('id', '=', request.toInterestId)
          .selectAll()
          .executeTakeFirst()
        if (!toInterest) throw new Error('Target interest not found')

        let fromInterest: any = null
        if (request.fromInterestId) {
          fromInterest = await pg
            .selectFrom('PartnerInterest')
            .where('id', '=', request.fromInterestId)
            .selectAll()
            .executeTakeFirst()
          if (!fromInterest) throw new Error('Source interest not found')
        }

        // Only allow:
        // - recipient (toInterest.userId) to accept/reject
        // - sender (fromInterest.userId or fromUserId for direct requests) to cancel
        if (
          (status === 'ACCEPTED' || status === 'REJECTED') &&
          ctx.user?.id !== toInterest.userId
        ) {
          throw new Error('Only the recipient can accept or reject this request')
        }
        if (status === 'CANCELLED') {
          const senderUserId = request.fromInterestId
            ? fromInterest?.userId
            : request.fromUserId
          if (ctx.user?.id !== senderUserId) {
            throw new Error('Only the sender can cancel this request')
          }
        }

        // Accept: Calculate team completion and update status accordingly
        if (status === 'ACCEPTED') {
          // Get the category to determine required team size
          let category: any = null
          if (toInterest.categoryId) {
            category = await ctx.loaders.categoryByIdLoader.load(toInterest.categoryId)
            if (!category) throw new Error('Category not found')
          }

          // For ticket type-based interests, we need to get team size from ticket type
          let requiredTeamSize = 1
          if (category) {
            requiredTeamSize = category.teamSize
          } else if (toInterest.ticketTypeId) {
            const ticketType = await ctx.loaders.ticketTypeLoader.load(
              toInterest.ticketTypeId,
            )
            if (ticketType) {
              requiredTeamSize = ticketType.teamSize
            }
          }

          // Calculate current team size for the target interest
          const calculateTeamSize = async (interestId: string) => {
            // Count existing team members (invited/accepted)
            const teamMembers = await pg
              .selectFrom('PartnerInterestTeamMember')
              .where('partnerInterestId', '=', interestId)
              .where('status', 'in', ['INVITED', 'ACCEPTED'])
              .selectAll()
              .execute()

            // Count accepted partner requests (excluding the current one being processed)
            const acceptedRequests = await pg
              .selectFrom('PartnerRequest')
              .where('toInterestId', '=', interestId)
              .where('status', '=', 'ACCEPTED')
              .where('id', '!=', requestId) // Exclude current request
              .selectAll()
              .execute()

            // Team size = interest owner (1) + team members + accepted requests + current request (1)
            return 1 + teamMembers.length + acceptedRequests.length + 1
          }

          const currentTeamSize = await calculateTeamSize(request.toInterestId)
          const isTeamComplete = currentTeamSize >= requiredTeamSize

          // Update the target interest status
          const newStatus = isTeamComplete ? 'FILLED' : 'PARTIALLY_FILLED'
          await pg
            .updateTable('PartnerInterest')
            .set({ status: newStatus, updatedAt: new Date() })
            .where('id', '=', request.toInterestId)
            .execute()

          // If there's a source interest (interest-to-interest request), handle it too
          if (request.fromInterestId && fromInterest) {
            let fromCategory: any = null
            if (fromInterest.categoryId) {
              fromCategory = await ctx.loaders.categoryByIdLoader.load(
                fromInterest.categoryId,
              )
            }

            let fromRequiredTeamSize = 1
            if (fromCategory) {
              fromRequiredTeamSize = fromCategory.teamSize
            } else if (fromInterest.ticketTypeId) {
              const fromTicketType = await ctx.loaders.ticketTypeLoader.load(
                fromInterest.ticketTypeId,
              )
              if (fromTicketType) {
                fromRequiredTeamSize = fromTicketType.teamSize
              }
            }

            const fromCurrentTeamSize = await calculateTeamSize(request.fromInterestId)
            const isFromTeamComplete = fromCurrentTeamSize >= fromRequiredTeamSize

            const fromNewStatus = isFromTeamComplete ? 'FILLED' : 'PARTIALLY_FILLED'
            await pg
              .updateTable('PartnerInterest')
              .set({ status: fromNewStatus, updatedAt: new Date() })
              .where('id', '=', request.fromInterestId)
              .execute()
          }
        }

        // Update the request status
        await pg
          .updateTable('PartnerRequest')
          .set({ status, updatedAt: new Date() })
          .where('id', '=', requestId)
          .execute()

        // Send email notifications if request was accepted
        if (status === 'ACCEPTED') {
          try {
            const recipientUser = await ctx.loaders.userByIdLoader.load(toInterest.userId)
            const requesterUser = request.fromUserId
              ? await ctx.loaders.userByIdLoader.load(request.fromUserId)
              : fromInterest
                ? await ctx.loaders.userByIdLoader.load(fromInterest.userId)
                : null

            // Only load category if categoryId exists
            let category: any = null
            if (toInterest.categoryId) {
              category = await ctx.loaders.categoryByIdLoader.load(toInterest.categoryId)
            }

            if (recipientUser && requesterUser && category) {
              const directoryComp = await ctx.loaders.directoryCompByIdLoader.load(
                category.directoryCompId,
              )

              if (directoryComp) {
                const isUSCompetition = directoryComp.country === 'United States'

                // Send email to both users
                await Promise.all([
                  // Email to recipient (who accepted)
                  sendPartnerMatchedEmail({
                    userEmail: recipientUser.email,
                    userName: recipientUser.firstName,
                    partnerName: requesterUser.firstName,
                    partnerEmail: requesterUser.email,
                    partnerPhone: request.phone || undefined,
                    competitionTitle: directoryComp.title,
                    category: {
                      difficulty: category.difficulty,
                      gender: category.gender,
                      teamSize: category.teamSize,
                    },
                    isUSCompetition,
                  }),
                  // Email to requester (who sent the request)
                  sendPartnerMatchedEmail({
                    userEmail: requesterUser.email,
                    userName: requesterUser.firstName,
                    partnerName: recipientUser.firstName,
                    partnerEmail: recipientUser.email,
                    partnerPhone: undefined, // Don't share recipient's phone in reverse
                    competitionTitle: directoryComp.title,
                    category: {
                      difficulty: category.difficulty,
                      gender: category.gender,
                      teamSize: category.teamSize,
                    },
                    isUSCompetition,
                  }),
                ])
              }
            }
          } catch (emailError) {
            console.error('Failed to send partner matched emails:', emailError)
            // Don't throw error - email failure shouldn't break the mutation
          }
        }

        // Return updated row
        const updated = await pg
          .selectFrom('PartnerRequest')
          .where('id', '=', requestId)
          .selectAll()
          .executeTakeFirst()

        if (!updated) {
          throw new Error('Failed to update request')
        }

        return updated
      },
    })
  },
})
