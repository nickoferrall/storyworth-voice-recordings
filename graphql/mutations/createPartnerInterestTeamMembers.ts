import { mutationField, nonNull, inputObjectType, list, stringArg, arg } from 'nexus'
import getKysely from '../../src/db'
import MailgunManager from '../../lib/MailgunManager'
import shortUUID from 'short-uuid'

export const TeamMemberInputForInterest = inputObjectType({
  name: 'TeamMemberInputForInterest',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.string('email')
  },
})

export const CreatePartnerInterestTeamMembers = mutationField(
  'createPartnerInterestTeamMembers',
  {
    type: list('PartnerInterestTeamMember'),
    args: {
      partnerInterestId: nonNull(stringArg()),
      teamMembers: nonNull(list(nonNull(arg({ type: 'Json' })))),
    },
    resolve: async (_root, { partnerInterestId, teamMembers }, ctx) => {
      if (!ctx.user) {
        throw new Error('Not authenticated')
      }

      const pg = getKysely()

      // Verify the partner interest exists and belongs to the user
      const partnerInterest = await pg
        .selectFrom('PartnerInterest')
        .where('id', '=', partnerInterestId)
        .where('userId', '=', ctx.user.id)
        .selectAll()
        .executeTakeFirst()

      if (!partnerInterest) {
        throw new Error(
          'Partner interest not found or you do not have permission to modify it',
        )
      }

      // Get category and competition info for emails
      const category = await ctx.loaders.categoryByIdLoader.load(
        partnerInterest.categoryId,
      )
      if (!category) {
        throw new Error('Category not found')
      }

      const directoryComp = await ctx.loaders.directoryCompByIdLoader.load(
        category.directoryCompId,
      )
      if (!directoryComp) {
        throw new Error('Competition not found')
      }

      const createdMembers: any[] = []
      const mailgunManager = new MailgunManager()

      for (const member of teamMembers) {
        // Check if user already exists
        const existingUser = await ctx.loaders.userByEmailLoader.load(member.email)

        // Generate invitation token
        const invitationToken = shortUUID.generate()

        // Create team member record
        const now = new Date()
        const teamMember = await pg
          .insertInto('PartnerInterestTeamMember')
          .values({
            partnerInterestId,
            name: member.name,
            email: member.email,
            userId: existingUser?.id || null,
            status: 'INVITED',
            invitationToken,
            createdAt: now,
            updatedAt: now,
          })
          .returningAll()
          .executeTakeFirst()

        if (teamMember) {
          createdMembers.push(teamMember)

          // TODO: Email functionality disabled for now to keep things simple
          // In the future, we can add logic to invite team members and get them to create accounts
        }
      }

      return createdMembers
    },
  },
)
