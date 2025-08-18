import { extendType, nonNull, stringArg, list } from 'nexus'
import getKysely from '../../src/db'
import { nanoid } from 'nanoid'

export const ApprovePotentialCompetitions = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('approvePotentialCompetitions', {
      type: 'String',
      args: {
        potentialCompetitionIds: nonNull(list(nonNull(stringArg()))),
      },
      resolve: async (_parent, { potentialCompetitionIds }, { user }) => {
        if (!user?.isSuperUser) {
          throw new Error('Access denied. Super user privileges required.')
        }

        const db = getKysely()

        // Process competitions in batches to avoid overwhelming database connections
        const BATCH_SIZE = 10 // Process 10 competitions at a time
        const results: Array<{ id: string; success: boolean; error: string | null }> = []

        console.log(
          `Processing ${potentialCompetitionIds.length} competitions in batches of ${BATCH_SIZE}`,
        )

        // Process in batches
        for (let i = 0; i < potentialCompetitionIds.length; i += BATCH_SIZE) {
          const batch = potentialCompetitionIds.slice(i, i + BATCH_SIZE)
          console.log(
            `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(potentialCompetitionIds.length / BATCH_SIZE)} (${batch.length} competitions)`,
          )

          const batchResults = await Promise.all(
            batch.map(async (potentialCompetitionId) => {
              try {
                return await db.transaction().execute(async (trx) => {
                  // Get the potential competition
                  const potentialComp = await trx
                    .selectFrom('PotentialCompetition')
                    .selectAll()
                    .where('id', '=', potentialCompetitionId)
                    .where('status', '=', 'PENDING')
                    .executeTakeFirst()

                  if (!potentialComp) {
                    console.warn(
                      `Potential competition ${potentialCompetitionId} not found or already processed`,
                    )
                    return {
                      id: potentialCompetitionId,
                      success: false,
                      error: 'Competition not found or already processed',
                    }
                  }

                  // Create the real competition
                  const competitionId = nanoid(6)
                  const mapSource = (src: string | null | undefined): string => {
                    const s = (src || '').toUpperCase()
                    if (s === 'OFFICIAL_HYROX') return 'OFFICIAL_HYROX'
                    if (s === 'SCRAPED_ARETAS' || s === 'SCRAPED_COMP_CORNER') return s
                    return 'USER_CREATED'
                  }

                  const competition = await trx
                    .insertInto('Competition')
                    .values({
                      id: competitionId,
                      name: potentialComp.name!,
                      description: potentialComp.description,
                      startDateTime: potentialComp.startDateTime!,
                      endDateTime: potentialComp.endDateTime!,
                      addressId: potentialComp.addressId,
                      timezone: potentialComp.timezone,
                      logo: potentialComp.logo,
                      website: potentialComp.website,
                      email: potentialComp.email,
                      instagramHandle: potentialComp.instagramHandle,
                      currency: potentialComp.currency,
                      price: potentialComp.price ? Number(potentialComp.price) : null,
                      source: mapSource(potentialComp.source!),
                      country: potentialComp.country,
                      state: potentialComp.state,
                      region: potentialComp.region,
                      orgName: potentialComp.orgName,
                      createdByUserId: null, // Scraped competitions don't have a creator
                      registrationEnabled: false, // Disable registration for scraped comps
                      isActive: true, // Make sure competition is active and visible
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()
                  console.log('🚀 ~ competition:', competition)

                  // Move potential ticket types to real ticket types
                  const potentialTicketTypes = await trx
                    .selectFrom('PotentialTicketType')
                    .selectAll()
                    .where('potentialCompetitionId', '=', potentialCompetitionId)
                    .execute()

                  if (potentialTicketTypes.length > 0) {
                    await trx
                      .insertInto('TicketType')
                      .values(
                        potentialTicketTypes.map((ptt) => ({
                          name: ptt.name!,
                          description: ptt.description,
                          competitionId: competition.id,
                          price: Number(ptt.price),
                          currency: ptt.currency as any,
                          maxEntries: ptt.maxEntries!,
                          teamSize: Number(ptt.teamSize),
                          isVolunteer: ptt.isVolunteer!,
                          allowHeatSelection: ptt.allowHeatSelection!,
                          passOnPlatformFee: ptt.passOnPlatformFee!,
                        })),
                      )
                      .execute()
                  }

                  // Update potential competition status
                  await trx
                    .updateTable('PotentialCompetition')
                    .set({
                      status: 'APPROVED',
                      reviewedBy: user.id,
                      reviewedAt: new Date(),
                    })
                    .where('id', '=', potentialCompetitionId)
                    .execute()

                  return {
                    id: potentialCompetitionId,
                    success: true,
                    error: null,
                  }
                })
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : String(error)
                console.error(
                  `Error approving competition ${potentialCompetitionId}:`,
                  error,
                )
                return {
                  id: potentialCompetitionId,
                  success: false,
                  error: errorMessage,
                }
              }
            }),
          )

          // Add batch results to main results array
          results.push(...batchResults)
        }

        // Check if any failed and throw error with details
        const failed = results.filter(
          (r): r is { id: string; success: false; error: string } =>
            typeof r === 'object' && r !== null && 'success' in r && !r.success,
        )
        const successful = results.filter(
          (r) => typeof r === 'object' && r !== null && 'success' in r && r.success,
        )

        if (failed.length > 0) {
          const errorDetails = failed
            .map((f) => `Competition ${f.id}: ${f.error}`)
            .join('; ')
          throw new Error(
            `Failed to approve ${failed.length} out of ${potentialCompetitionIds.length} competitions. Errors: ${errorDetails}`,
          )
        }

        return `Successfully approved all ${successful.length} competitions`
      },
    })
  },
})

export const RejectPotentialCompetitions = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('rejectPotentialCompetitions', {
      type: 'String',
      args: {
        potentialCompetitionIds: nonNull(list(nonNull(stringArg()))),
      },
      resolve: async (_parent, { potentialCompetitionIds }, { user }) => {
        if (!user?.isSuperUser) {
          throw new Error('Access denied. Super user privileges required.')
        }

        const db = getKysely()

        const results = await Promise.all(
          potentialCompetitionIds.map(async (id) => {
            try {
              const result = await db
                .updateTable('PotentialCompetition')
                .set({
                  status: 'REJECTED',
                  reviewedBy: user.id,
                  reviewedAt: new Date(),
                })
                .where('id', '=', id)
                .where('status', '=', 'PENDING')
                .executeTakeFirst()

              return result.numUpdatedRows > 0 ? 1 : 0
            } catch (error) {
              console.error(`Error rejecting competition ${id}:`, error)
              return 0
            }
          }),
        )

        let rejectedCount = 0
        for (const result of results) {
          if (result > 0) rejectedCount++
        }

        return `Successfully rejected ${rejectedCount} out of ${potentialCompetitionIds.length} competitions`
      },
    })
  },
})
