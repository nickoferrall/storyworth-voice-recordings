import { mutationField, nonNull, inputObjectType, arg } from 'nexus'
import getKysely from '../../src/db'
import { PartnerRequest } from '../types/PartnerRequest'
import { sendPartnerRequestReceivedEmail } from '../../emails/partnerNotifications'
import MailgunManager from '../../lib/MailgunManager'

export const CreatePartnerRequestInput = inputObjectType({
  name: 'CreatePartnerRequestInput',
  definition(t) {
    t.string('fromInterestId') // Optional - for interest-to-interest requests
    t.nonNull.string('toInterestId')
    t.string('message') // Optional message
    t.string('phone') // Optional phone number
    t.string('instagram') // Optional instagram handle
  },
})

export const CreatePartnerRequest = mutationField('createPartnerRequest', {
  type: PartnerRequest,
  args: {
    input: nonNull(arg({ type: 'CreatePartnerRequestInput' })),
  },
  resolve: async (_root, { input }, ctx) => {
    if (!ctx.user) {
      throw new Error('Not authenticated')
    }

    const pg = getKysely()
    const { fromInterestId, toInterestId, message } = input

    // Check that target interest exists and is ACTIVE or PARTIALLY_FILLED
    const toInterest = await pg
      .selectFrom('PartnerInterest')
      .where('id', '=', toInterestId)
      .selectAll()
      .executeTakeFirst()

    if (!toInterest) {
      throw new Error('Target interest not found.')
    }
    if (toInterest.status !== 'ACTIVE' && toInterest.status !== 'PARTIALLY_FILLED') {
      throw new Error('Target interest is not accepting new requests.')
    }

    // Prevent self-request
    if (toInterest.userId === ctx.user.id) {
      throw new Error('Cannot send a request to yourself.')
    }

    let fromUserId: string | null = null

    if (fromInterestId) {
      // Interest-to-interest request
      const fromInterest = await pg
        .selectFrom('PartnerInterest')
        .where('id', '=', fromInterestId)
        .selectAll()
        .executeTakeFirst()

      if (!fromInterest) {
        throw new Error('Source interest not found.')
      }
      if (
        fromInterest.status !== 'ACTIVE' &&
        fromInterest.status !== 'PARTIALLY_FILLED'
      ) {
        throw new Error('Source interest is not accepting new requests.')
      }
      if (fromInterest.userId !== ctx.user.id) {
        throw new Error('You can only send requests from your own interests.')
      }

      // Check for duplicate interest-to-interest request
      const existing = await pg
        .selectFrom('PartnerRequest')
        .where('fromInterestId', '=', fromInterestId)
        .where('toInterestId', '=', toInterestId)
        .where('status', '=', 'PENDING')
        .select('id')
        .executeTakeFirst()
      if (existing) {
        throw new Error('A pending request already exists.')
      }
    } else {
      // Direct user-to-interest request
      fromUserId = ctx.user.id

      // Check for duplicate user-to-interest request
      const existing = await pg
        .selectFrom('PartnerRequest')
        .where('fromUserId', '=', fromUserId)
        .where('toInterestId', '=', toInterestId)
        .where('status', '=', 'PENDING')
        .select('id')
        .executeTakeFirst()
      if (existing) {
        throw new Error('A pending request already exists.')
      }
    }

    // Create the request
    const trimmedMessage = message?.trim() || null
    const now = new Date()
    const [created] = await pg
      .insertInto('PartnerRequest')
      .values({
        fromInterestId: fromInterestId,
        fromUserId: fromUserId,
        toInterestId: toInterestId,
        message: trimmedMessage,
        phone: input.phone,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
        instagram: input.instagram,
      })
      .returningAll()
      .execute()

    // Send email notification to the recipient
    try {
      const recipientUser = await ctx.loaders.userByIdLoader.load(toInterest.userId)
      const requesterUser = fromUserId
        ? await ctx.loaders.userByIdLoader.load(fromUserId)
        : null
      const category = await ctx.loaders.categoryByIdLoader.load(toInterest.categoryId)

      if (recipientUser && category) {
        const directoryComp = await ctx.loaders.directoryCompByIdLoader.load(
          category.directoryCompId,
        )

        if (directoryComp) {
          const requesterName = requesterUser ? requesterUser.firstName : 'Someone' // Fallback for interest-to-interest requests

          await sendPartnerRequestReceivedEmail({
            recipientEmail: recipientUser.email,
            recipientName: recipientUser.firstName,
            requesterName,
            competitionTitle: directoryComp.title,
            category: {
              difficulty: category.difficulty,
              gender: category.gender,
              teamSize: category.teamSize,
            },
            message: message || undefined,
            phone: input.phone || undefined,
          })
        }
      }
    } catch (emailError) {
      console.error('Failed to send partner request received email:', emailError)
      // Don't throw error - email failure shouldn't break the mutation
    }

    // Send admin notification email
    try {
      const requesterUser = fromUserId
        ? await ctx.loaders.userByIdLoader.load(fromUserId)
        : null
      const category = await ctx.loaders.categoryByIdLoader.load(toInterest.categoryId)

      if (category) {
        const directoryComp = await ctx.loaders.directoryCompByIdLoader.load(
          category.directoryCompId,
        )

        if (directoryComp && requesterUser) {
          const mailgunManager = new MailgunManager()
          await mailgunManager.sendEmail({
            to: 'nickoferrall@gmail.com',
            subject: 'New Partner Request Created',
            body: `
New partner request created!

Requester: ${requesterUser.firstName} ${requesterUser.lastName || ''} (${requesterUser.email})
Competition: ${directoryComp.title}
Category: ${category.difficulty} ${category.gender} (Team of ${category.teamSize})
${message ? `Message: ${message}` : ''}
${input.phone ? `Phone: ${input.phone}` : ''}

Created at: ${new Date().toLocaleString()}
            `,
            html: `
<h2>New Partner Request Created!</h2>
<p><strong>Requester:</strong> ${requesterUser.firstName} ${requesterUser.lastName || ''} (${requesterUser.email})</p>
<p><strong>Competition:</strong> ${directoryComp.title}</p>
<p><strong>Category:</strong> ${category.difficulty} ${category.gender} (Team of ${category.teamSize})</p>
${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ''}
<p><strong>Created at:</strong> ${new Date().toLocaleString()}</p>
            `,
          })
        }
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError)
      // Don't throw error - email failure shouldn't break the mutation
    }

    return created
  },
})
