import { objectType } from 'nexus'

export const Org = objectType({
  name: 'Org',
  definition(t) {
    t.string('id')
    t.string('name')
    t.nonNull.string('email')
    t.string('description')
    t.string('contactNumber')
    t.nullable.string('website')
    t.nullable.string('logo')
    t.nullable.string('facebook')
    t.nullable.string('instagram')
    t.nullable.string('twitter')
    t.nullable.string('youtube')
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
  },
})
