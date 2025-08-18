import { extendType, nonNull, stringArg, arg, floatArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdatePotentialCompetition = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updatePotentialCompetition', {
      type: 'String',
      args: {
        id: nonNull(stringArg()),
        name: stringArg(),
        description: stringArg(),
        startDateTime: arg({ type: 'DateTime' }),
        endDateTime: arg({ type: 'DateTime' }),
        website: stringArg(),
        email: stringArg(),
        instagramHandle: stringArg(),
        price: floatArg(),
        currency: stringArg(),
        country: stringArg(),
        state: stringArg(),
        region: stringArg(),
        venue: stringArg(),
        city: stringArg(),
      },
      resolve: async (
        _parent,
        {
          id,
          name,
          description,
          startDateTime,
          endDateTime,
          website,
          email,
          instagramHandle,
          price,
          currency,
          country,
          state,
          region,
          venue,
          city,
        },
        { user },
      ) => {
        if (!user?.isSuperUser) {
          throw new Error('Access denied. Super user privileges required.')
        }

        const db = getKysely()

        await db.transaction().execute(async (trx) => {
          const potential = await trx
            .selectFrom('PotentialCompetition')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst()

          if (!potential) throw new Error('Potential competition not found')

          let addressId = potential.addressId as string | null

          if (venue !== undefined || city !== undefined || country !== undefined) {
            if (!addressId) {
              const addr = await trx
                .insertInto('Address')
                .values({
                  venue: venue ?? null,
                  street: null,
                  city: city ?? null,
                  postcode: null,
                  country: country ?? null,
                })
                .returningAll()
                .executeTakeFirstOrThrow()
              addressId = addr.id
            } else {
              await trx
                .updateTable('Address')
                .set({
                  venue: venue ?? undefined,
                  city: city ?? undefined,
                  country: country ?? undefined,
                })
                .where('id', '=', addressId)
                .execute()
            }
          }

          await trx
            .updateTable('PotentialCompetition')
            .set({
              name: name ?? undefined,
              description: description ?? undefined,
              startDateTime: startDateTime ?? undefined,
              endDateTime: endDateTime ?? undefined,
              website: website ?? undefined,
              email: email ?? undefined,
              instagramHandle: instagramHandle ?? undefined,
              price: price ?? undefined,
              currency: currency ?? undefined,
              country: country ?? undefined,
              state: state ?? undefined,
              region: region ?? undefined,
              addressId: addressId ?? undefined,
              updatedAt: new Date(),
            })
            .where('id', '=', id)
            .execute()
        })

        return 'OK'
      },
    })
  },
})
