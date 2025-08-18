import { objectType, enumType } from 'nexus'

export const CompetitionEditSuggestionStatus = enumType({
  name: 'CompetitionEditSuggestionStatus',
  members: ['PENDING', 'APPROVED', 'REJECTED'],
})

export const CompetitionEditSuggestion = objectType({
  name: 'CompetitionEditSuggestion',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('competitionId')
    t.nonNull.string('userId')
    t.nonNull.string('suggestedChanges') // JSON string of changes
    t.string('reason')
    t.nonNull.field('status', { type: CompetitionEditSuggestionStatus })
    t.string('reviewedBy')
    t.field('reviewedAt', { type: 'DateTime' })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })

    // Resolve competition
    t.field('competition', {
      type: 'Competition',
      resolve: async ({ competitionId }, _, ctx) => {
        return ctx.loaders.competitionLoader.load(competitionId)
      },
    })

    // Resolve user who made the suggestion
    t.field('user', {
      type: 'User',
      resolve: async ({ userId }, _, ctx) => {
        return ctx.loaders.userByIdLoader.load(userId)
      },
    })

    // Resolve reviewer (if reviewed)
    t.field('reviewer', {
      type: 'User',
      resolve: async ({ reviewedBy }, _, ctx) => {
        if (!reviewedBy) return null
        return ctx.loaders.userByIdLoader.load(reviewedBy)
      },
    })
  },
})
