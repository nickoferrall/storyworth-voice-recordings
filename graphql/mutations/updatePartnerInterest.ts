import { mutationField, nonNull, stringArg, list } from 'nexus'
import getKysely from '../../src/db'

export const UpdatePartnerInterest = mutationField('updatePartnerInterest', {
  type: 'PartnerInterest',
  args: {
    id: nonNull(stringArg()),
    categoryId: stringArg(),
    ticketTypeId: stringArg(),
    description: stringArg(),
    phone: stringArg(),
    instagram: stringArg(),
  },
  resolve: async (
    _root,
    { id, categoryId, ticketTypeId, description, phone, instagram },
    ctx,
  ) => {
    if (!ctx.user) {
      throw new Error('Not authenticated')
    }

    // Validate that either categoryId or ticketTypeId is provided, but not both
    const hasCategoryId = Boolean(categoryId)
    const hasTicketTypeId = Boolean(ticketTypeId)

    if ((!hasCategoryId && !hasTicketTypeId) || (hasCategoryId && hasTicketTypeId)) {
      throw new Error('Either categoryId or ticketTypeId must be provided, but not both')
    }

    const pg = getKysely()
    const interest = await pg
      .selectFrom('PartnerInterest')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
    if (!interest) {
      throw new Error('Partner interest not found')
    }
    if (interest.userId !== ctx.user.id) {
      throw new Error('Not authorized')
    }
    const updated = await pg
      .updateTable('PartnerInterest')
      .set({
        ...(categoryId ? { categoryId, ticketTypeId: null } : {}),
        ...(ticketTypeId ? { ticketTypeId, categoryId: null } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(instagram !== undefined ? { instagram } : {}),
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    return updated
  },
})
