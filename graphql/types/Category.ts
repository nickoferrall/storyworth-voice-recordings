import { objectType } from 'nexus'
import { DirectoryComp } from './DirectoryComp'
import { Difficulty, Gender } from './Competition'

export const Category = objectType({
  name: 'Category',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('directoryCompId')
    t.nonNull.field('gender', { type: Gender })
    t.nonNull.int('teamSize')
    t.nonNull.int('price')
    t.nonNull.field('difficulty', { type: Difficulty })
    t.nonNull.boolean('isSoldOut')
    t.list.string('tags')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.field('directoryComp', {
      type: DirectoryComp,
      resolve: async ({ directoryCompId }, _, ctx) => {
        return ctx.loaders.directoryCompByIdLoader.load(directoryCompId)
      },
    })
  },
})
