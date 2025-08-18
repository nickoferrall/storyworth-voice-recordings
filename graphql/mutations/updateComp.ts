import { extendType, nonNull, stringArg, arg, list } from 'nexus'
import { Competition, CompetitionType } from '../types/Competition'
import getKysely from '../../src/db'
import { updateSubsequentHeatTimes } from '../../utils/updateSubsequentHeatTimes'
import { v4 as uuidv4 } from 'uuid'

export const UpdateCompetitionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateCompetition', {
      type: Competition,
      args: {
        id: nonNull(stringArg()),
        name: stringArg(),
        email: stringArg(),
        types: list(arg({ type: CompetitionType })),
        description: stringArg(),
        startDateTime: arg({ type: 'DateTime' }),
        endDateTime: arg({ type: 'DateTime' }),
        venue: stringArg(),
        street: stringArg(),
        city: stringArg(),
        country: stringArg(),
        postcode: stringArg(),
        orgName: stringArg(),
        facebook: stringArg(),
        instagram: stringArg(),
        twitter: stringArg(),
        youtube: stringArg(),
        timezone: stringArg(),
        registrationEnabled: arg({ type: 'Boolean' }),
      },
      resolve: async (
        _parent,
        {
          id,
          name,
          email,
          types,
          description,
          startDateTime,
          endDateTime,
          venue,
          street,
          city,
          country,
          postcode,
          orgName,
          facebook,
          instagram,
          twitter,
          youtube,
          timezone,
          registrationEnabled,
        },
        ctx,
      ) => {
        try {
          const pg = getKysely()

          return await pg.transaction().execute(async (trx) => {
            // Fetch the competition
            const comp = await trx
              .selectFrom('Competition')
              .where('id', '=', id)
              .selectAll()
              .executeTakeFirst()

            if (!comp) {
              throw new Error('Competition not found')
            }

            // Handle address updates - create new address if any address fields are provided
            let newAddressId = comp.addressId
            if (
              venue !== undefined ||
              street !== undefined ||
              city !== undefined ||
              country !== undefined ||
              postcode !== undefined
            ) {
              // Create a new address record for this competition
              const newAddress = await trx
                .insertInto('Address')
                .values({
                  id: uuidv4(),
                  venue: venue ?? undefined,
                  street: street ?? undefined,
                  city: city ?? undefined,
                  country: country ?? undefined,
                  postcode: postcode ?? undefined,
                })
                .returningAll()
                .executeTakeFirstOrThrow()

              newAddressId = newAddress.id
            }

            // Update the competition with orgName and other fields
            const competition = await trx
              .updateTable('Competition')
              .set({
                name: name ?? undefined,
                description: description ?? undefined,
                startDateTime: startDateTime ?? undefined,
                endDateTime: endDateTime ?? undefined,
                addressId: newAddressId,
                orgName: orgName ?? undefined,
                email: email ?? undefined,
                website: undefined, // Remove this if it doesn't exist in the schema
                instagramHandle: instagram ?? undefined,
                types:
                  types && types.length
                    ? types
                        .filter((type: any) => type !== undefined)
                        .map((type: any) => type!.toString())
                    : comp.types,
                timezone: timezone ?? undefined,
                registrationEnabled: registrationEnabled ?? undefined,
              })
              .where('id', '=', id)
              .returningAll()
              .executeTakeFirstOrThrow()

            // Update Org social links if provided
            if (
              comp.orgId &&
              (facebook !== undefined ||
                instagram !== undefined ||
                twitter !== undefined ||
                youtube !== undefined)
            ) {
              await trx
                .updateTable('Org')
                .set({
                  facebook: facebook ?? undefined,
                  instagram: instagram ?? undefined,
                  twitter: twitter ?? undefined,
                  youtube: youtube ?? undefined,
                })
                .where('id', '=', comp.orgId)
                .execute()
            }

            // If start time has changed, update all heat times
            if (
              startDateTime &&
              startDateTime.getTime() !== comp.startDateTime.getTime()
            ) {
              console.log('UPDATING')

              await updateSubsequentHeatTimes(id, startDateTime, ctx, trx).catch(
                (error) => {
                  console.error('Error updating heat times:', error)
                },
              )
            }

            // TODO: fix type
            return competition as any
          })
        } catch (error: any) {
          console.error('Error during competition update:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
