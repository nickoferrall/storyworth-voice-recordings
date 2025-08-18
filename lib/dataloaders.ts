import DataLoader from 'dataloader'
import getKysely from '../src/db'
import { Context } from '../graphql/context'
import { createEntryLoaders } from './loaders/entryLoaders'
import { Competition, UserProfile } from '../src/generated/database'
import getRedis from '../utils/getRedis'
import { checkCompetitionOwnership } from '../utils/checkCompetitionOwnership'
import * as Sentry from '@sentry/nextjs'

export const createDataLoaders = (ctx: Context) => {
  const pg = getKysely()

  const userByIdLoader = new DataLoader<string, any>(async (keys) => {
    const profiles = await pg
      .selectFrom('UserProfile')
      .selectAll()
      .where('id', 'in', keys)
      .execute()

    return keys.map((id) => profiles.find((p) => p.id === id) || null)
  })

  const userByEmailLoader = new DataLoader<string, any>(async (emails) => {
    const profiles = await pg
      .selectFrom('UserProfile')
      .selectAll()
      .where('email', 'in', emails)
      .execute()

    return emails.map((email) => profiles.find((p) => p.email === email) || null)
  })

  const partnerInterestByIdLoader = new DataLoader<string, any>(async (ids) => {
    const interests = await pg
      .selectFrom('PartnerInterest')
      .selectAll()
      .where('id', 'in', ids)
      .execute()
    return ids.map((id) => interests.find((i) => i.id === id) || null)
  })

  return {
    userByIdLoader,
    userByEmailLoader,
    registrationFieldByIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const pgLocal = getKysely()
      const fields = await pgLocal
        .selectFrom('RegistrationField')
        .where('id', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => fields.find((f) => f.id === key) || null)
    }),
    teamLoader: new DataLoader(async (keys) => {
      const teams = await pg
        .selectFrom('Team')
        .where('id', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => {
        const team = teams.find((team) => team.id === key)
        if (!team) throw new Error(`Team not found for id: ${key}`)
        return team
      })
    }),
    invitationByTeamIdLoader: new DataLoader(async (teamIds: readonly string[]) => {
      const invitations = await pg
        .selectFrom('Invitation')
        .where('teamId', 'in', teamIds)
        .where('email', 'is', null)
        .selectAll()
        .execute()

      return teamIds.map(
        (teamId) =>
          invitations.find((invitation) => invitation.teamId === teamId) || null,
      )
    }),
    teamByUserIdAndTicketTypeIdLoader: new DataLoader(
      async (keys: readonly { userId: string; ticketTypeId: string }[]) => {
        const entries = await pg
          .selectFrom('Entry')
          .innerJoin('Team', 'Team.id', 'Entry.teamId')
          .where(
            'Entry.userId',
            'in',
            keys.map((k) => k.userId),
          )
          .where(
            'Entry.ticketTypeId',
            'in',
            keys.map((k) => k.ticketTypeId),
          )
          .selectAll('Entry')
          .select(['Team.name as teamName'])
          .execute()

        return keys.map((key) => {
          const entry = entries.find(
            (e) => e.userId === key.userId && e.ticketTypeId === key.ticketTypeId,
          )
          return entry || null
        })
      },
    ),
    heatLoader: new DataLoader(async (keys) => {
      const heats = await pg
        .selectFrom('Heat')
        .where('id', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => {
        const heat = heats.find((heat) => heat.id === key)
        if (!heat) throw new Error(`Heat not found for id: ${key}`)
        return heat
      })
    }),
    competitionLoader: new DataLoader(async (keys) => {
      const competitions = await pg
        .selectFrom('Competition')
        .where('id', 'in', keys as string[])
        .where('isActive', '=', true)
        .selectAll()
        .execute()

      return keys.map((key) => {
        const competition = competitions.find((competition) => competition.id === key)
        if (!competition) {
          // Create error with rich context for Sentry
          const error = new Error(`Competition not found for id: ${key}`)
          error.name = 'CompetitionNotFoundError'

          // Capture in Sentry with detailed context
          Sentry.captureException(error, {
            tags: {
              component: 'competitionLoader',
              errorType: 'missing_competition',
            },
            extra: {
              missingId: key,
              keyType: typeof key,
              keyLength: String(key)?.length,
              foundCompetitionIds: competitions.map((c) => c.id),
              requestedKeys: keys,
              totalRequested: keys.length,
              totalFound: competitions.length,
              isInactive:
                competitions.length === 0 ? 'unknown' : 'competition_exists_but_inactive',
            },
          })

          return null // Return null to prevent query failure
        }
        return competition
      })
    }),
    ticketTypeLoader: new DataLoader(async (keys) => {
      const ticketTypes = await pg
        .selectFrom('TicketType')
        .where('id', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => ticketTypes.find((ticketType) => ticketType.id === key))
    }),
    lastCreatedTicketTypeLoader: new DataLoader(async (keys) => {
      const results = await pg
        .selectFrom('TicketType')
        .where('competitionId', 'in', keys as string[])
        .orderBy('createdAt', 'desc')
        .selectAll()
        .execute()

      return keys.map((key) =>
        results.find((ticketType) => ticketType.competitionId === key),
      )
    }),
    earlyBirdByTicketTypeLoader: new DataLoader(async (keys) => {
      const results = await pg
        .selectFrom('EarlyBird')
        .where('ticketTypeId', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) =>
        results.find((earlyBird) => earlyBird.ticketTypeId === key),
      )
    }),
    ticketTypeByRegistrationFieldIdLoader: new DataLoader(async (keys) => {
      const results = await pg
        .selectFrom('TicketType')
        .innerJoin(
          'RegistrationFieldTicketTypes',
          'TicketType.id',
          'RegistrationFieldTicketTypes.ticketTypeId',
        )
        .where('RegistrationFieldTicketTypes.registrationFieldId', 'in', keys as string[])
        .selectAll('TicketType')
        .select(['RegistrationFieldTicketTypes.registrationFieldId'])
        .execute()

      return keys.map((key) =>
        results.filter((ticketType) => ticketType.registrationFieldId === key),
      )
    }),
    scoreSettingByCompIdLoader: new DataLoader(async (keys) => {
      const results = await pg
        .selectFrom('ScoreSetting')
        .where('competitionId', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) =>
        results.find((scoreSetting) => scoreSetting.competitionId === key),
      )
    }),
    scoreSettingByIdLoader: new DataLoader(async (keys) => {
      const results = await pg
        .selectFrom('ScoreSetting')
        .where('id', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => results.find((scoreSetting) => scoreSetting.id === key))
    }),
    scoresByEntryIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const scores = await pg
        .selectFrom('Score')
        .where('entryId', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => scores.filter((score) => score.entryId === key))
    }),
    scoresByEntryAndWorkoutIdsLoader: new DataLoader(
      async (keys: readonly { entryId: string; workoutId: string }[]) => {
        const scores = await pg
          .selectFrom('Score')
          .where(
            'entryId',
            'in',
            keys.map((k) => k.entryId),
          )
          .where(
            'workoutId',
            'in',
            keys.map((k) => k.workoutId),
          )
          .selectAll()
          .execute()

        return keys.map((key) => {
          return (
            scores.find(
              (score) =>
                score.entryId === key.entryId && score.workoutId === key.workoutId,
            ) || null
          )
        })
      },
    ),
    laneByHeatIdLoader: new DataLoader(async (keys) => {
      const lanes = await pg
        .selectFrom('Lane')
        .where('heatId', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => lanes.filter((lane) => lane.heatId === key))
    }),
    laneByEntryIdAndWorkoutIdLoader: new DataLoader(
      async (keys: readonly { entryId: string; workoutId: string }[]) => {
        const lanes = await pg
          .selectFrom('Lane')
          .innerJoin('Heat', 'Heat.id', 'Lane.heatId')
          .where(
            'Lane.entryId',
            'in',
            keys.map((k) => k.entryId),
          )
          .where(
            'Heat.workoutId',
            'in',
            keys.map((k) => k.workoutId),
          )
          .selectAll('Lane')
          .select('Heat.workoutId')
          .execute()

        return keys.map((key) => {
          const lane = lanes.find(
            (lane) => lane.entryId === key.entryId && lane.workoutId === key.workoutId,
          )
          return lane || null
        })
      },
    ),
    heatRegistrationsCountLoader: new DataLoader(
      async (keys: readonly { competitionId: string; heatId: string }[]) => {
        // Now all keys are guaranteed to be from the same competition due to cacheKeyFn
        const competitionId = keys[0].competitionId
        const heatIds = keys.map((k) => k.heatId)

        // Get the ScoreSetting for this competition
        const scoreSetting = await pg
          .selectFrom('ScoreSetting')
          .where('competitionId', '=', competitionId)
          .select(['heatLimitType'])
          .executeTakeFirst()

        // Build the counts query (clean, simple logic)
        let countsQuery = pg
          .selectFrom('Lane')
          .innerJoin('Entry', 'Entry.id', 'Lane.entryId')
          .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
          .where('Lane.heatId', 'in', heatIds)
          .groupBy('Lane.heatId')

        if (scoreSetting?.heatLimitType === 'ATHLETES') {
          countsQuery = countsQuery.select([
            'Lane.heatId',
            (eb) => eb.fn.sum('TicketType.teamSize').as('count'),
          ])
        } else {
          countsQuery = countsQuery.select([
            'Lane.heatId',
            (eb) => eb.fn.count('Lane.id').as('count'),
          ])
        }

        const counts = await countsQuery.execute()
        const countsMap = new Map<string, number>()

        for (const countRow of counts as { heatId: string; count: number | string }[]) {
          countsMap.set(countRow.heatId, parseInt(countRow.count.toString(), 10))
        }

        // Return counts in the same order as keys
        return keys.map(({ heatId }) => countsMap.get(heatId) || 0)
      },
      {
        // Custom cache key ensures batching only within same competition
        cacheKeyFn: (key) => `${key.competitionId}:${key.heatId}`,
      },
    ),

    entriesByHeatIdLoader: new DataLoader(async (heatIds: readonly string[]) => {
      const entries = await pg
        .selectFrom('Lane')
        .innerJoin('Entry', 'Entry.id', 'Lane.entryId')
        .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
        .where('Lane.heatId', 'in', heatIds)
        .select(['Lane.heatId', 'TicketType.teamSize'])
        .execute()

      return heatIds.map((heatId) => entries.filter((entry) => entry.heatId === heatId))
    }),
    workoutLoader: new DataLoader(async (keys) => {
      const workouts = await pg
        .selectFrom('Workout')
        .where('id', 'in', keys as string[])
        .orderBy('createdAt', 'asc')
        .orderBy('name', 'asc')
        .selectAll()
        .execute()

      return keys.map((key) => workouts.find((entry) => entry.id === key))
    }),
    registrationByCompetitionIdLoader: new DataLoader(async (keys) => {
      const registrations = await pg
        .selectFrom('Registration')
        .where('competitionId', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) =>
        registrations.filter((registration) => registration.competitionId === key),
      )
    }),
    ticketTypesByCompetitionIdLoader: new DataLoader(async (keys) => {
      const ticketTypes = await pg
        .selectFrom('TicketType')
        .where('competitionId', 'in', keys as string[])
        .selectAll()
        .orderBy('createdAt', 'asc')
        .execute()

      return keys.map((key) =>
        ticketTypes.filter((ticketType) => ticketType.competitionId === key),
      )
    }),
    heatsByCompetitionIdLoader: new DataLoader(async (keys) => {
      const heats = await pg
        .selectFrom('Heat')
        .innerJoin('Workout', 'Workout.id', 'Heat.workoutId')
        .where('Workout.competitionId', 'in', keys as string[])
        .selectAll('Heat')
        .select('Workout.competitionId')
        .orderBy('Heat.startTime', 'asc')
        .execute()

      return keys.map((key) => heats.filter((heat) => heat.competitionId === key))
    }),
    registrationFieldsByTicketTypeLoader: new DataLoader(
      async (keys: readonly string[]) => {
        // Single optimized query with all filtering in SQL
        const results = await pg
          .selectFrom('RegistrationField as rf')
          .innerJoin(
            'RegistrationFieldTicketTypes as rftt',
            'rf.id',
            'rftt.registrationFieldId',
          )
          .innerJoin('TicketType as tt', 'rftt.ticketTypeId', 'tt.id')
          .where('rftt.ticketTypeId', 'in', keys as string[])
          .where('rf.requiredStatus', '!=', 'OFF')
          .where((eb) =>
            eb.or([
              eb('tt.teamSize', '>', 1),
              eb('rf.onlyTeams', '=', false),
              eb('rf.onlyTeams', 'is', null),
            ]),
          )
          .orderBy('rf.sortOrder', 'asc')
          .selectAll('rf')
          .select('rftt.ticketTypeId')
          .execute()

        return keys.map((key) => results.filter((field) => field.ticketTypeId === key))
      },
    ),

    allRegistrationFieldsByTicketTypeLoader: new DataLoader(
      async (keys: readonly string[]) => {
        const results = await pg
          .selectFrom('RegistrationField')
          .innerJoin(
            'RegistrationFieldTicketTypes',
            'RegistrationField.id',
            'RegistrationFieldTicketTypes.registrationFieldId',
          )
          .where('RegistrationFieldTicketTypes.ticketTypeId', 'in', keys as string[])
          .orderBy('RegistrationField.sortOrder', 'asc')
          .selectAll('RegistrationField')
          .select('RegistrationFieldTicketTypes.ticketTypeId')
          .execute()

        return keys.map((key) => results.filter((field) => field.ticketTypeId === key))
      },
    ),

    heatsByWorkoutIdLoader: new DataLoader(async (keys) => {
      const heats = await pg
        .selectFrom('Heat')
        .selectAll()
        .where('workoutId', 'in', keys as string[])
        .orderBy('startTime', 'asc')
        .execute()

      return keys.map((key) => heats.filter((heat) => heat.workoutId === key))
    }),
    registrationAnswersLoader: new DataLoader(async (keys) => {
      const answers = await pg
        .selectFrom('RegistrationAnswer')
        .where('registrationId', 'in', keys as string[])
        .selectAll()
        .execute()

      return keys.map((key) => answers.filter((answer) => answer.registrationId === key))
    }),
    registrationTeamNameLoader: new DataLoader<
      { userId: string; ticketTypeId: string },
      string | null
    >(async (keys) => {
      const results = await pg
        .selectFrom('Team')
        .innerJoin('TeamMember', 'Team.id', 'TeamMember.teamId')
        .innerJoin('Registration', 'TeamMember.userId', 'Registration.userId')
        .where(
          'TeamMember.userId',
          'in',
          keys.map((key) => key.userId),
        )
        .where(
          'Registration.ticketTypeId',
          'in',
          keys.map((key) => key.ticketTypeId),
        )
        .select(['Team.name', 'TeamMember.userId', 'Registration.ticketTypeId'])
        .execute()

      return keys.map((key) => {
        const result = results.find(
          (res) => res.userId === key.userId && res.ticketTypeId === key.ticketTypeId,
        )
        return result ? result.name : null
      })
    }),
    teamMembersByTeamIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const teamMembers = await pg
        .selectFrom('TeamMember')
        .where('teamId', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => teamMembers.filter((member) => member.teamId === key))
    }),
    invitationsByTeamIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const invitations = await pg
        .selectFrom('Invitation')
        .where('teamId', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) =>
        invitations.filter((invitation) => invitation.teamId === key),
      )
    }),
    scoresByWorkoutIdLoader: new DataLoader(async (workoutIds: readonly string[]) => {
      const scores = await pg
        .selectFrom('Score')
        .where('workoutId', 'in', workoutIds)
        .selectAll()
        .execute()

      return workoutIds.map((id) => scores.filter((score) => score.workoutId === id))
    }),
    workoutsByCompetitionIdLoader: new DataLoader(async (keys) => {
      const workouts = await pg
        .selectFrom('Workout')
        .where('competitionId', 'in', keys as string[])
        .orderBy('createdAt', 'asc')
        .orderBy('name', 'asc')
        .selectAll()
        .execute()

      return keys.map((key) =>
        workouts.filter((workout) => workout.competitionId === key),
      )
    }),
    hasWorkoutsByCompetitionIdLoader: new DataLoader(async (keys) => {
      const workouts = await pg
        .selectFrom('Workout')
        .where('competitionId', 'in', keys as string[])
        .select('competitionId')
        .execute()

      const competitionIdSet = new Set(workouts.map((workout) => workout.competitionId))

      return keys.map((key) => competitionIdSet.has(key as string))
    }),
    competitionByWorkoutIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const results = await pg
        .selectFrom('Workout')
        .innerJoin('Competition', 'Workout.competitionId', 'Competition.id')
        .where('Workout.id', 'in', keys)
        .selectAll('Competition')
        .select(['Workout.id as workoutId'])
        .execute()

      return keys.map((key) => results.find((result) => result.workoutId === key) || null)
    }),
    teamByUserIdLoader: new DataLoader(
      async (keys: readonly { userId: string; competitionId: string }[]) => {
        const teamMembers = await pg
          .selectFrom('TeamMember')
          .innerJoin('Team', 'Team.id', 'TeamMember.teamId')
          .innerJoin('Entry', 'Entry.teamId', 'Team.id')
          .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
          .where(
            'TeamMember.userId',
            'in',
            keys.map((k) => k.userId),
          )
          .where(
            'TicketType.competitionId',
            'in',
            keys.map((k) => k.competitionId),
          )
          .selectAll('Team')
          .select(['TeamMember.userId', 'TicketType.competitionId'])
          .execute()

        return keys.map(({ userId, competitionId }) => {
          const teamForUser = teamMembers.find(
            (teamMember) =>
              teamMember.userId === userId && teamMember.competitionId === competitionId,
          )
          return teamForUser || null
        })
      },
      {
        // Custom cache key function to handle composite keys
        cacheKeyFn: (key) => `${key.userId}:${key.competitionId}`,
      },
    ),
    orgLoader: new DataLoader(async (keys: readonly string[]) => {
      const orgs = await pg
        .selectFrom('Org')
        .where('id', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => {
        const org = orgs.find((org) => org.id === key)
        if (!org) throw new Error(`Org not found for id: ${key}`)
        return org
      })
    }),

    addressLoader: new DataLoader(async (keys: readonly string[]) => {
      const addresses = await pg
        .selectFrom('Address')
        .where('id', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => {
        const address = addresses.find((address) => address.id === key)
        if (!address) throw new Error(`Address not found for id: ${key}`)
        return address
      })
    }),

    registrationCountLoader: new DataLoader(async (competitionIds: readonly string[]) => {
      const counts = await pg
        .selectFrom('Registration')
        .where('competitionId', 'in', competitionIds)
        .groupBy('competitionId')
        .select(['competitionId', (eb) => eb.fn.count('id').as('count')])
        .execute()

      const countMap = new Map(counts.map((c) => [c.competitionId, Number(c.count)]))
      return competitionIds.map((id) => countMap.get(id) || 0)
    }),

    participantsCountLoader: new DataLoader(async (competitionIds: readonly string[]) => {
      // Count solo participants (teamSize = 1)
      const soloCounts = await pg
        .selectFrom('Registration')
        .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
        .where('Registration.competitionId', 'in', competitionIds)
        .where('TicketType.teamSize', '=', 1)
        .groupBy('Registration.competitionId')
        .select([
          'Registration.competitionId',
          (eb) => eb.fn.count('Registration.id').as('count'),
        ])
        .execute()

      // Count team participants using the same logic as ParticipantsTable
      // Get all registrations for team ticket types and find their teams through TeamMember
      const teamRegistrations = await pg
        .selectFrom('Registration')
        .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
        .leftJoin('TeamMember', 'TeamMember.userId', 'Registration.userId')
        .where('Registration.competitionId', 'in', competitionIds)
        .where('TicketType.teamSize', '>', 1)
        .select([
          'Registration.competitionId',
          'Registration.userId',
          'TicketType.teamSize',
          'TeamMember.teamId',
        ])
        .execute()

      // Group by competition and unique teamId, just like ParticipantsTable does
      const teamCountsByComp = new Map<string, Set<string>>()
      const teamSizesByComp = new Map<string, number>()

      teamRegistrations.forEach((reg) => {
        if (!teamCountsByComp.has(reg.competitionId)) {
          teamCountsByComp.set(reg.competitionId, new Set())
        }

        // Use teamId if available, otherwise create a unique key for solo team members
        const teamKey = reg.teamId || `solo-${reg.userId}`
        teamCountsByComp.get(reg.competitionId)!.add(teamKey)

        // Store the team size for this competition (should be consistent)
        if (!teamSizesByComp.has(reg.competitionId)) {
          teamSizesByComp.set(reg.competitionId, reg.teamSize)
        }
      })

      // Calculate total team participants for each competition
      const teamParticipantsByComp = new Map<string, number>()
      teamCountsByComp.forEach((teamIds, competitionId) => {
        const teamSize = teamSizesByComp.get(competitionId) || 2
        const participantCount = teamIds.size * teamSize
        teamParticipantsByComp.set(competitionId, participantCount)
      })

      // Combine solo and team counts
      const countMap = new Map<string, number>()

      // Add solo counts
      soloCounts.forEach((row) => {
        countMap.set(row.competitionId, Number(row.count))
      })

      // Add team counts
      teamParticipantsByComp.forEach((count, competitionId) => {
        const existing = countMap.get(competitionId) || 0
        countMap.set(competitionId, existing + count)
      })

      return competitionIds.map((id) => countMap.get(id) || 0)
    }),

    soloRegistrationsCountLoader: new DataLoader(
      async (competitionIds: readonly string[]) => {
        const counts = await pg
          .selectFrom('Registration')
          .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
          .where('Registration.competitionId', 'in', competitionIds)
          .where('TicketType.teamSize', '=', 1)
          .groupBy('Registration.competitionId')
          .select([
            'Registration.competitionId',
            (eb) => eb.fn.count('Registration.id').as('count'),
          ])
          .execute()

        const countMap = new Map(counts.map((c) => [c.competitionId, Number(c.count)]))
        return competitionIds.map((id) => countMap.get(id) || 0)
      },
    ),

    teamRegistrationsCountLoader: new DataLoader(
      async (competitionIds: readonly string[]) => {
        const counts = await pg
          .selectFrom('Registration')
          .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
          .where('Registration.competitionId', 'in', competitionIds)
          .where('TicketType.teamSize', '>', 1)
          .groupBy('Registration.competitionId')
          .select([
            'Registration.competitionId',
            (eb) => eb.fn.count('Registration.id').as('count'),
          ])
          .execute()

        const countMap = new Map(counts.map((c) => [c.competitionId, Number(c.count)]))
        return competitionIds.map((id) => countMap.get(id) || 0)
      },
    ),

    teamsCountLoader: new DataLoader(async (competitionIds: readonly string[]) => {
      // Get all team registrations for these competitions
      const teamRegistrations = await pg
        .selectFrom('Registration')
        .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
        .leftJoin('TeamMember', 'TeamMember.userId', 'Registration.userId')
        .where('Registration.competitionId', 'in', competitionIds)
        .where('TicketType.teamSize', '>', 1)
        .select([
          'Registration.competitionId',
          'Registration.userId',
          'TeamMember.teamId',
        ])
        .execute()

      // Count unique teams per competition
      const countMap = new Map<string, number>()

      competitionIds.forEach((competitionId) => {
        const compTeamRegs = teamRegistrations.filter(
          (r) => r.competitionId === competitionId,
        )

        const uniqueTeams = new Set<string>()
        compTeamRegs.forEach((reg) => {
          const teamKey = reg.teamId || `solo-${reg.userId}`
          uniqueTeams.add(teamKey)
        })

        countMap.set(competitionId, uniqueTeams.size)
      })

      return competitionIds.map((id) => countMap.get(id) || 0)
    }),

    registrationTrendLoader: new DataLoader(async (competitionIds: readonly string[]) => {
      const startDate = new Date('2024-07-15')

      // Get all registrations grouped by date and competition
      const allRegistrations = await pg
        .selectFrom('Registration')
        .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
        .leftJoin('TeamMember', 'TeamMember.userId', 'Registration.userId')
        .where('Registration.competitionId', 'in', competitionIds)
        .where('Registration.createdAt', '>=', startDate)
        .select([
          'Registration.competitionId',
          'Registration.userId',
          'TicketType.teamSize',
          'TeamMember.teamId',
          (eb) => eb.fn('DATE', ['Registration.createdAt']).as('date'),
        ])
        .orderBy('date', 'asc')
        .execute()

      return competitionIds.map((competitionId) => {
        const compRegistrations = allRegistrations.filter(
          (r) => r.competitionId === competitionId,
        )

        // Get all unique dates and sort them
        const allDates = [
          ...new Set(compRegistrations.map((r) => r.date as string)),
        ].sort()

        let previousCumulativeCount = 0

        return allDates.map((date) => {
          // Get all registrations up to and including this date (for cumulative)
          const regsUpToDate = compRegistrations.filter((r) => (r.date as string) <= date)

          // Apply the same participant counting logic to cumulative data
          const soloRegs = regsUpToDate.filter((r) => r.teamSize === 1)
          const teamRegs = regsUpToDate.filter((r) => r.teamSize > 1)

          // Count solo participants (1:1)
          const soloCount = soloRegs.length

          // Count team participants using unique team logic
          const uniqueTeams = new Set<string>()
          teamRegs.forEach((reg) => {
            const teamKey = reg.teamId || `solo-${reg.userId}`
            uniqueTeams.add(teamKey)
          })
          const teamParticipants = uniqueTeams.size * (teamRegs[0]?.teamSize || 2)

          const cumulativeCount = soloCount + teamParticipants
          const dayCount = Math.max(0, cumulativeCount - previousCumulativeCount)
          previousCumulativeCount = cumulativeCount

          return {
            date,
            count: dayCount,
            cumulativeCount,
          }
        })
      })
    }),

    heatTicketTypesLoader: new DataLoader(async (heatIds: readonly string[]) => {
      const results = await pg
        .selectFrom('HeatTicketTypes')
        .innerJoin('TicketType', 'TicketType.id', 'HeatTicketTypes.ticketTypeId')
        .where('HeatTicketTypes.heatId', 'in', heatIds)
        .selectAll('TicketType')
        .select('HeatTicketTypes.heatId')
        .execute()

      return heatIds.map((heatId) => results.filter((result) => result.heatId === heatId))
    }),

    heatsByTicketTypeLoader: new DataLoader(async (ticketTypeIds: readonly string[]) => {
      const results = await pg
        .selectFrom('HeatTicketTypes')
        .where('ticketTypeId', 'in', ticketTypeIds)
        .select(['heatId', 'ticketTypeId'])
        .execute()

      return ticketTypeIds.map((ticketTypeId) =>
        results
          .filter((result) => result.ticketTypeId === ticketTypeId)
          .map((result) => result.heatId),
      )
    }),

    directoryCompsLoader: new DataLoader(
      async (keys: readonly string[]) => {
        const directoryComps = await pg
          .selectFrom('DirectoryComp')
          .selectAll()
          .orderBy('startDate', 'asc')
          .execute()

        return keys.map(() => directoryComps)
      },
      {
        batch: false,
        cacheKeyFn: () => 'all',
      },
    ),

    categoriesByDirectoryCompIdLoader: new DataLoader(
      async (directoryCompIds: readonly string[]) => {
        // If not in Redis, get from DB
        const categories = await pg
          .selectFrom('Category')
          .where('directoryCompId', 'in', directoryCompIds as string[])
          .selectAll()
          .execute()

        // Group by directoryCompId
        return directoryCompIds.map((id) =>
          categories.filter((cat) => cat.directoryCompId === id),
        )
      },
    ),

    categoryByIdLoader: new DataLoader(async (categoryIds: readonly string[]) => {
      const categories = await pg
        .selectFrom('Category')
        .where('id', 'in', categoryIds)
        .selectAll()
        .execute()

      return categoryIds.map((id) => {
        const category = categories.find((cat) => cat.id === id)
        if (!category) {
          console.warn(`Category not found for id: ${id} - returning null`)
          return null
        }
        return category
      })
    }),

    directoryCompByIdLoader: new DataLoader(async (keys: readonly string[]) => {
      const directoryComps = await pg
        .selectFrom('DirectoryComp')
        .where('id', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => {
        const comp = directoryComps.find((comp) => comp.id === key)
        if (!comp) throw new Error(`DirectoryComp not found for id: ${key}`)
        return comp
      })
    }),

    ...createEntryLoaders(pg, ctx),

    // New DataLoaders for AthleteCompetition and CompetitionCreator
    competitionsAsAthleteByUserIdLoader: new DataLoader<string, Competition[]>(
      async (userIds) => {
        const records = await pg
          .selectFrom('AthleteCompetition')
          .innerJoin('Competition', 'Competition.id', 'AthleteCompetition.competitionId')
          .where('AthleteCompetition.userId', 'in', userIds as string[])
          .select(['AthleteCompetition.userId'])
          .selectAll('Competition') // Selects all columns from Competition table
          .execute()

        const grouped = new Map<string, Competition[]>()
        for (const record of records) {
          // Kysely will return all columns from Competition, and userId from AthleteCompetition
          // We need to structure this into a Competition object.
          // Assuming 'record' contains all Competition fields directly, plus 'userId'.
          const { userId, ...competitionData } = record
          if (!grouped.has(userId)) {
            grouped.set(userId, [])
          }
          grouped.get(userId)!.push(competitionData as unknown as Competition) // Cast to Competition
        }
        return userIds.map((id) => grouped.get(id) || [])
      },
    ),

    competitionsAsCreatorByUserIdLoader: new DataLoader<string, Competition[]>(
      async (userIds) => {
        const records = await pg
          .selectFrom('CompetitionCreator')
          .innerJoin('Competition', 'Competition.id', 'CompetitionCreator.competitionId')
          .where('CompetitionCreator.userId', 'in', userIds as string[])
          .where('Competition.isActive', '=', true)
          .select(['CompetitionCreator.userId'])
          .selectAll('Competition')
          .execute()

        const grouped = new Map<string, Competition[]>()
        for (const record of records) {
          const { userId, ...competitionData } = record
          if (!grouped.has(userId)) {
            grouped.set(userId, [])
          }
          grouped.get(userId)!.push(competitionData as unknown as Competition)
        }
        const result = userIds.map((id) => grouped.get(id) || [])
        return result
      },
    ),

    partnerInterestByIdLoader,

    partnerRequestsByInterestIdLoader: new DataLoader(
      async (interestIds: readonly string[]) => {
        // Use separate queries instead of OR conditions for better performance
        const [fromRequests, toRequests] = await Promise.all([
          pg
            .selectFrom('PartnerRequest')
            .where('fromInterestId', 'in', interestIds)
            .selectAll()
            .execute(),
          pg
            .selectFrom('PartnerRequest')
            .where('toInterestId', 'in', interestIds)
            .selectAll()
            .execute(),
        ])

        // Combine and deduplicate requests
        const allRequests = [...fromRequests, ...toRequests]
        const uniqueRequests = Array.from(
          new Map(allRequests.map((req) => [req.id, req])).values(),
        )

        return interestIds.map((interestId) =>
          uniqueRequests.filter(
            (request) =>
              request.fromInterestId === interestId ||
              request.toInterestId === interestId,
          ),
        )
      },
    ),

    partnerInterestTeamMembersByInterestIdLoader: new DataLoader(
      async (interestIds: readonly string[]) => {
        const teamMembers = await pg
          .selectFrom('PartnerInterestTeamMember')
          .where('partnerInterestId', 'in', interestIds)
          .selectAll()
          .execute()

        return interestIds.map((interestId) =>
          teamMembers.filter((member) => member.partnerInterestId === interestId),
        )
      },
    ),

    videosByWorkoutIdLoader: new DataLoader(async (workoutIds: readonly string[]) => {
      const videos = await pg
        .selectFrom('Video')
        .where('workoutId', 'in', workoutIds)
        .selectAll()
        .orderBy('orderIndex', 'asc')
        .execute()

      return workoutIds.map((workoutId) =>
        videos.filter((video) => video.workoutId === workoutId),
      )
    }),

    // Competition ownership loader for auth checks
    competitionOwnershipLoader: new DataLoader(
      async (keys: readonly { competitionId: string; userId: string }[]) => {
        // Use the optimized ownership check function for each key
        return Promise.all(
          keys.map(({ competitionId, userId }) =>
            checkCompetitionOwnership(competitionId, userId, ctx),
          ),
        )
      },
      {
        cacheKeyFn: (key) => `${key.competitionId}:${key.userId}`,
      },
    ),

    competitionCreatorsByCompetitionIdLoader: new DataLoader(
      async (competitionIds: readonly string[]) => {
        const creators = await pg
          .selectFrom('CompetitionCreator')
          .where('competitionId', 'in', competitionIds)
          .selectAll()
          .execute()

        return competitionIds.map((competitionId) =>
          creators.filter((creator) => creator.competitionId === competitionId),
        )
      },
    ),

    athleteCompetitionsByCompetitionIdLoader: new DataLoader(
      async (competitionIds: readonly string[]) => {
        const athletes = await pg
          .selectFrom('AthleteCompetition')
          .where('competitionId', 'in', competitionIds)
          .selectAll()
          .execute()

        return competitionIds.map((competitionId) =>
          athletes.filter((athlete) => athlete.competitionId === competitionId),
        )
      },
    ),

    // PotentialCompetition dataloaders
    potentialCompetitionLoader: new DataLoader(async (keys: readonly string[]) => {
      const potentialCompetitions = await pg
        .selectFrom('PotentialCompetition')
        .where('id', 'in', keys)
        .selectAll()
        .execute()

      return keys.map((key) => {
        const comp = potentialCompetitions.find((comp) => comp.id === key)
        if (!comp) throw new Error(`PotentialCompetition not found for id: ${key}`)
        return comp
      })
    }),

    potentialTicketTypesByPotentialCompetitionIdLoader: new DataLoader(
      async (potentialCompetitionIds: readonly string[]) => {
        const ticketTypes = await pg
          .selectFrom('PotentialTicketType')
          .where('potentialCompetitionId', 'in', potentialCompetitionIds)
          .selectAll()
          .execute()

        return potentialCompetitionIds.map((competitionId) =>
          ticketTypes.filter((tt) => tt.potentialCompetitionId === competitionId),
        )
      },
    ),
  }
}
