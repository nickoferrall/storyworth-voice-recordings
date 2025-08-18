import { extendType, nonNull, inputObjectType } from 'nexus'
import getKysely from '../../src/db'
import { Gender } from '../types/Competition'

export const CategoryInput = inputObjectType({
  name: 'CategoryInput',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.field('gender', { type: Gender })
    t.nonNull.int('teamSize')
    t.nonNull.field('difficulty', {
      type: 'Difficulty',
    })
    t.nonNull.boolean('isSoldOut')
    t.nonNull.list.nonNull.string('tags')
  },
})

export const UpdateDirectoryCompInput = inputObjectType({
  name: 'UpdateDirectoryCompInput',
  definition(t) {
    t.nonNull.string('id')
    t.string('title')
    t.string('location')
    t.string('country')
    t.float('price')
    t.field('currency', {
      type: 'Currency',
    })
    t.string('startDate')
    t.string('endDate')
    t.string('website')
    t.string('ticketWebsite')
    t.string('ctaLink')
    t.string('email')
    t.string('logo')
    t.string('instagramHandle')
    t.string('description')
    t.list.nonNull.field('categories', { type: CategoryInput })
  },
})

export const UpdateDirectoryComp = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateDirectoryComp', {
      type: 'DirectoryComp',
      args: {
        input: nonNull(UpdateDirectoryCompInput),
      },
      resolve: async (_root, { input }, ctx) => {
        const pg = getKysely()
        const { id, categories, ...updates } = input
        console.log('🚀 ~ input:', input)

        // Convert date strings to Date objects if they exist
        const processedUpdates = {
          ...updates,
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.endDate ? new Date(updates.endDate) : undefined,
        }

        // Update main DirectoryComp record
        await pg
          .updateTable('DirectoryComp')
          .set(
            Object.fromEntries(
              Object.entries(processedUpdates).filter(([_, v]) => v !== null),
            ),
          )
          .where('id', '=', id)
          .execute()
        // If categories were provided, update them
        if (categories) {
          // Delete existing categories
          await pg.deleteFrom('Category').where('directoryCompId', '=', id).execute()

          // Insert new categories
          if (categories.length > 0) {
            await pg
              .insertInto('Category')
              .values(
                categories.map((cat) => ({
                  ...cat,
                  directoryCompId: id,
                })),
              )
              .execute()
          }
        }

        // Return updated comp
        const updatedComp = await ctx.loaders.directoryCompByIdLoader.load(id)
        return updatedComp as any
      },
    })
  },
})
