import { enumType, objectType, extendType, nonNull, stringArg, booleanArg } from 'nexus'
import { Currency } from './Competition'
import { Category } from './Category'
import { Currency as TCurrency, Difficulty } from '../../src/generated/graphql'
import getRedis from '../../utils/getRedis'

export const DirectoryCompType = enumType({
  name: 'DirectoryCompType',
  members: ['CROSSFIT', 'HYROX', 'HYROX_SIMULATION', 'OTHER'],
})

export const DirectoryComp = objectType({
  name: 'DirectoryComp',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('title')
    t.string('teamSize')
    t.nonNull.string('location')
    t.nonNull.string('country')
    t.nonNull.string('state')
    t.nonNull.field('startDate', { type: 'DateTime' })
    t.field('endDate', { type: 'DateTime' })
    t.float('price')
    t.field('currency', { type: Currency })
    t.string('website')
    t.string('email')
    t.string('logo')
    t.string('description')
    t.string('instagramHandle')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.string('competitionId')
    t.field('competition', {
      type: 'Competition',
      resolve: async (parent, _args, ctx) => {
        if (!parent.competitionId) return null
        return ctx.loaders.competitionLoader.load(parent.competitionId)
      },
    })
    t.list.nonNull.field('categories', {
      type: Category,
      resolve: async ({ id }, _, ctx) => {
        const categoriesDB = await ctx.loaders.categoriesByDirectoryCompIdLoader.load(id)
        return categoriesDB.map((category) => ({
          ...category,
          difficulty: category.difficulty as Difficulty,
          gender: category.gender as 'FEMALE' | 'MALE' | 'MIXED',
          isSoldOut: !!category.isSoldOut,
          teamSize: category.teamSize || 0,
          tags: category.tags || [],
        }))
      },
    })
    t.string('ctaLink')
    t.string('ticketWebsite')
    t.string('region')
  },
})

export const GetDirectoryComps = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getDirectoryComps', {
      args: {
        initialLoad: nonNull(booleanArg({ default: false })),
      },
      type: 'DirectoryComp',
      resolve: async (_src, { initialLoad }, { loaders }) => {
        const directoryComps = await loaders.directoryCompsLoader.load('all')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let filtered = directoryComps
          .filter((comp) => {
            const startDate = new Date(comp.startDate)
            return startDate >= today
          })
          .sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          )

        // Get categories for all comps regardless of initial load
        const compIds = filtered.map((comp) => comp.id)
        const categoriesMap = new Map()
        const allCategories =
          await loaders.categoriesByDirectoryCompIdLoader.loadMany(compIds)

        compIds.forEach((id, index) => {
          categoriesMap.set(id, allCategories[index] || [])
        })

        filtered = filtered.map((comp) => ({
          ...comp,
          price: comp.price ? parseFloat(comp.price) : null,
          currency: comp.currency as TCurrency,
          categories: categoriesMap.get(comp.id) || [],
        }))

        // For initial load, only return first 10 events after processing
        if (initialLoad) {
          filtered = filtered.slice(0, 10)
        }

        return filtered
      },
    })
  },
})

export const GetDirectoryComp = extendType({
  type: 'Query',
  definition(t) {
    t.field('getDirectoryComp', {
      type: 'DirectoryComp',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_src, { id }, { loaders }) => {
        const directoryComps = await loaders.directoryCompsLoader.load('all')
        const comp = directoryComps.find((comp) => comp.id === id)

        if (!comp) return null

        return {
          ...comp,
          price: comp.price ? parseFloat(comp.price) : null,
          currency: comp.currency as TCurrency,
        }
      },
    })
  },
})

export const GetAllDirectoryComps = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getAllDirectoryComps', {
      type: 'DirectoryComp',
      resolve: async (_src, _, { loaders }) => {
        // Direct database fetch without Redis caching
        const directoryComps = await loaders.directoryCompsLoader.load('all')

        return directoryComps.map((comp) => ({
          ...comp,
          price: comp.price ? parseFloat(comp.price) : null,
          currency: comp.currency as TCurrency,
        }))
      },
    })
  },
})
