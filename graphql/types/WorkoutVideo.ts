import { objectType } from 'nexus'

export const WorkoutVideo = objectType({
  name: 'WorkoutVideo',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('workoutId')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.string('url')
    t.nonNull.int('orderIndex')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})
