import { objectType, enumType } from 'nexus'

export const PartnerInterestTeamMemberStatus = enumType({
  name: 'PartnerInterestTeamMemberStatus',
  members: ['INVITED', 'ACCEPTED', 'REJECTED'],
})

export const PartnerInterestTeamMember = objectType({
  name: 'PartnerInterestTeamMember',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('partnerInterestId')
    t.nonNull.string('name')
    t.nonNull.string('email')
    t.string('userId')
    t.nonNull.field('status', { type: 'PartnerInterestTeamMemberStatus' })
    t.string('invitationToken')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })

    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.userId) return null
        return ctx.loaders.userByIdLoader.load(parent.userId)
      },
    })

    t.field('partnerInterest', {
      type: 'PartnerInterest',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.partnerInterestByIdLoader.load(parent.partnerInterestId)
      },
    })
  },
})
