import { mutationField, nonNull, inputObjectType, list, arg } from 'nexus'
import getKysely from '../../src/db'
import { PartnerInterest } from '../../src/generated/database'
import { sendPartnerInterestCreatedEmail } from '../../emails/partnerNotifications'
import MailgunManager from '../../lib/MailgunManager'
import shortUUID from 'short-uuid'

export const CreatePartnerInterestInput = inputObjectType({
  name: 'CreatePartnerInterestInput',
  definition(t) {
    t.nonNull.list.nonNull.string('userIds')
    t.nonNull.field('interestType', { type: 'PartnerInterestType' })
    t.nonNull.field('partnerPreference', { type: 'PartnerPreference' })
    t.list.nonNull.string('categoryIds')
    t.list.nonNull.string('ticketTypeIds')
    t.string('description')
    t.string('phone')
    t.string('instagram')
  },
})

export const CreatePartnerInterest = mutationField('createPartnerInterest', {
  type: list('PartnerInterest'),
  args: {
    input: nonNull('CreatePartnerInterestInput'),
  },
  resolve: async (_root, { input }, ctx) => {
    console.log('🚀 ~ input:', input)
    if (!ctx.user) {
      throw new Error('Not authenticated')
    }

    const pg = getKysely()

    // Validate that either categoryIds or ticketTypeIds are provided, but not both
    const hasCategoryIds = input.categoryIds && input.categoryIds.length > 0
    const hasTicketTypeIds = input.ticketTypeIds && input.ticketTypeIds.length > 0

    if ((!hasCategoryIds && !hasTicketTypeIds) || (hasCategoryIds && hasTicketTypeIds)) {
      throw new Error(
        'Either categoryIds or ticketTypeIds must be provided, but not both',
      )
    }

    // Create a PartnerInterest record for each user-category/ticketType combination
    const partnerInterests: any[] = []

    if (hasCategoryIds) {
      // Handle category-based interests (for DirectoryComps without linked competitions)
      for (const userId of input.userIds) {
        for (const categoryId of input.categoryIds!) {
          // Check for existing active interests in the same category
          const existingInterest = await pg
            .selectFrom('PartnerInterest')
            .where('status', '=', 'ACTIVE')
            .where('userId', '=', userId)
            .where('categoryId', '=', categoryId)
            .select(['id'])
            .executeTakeFirst()

          if (existingInterest) {
            throw new Error(`You've already registered interest in this category`)
          }

          const now = new Date()
          const partnerInterest = await pg
            .insertInto('PartnerInterest')
            .values({
              userId,
              interestType: input.interestType,
              partnerPreference: input.partnerPreference,
              categoryId,
              ticketTypeId: null,
              description: input.description,
              phone: input.phone,
              instagram: input.instagram,
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
            })
            .returningAll()
            .executeTakeFirst()

          if (partnerInterest) {
            partnerInterests.push(partnerInterest as any)
          }
        }
      }
    } else {
      // Handle ticket type-based interests (for DirectoryComps with linked competitions)
      for (const userId of input.userIds) {
        for (const ticketTypeId of input.ticketTypeIds!) {
          // Check for existing active interests in the same ticket type
          const existingInterest = await pg
            .selectFrom('PartnerInterest')
            .where('status', '=', 'ACTIVE')
            .where('userId', '=', userId)
            .where('ticketTypeId', '=', ticketTypeId)
            .select(['id'])
            .executeTakeFirst()

          if (existingInterest) {
            throw new Error(`You've already registered interest in this ticket type`)
          }

          const now = new Date()
          const partnerInterest = await pg
            .insertInto('PartnerInterest')
            .values({
              userId,
              interestType: input.interestType,
              partnerPreference: input.partnerPreference,
              categoryId: null,
              ticketTypeId,
              description: input.description,
              phone: input.phone,
              instagram: input.instagram,
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
            })
            .returningAll()
            .executeTakeFirst()

          if (partnerInterest) {
            partnerInterests.push(partnerInterest as any)
          }
        }
      }
    }

    // Send email notification for the first created interest (avoid sending multiple emails)
    if (partnerInterests.length > 0) {
      try {
        const firstInterest = partnerInterests[0]
        const user = await ctx.loaders.userByIdLoader.load(firstInterest.userId)

        if (user) {
          let competitionTitle = ''
          let categoryInfo: {
            difficulty: string
            gender: string
            teamSize: number
          } | null = null

          if (firstInterest.categoryId) {
            // Category-based interest
            const category = await ctx.loaders.categoryByIdLoader.load(
              firstInterest.categoryId,
            )
            if (category) {
              const directoryComp = await ctx.loaders.directoryCompByIdLoader.load(
                category.directoryCompId,
              )
              if (directoryComp) {
                competitionTitle = directoryComp.title
                categoryInfo = {
                  difficulty: category.difficulty,
                  gender: category.gender,
                  teamSize: category.teamSize,
                }
              }
            }
          } else if (firstInterest.ticketTypeId) {
            // Ticket type-based interest
            const ticketType = await ctx.loaders.ticketTypeLoader.load(
              firstInterest.ticketTypeId,
            )
            if (ticketType) {
              const competition = await ctx.loaders.competitionLoader.load(
                ticketType.competitionId,
              )
              if (competition) {
                competitionTitle = competition.name
                categoryInfo = {
                  difficulty: 'Various', // Competition doesn't have difficulty enum
                  gender: 'Mixed', // Competition doesn't separate by gender in ticket types
                  teamSize: ticketType.teamSize,
                }
              }
            }
          }

          if (competitionTitle && categoryInfo) {
            await sendPartnerInterestCreatedEmail({
              userEmail: user.email,
              userName: user.firstName,
              competitionTitle,
              category: categoryInfo,
              description: input.description || undefined,
            })

            // Send admin notification email
            try {
              const mailgunManager = new MailgunManager()
              await mailgunManager.sendEmail({
                to: 'nickoferrall@gmail.com',
                subject: 'New Partner Interest Created',
                body: `
New partner interest created!

User: ${user.firstName} ${user.lastName || ''} (${user.email})
Competition: ${competitionTitle}
Category/Type: ${categoryInfo.difficulty} ${categoryInfo.gender} (Team of ${categoryInfo.teamSize})
Interest Type: ${input.interestType}
${input.description ? `Description: ${input.description}` : ''}
${input.phone ? `Phone: ${input.phone}` : ''}

Created at: ${new Date().toLocaleString()}
                `,
                html: `
<h2>New Partner Interest Created!</h2>
<p><strong>User:</strong> ${user.firstName} ${user.lastName || ''} (${user.email})</p>
<p><strong>Competition:</strong> ${competitionTitle}</p>
<p><strong>Category/Type:</strong> ${categoryInfo.difficulty} ${categoryInfo.gender} (Team of ${categoryInfo.teamSize})</p>
<p><strong>Interest Type:</strong> ${input.interestType}</p>
${input.description ? `<p><strong>Description:</strong> ${input.description}</p>` : ''}
${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ''}
<p><strong>Created at:</strong> ${new Date().toLocaleString()}</p>
                `,
              })
            } catch (adminEmailError) {
              console.error('Failed to send admin notification email:', adminEmailError)
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send partner interest created email:', emailError)
      }
    }

    return partnerInterests
  },
})
