import { extendType, nonNull, objectType, stringArg } from 'nexus'

export const Referral = objectType({
  name: 'Referral',
  definition(t) {
    t.string('id')
    t.string('referrerId')
    t.string('referredId')
    t.field('createdAt', { type: 'DateTime' })
    // t.field('usersReferredByViewer', {
    //   type: 'User',
    //   resolve: async (parent, _args, ctx) => {
    //     const user = await getUserByIdInDb({
    //       id: parent.referredId,
    //     })
    //     return user
    //   },
    // })
  },
})

export const CreateReferralMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createReferral', {
      type: Referral,
      args: {
        referrerId: nonNull(stringArg()),
        referredId: nonNull(stringArg()),
      },
      resolve: async (_parent, { referrerId, referredId }, ctx) => {
        return null
      },
    })
  },
})

export const CheckReferralCodeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('checkReferralCode', {
      type: 'Boolean',
      args: {
        referralCode: nonNull(stringArg()),
      },
      resolve: async (_parent, { referralCode }, ctx) => {
        // const viewerReferralCode = ctx.user.referralCode
        // if (viewerReferralCode === referralCode) {
        //   return false
        // }

        // const res = await checkValidReferralCodeInDb({ referralCode })
        // return res.exists
        return true
      },
    })
  },
})
