import { objectType } from 'nexus'
import { User } from './User'

export const Payment = objectType({
  name: 'Payment',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('registrationId')
    t.nonNull.string('paymentIntentId')
    t.nonNull.int('amount')
    t.nonNull.string('currency')
    t.nonNull.string('status')
    t.nonNull.string('userId')
    t.field('user', {
      type: User,
      resolve: (parent, _args, ctx) => {
        return ctx.loaders.userByIdLoader.load(parent.userId) as any
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})
