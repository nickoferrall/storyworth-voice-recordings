import shortUUID from 'short-uuid'
import { createEntryHelper } from '../../../utils/createEntryHelper'
import { storeUser } from '../../../lib/userInRedis'
import sendRegistrationEmail from '../../../emails/sendRegistrationEmail'
import getKysely from '../../../src/db'
import MailgunManager from '../../../lib/MailgunManager'
import { PartnerEmailQuestion } from '../../../utils/constants'
import { ensureTeamMembership } from '../../../utils/ensureTeamMembership'
import notifyOrganiser from '../../../emails/notifyOrganiser'
import { Context } from '../../context'
import { handleTeamInvitations } from './handleTeamInvitations'
import { handleInvitationToken } from './handleInvitationToken'
import addRegistrantToHeat from './addRegistrantToHeat'
import {
  createClient,
  User as SupabaseAuthUser,
  UserMetadata,
} from '@supabase/supabase-js'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

// Ensure this is the ONLY place supabaseAdmin is imported or defined in this file
console.log('[createRegistration.ts] Attempting to use imported supabaseAdmin.')
if (typeof supabaseAdmin === 'undefined') {
  console.error('[createRegistration.ts] FATAL: supabaseAdmin IS UNDEFINED after import!')
} else if (
  supabaseAdmin &&
  supabaseAdmin.auth &&
  supabaseAdmin.auth.admin &&
  typeof supabaseAdmin.rpc === 'function'
) {
  console.log(
    '[createRegistration.ts] supabaseAdmin imported, .auth.admin exists, and .rpc is a function. Looks OK for RPC.',
  )
} else {
  console.warn(
    '[createRegistration.ts] supabaseAdmin IS DEFINED but DOES NOT meet criteria for RPC calls (.auth.admin missing or .rpc not a function).',
  )
  console.log('[createRegistration.ts] Value of supabaseAdmin:', supabaseAdmin)
  if (supabaseAdmin && supabaseAdmin.auth) {
    console.log(
      '[createRegistration.ts] supabaseAdmin.auth exists, value of supabaseAdmin.auth.admin:',
      supabaseAdmin.auth.admin,
    )
    console.log(
      '[createRegistration.ts] typeof supabaseAdmin.rpc:',
      typeof supabaseAdmin.rpc,
    )
  } else if (supabaseAdmin) {
    console.log('[createRegistration.ts] supabaseAdmin.auth does NOT exist.')
  }
}

type CreateRegistrationInput = {
  email: string
  name: string
  ticketTypeId: string
  answers: any
  selectedHeatId: string | null
  invitationToken: string | null
  context: Context
}

// Helper type for user details we'll work with
type EffectiveUser = {
  id: string
  email: string
  firstName: string
  user_metadata?: UserMetadata // Store Supabase user_metadata directly
}

export const createRegistration = async (props: CreateRegistrationInput) => {
  const {
    email: inputEmail,
    name: inputName,
    ticketTypeId,
    answers,
    selectedHeatId,
    invitationToken,
    context: ctx,
  } = props
  try {
    console.log(
      '[createRegistration.ts] Checking env var directly: SUPABASE_SERVICE_ROLE_KEY available?',
      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    )

    const pg = getKysely() // Kysely instance for other DB operations (Registration, Entry, etc.)
    let effectiveUser: EffectiveUser

    console.log('🚀 ~ ctx.user:', ctx.user)
    if (ctx.user?.id) {
      // Scenario 1: User is logged in (ctx.user is populated from JWT)
      if (!ctx.user.email) {
        throw new Error('Authenticated user email is missing.')
      }

      // Handle post-migration scenario: ctx.user.id might be old, but email is stable
      let existingProfile = await pg
        .selectFrom('UserProfile')
        .where('id', '=', ctx.user.id)
        .selectAll()
        .executeTakeFirst()

      if (!existingProfile) {
        // Try finding by email (migration scenario)
        existingProfile = await pg
          .selectFrom('UserProfile')
          .where('email', '=', ctx.user.email)
          .selectAll()
          .executeTakeFirst()
      }

      if (!existingProfile) {
        // Create missing UserProfile for authenticated user
        await pg
          .insertInto('UserProfile')
          .values({
            id: ctx.user.id,
            email: ctx.user.email,
            firstName: ctx.user.firstName || inputName || 'User',
            lastName: ctx.user.lastName || null,
            picture: ctx.user.picture || null,
            bio: ctx.user.bio || null,
            isSuperUser: ctx.user.isSuperUser || false,
            isVerified: ctx.user.isVerified || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .execute()

        effectiveUser = {
          id: ctx.user.id,
          email: ctx.user.email,
          firstName: ctx.user?.firstName || inputName || 'User',
          user_metadata: ctx.user,
        }
      } else {
        // Use existing profile (handles migration scenario)
        effectiveUser = {
          id: existingProfile.id, // Use the actual UserProfile ID, not JWT ID
          email: existingProfile.email,
          firstName: existingProfile.firstName || inputName || 'User',
          user_metadata: ctx.user,
        }
      }
      console.log('🚀 ~ effectiveUser:', effectiveUser)
    } else {
      // Scenario 2 & 3: User is NOT logged in (guest registration)
      if (!inputEmail) {
        throw new Error('Email is required for guest registration.')
      }
      try {
        // --- BEGIN AGGRESSIVE LOGGING ---
        console.log('[createRegistration.ts] TOP OF GUEST REGISTRATION TRY BLOCK')
        if (!supabaseAdmin) {
          console.error(
            '[createRegistration.ts] supabaseAdmin IS UNDEFINED HERE (pre-RPC)!',
          )
          throw new Error('supabaseAdmin is not available (pre-RPC)')
        } else {
          console.log('[createRegistration.ts] supabaseAdmin IS DEFINED (pre-RPC).')
          console.log(
            '[createRegistration.ts] (pre-RPC) typeof supabaseAdmin.rpc:',
            typeof supabaseAdmin.rpc,
          )
          console.log(
            '[createRegistration.ts] (pre-RPC) supabaseAdmin.auth.admin exists?',
            !!(supabaseAdmin.auth && supabaseAdmin.auth.admin),
          )
          // Log the actual headers that would be used by the rpc call
          // The rpc call uses headers from the main client, which should include the service role key
          console.log(
            '[createRegistration.ts] (pre-RPC) supabaseAdmin.options.headers:',
            (supabaseAdmin as any).options?.headers,
          )
          console.log(
            '[createRegistration.ts] (pre-RPC) supabaseAdmin.headers (direct access, might be different):',
            (supabaseAdmin as any).headers,
          )
        }
        // --- END AGGRESSIVE LOGGING ---

        if (
          !supabaseAdmin ||
          typeof supabaseAdmin.rpc !== 'function' ||
          !supabaseAdmin.auth ||
          !supabaseAdmin.auth.admin
        ) {
          console.error(
            '[createRegistration.ts] Supabase admin client or required methods (rpc, auth.admin) are not available (secondary check)!',
          )
          throw new Error(
            'Internal server configuration error with Supabase admin client (secondary check).',
          )
        }

        let existingAuthUser: SupabaseAuthUser | null = null
        console.log(
          `[createRegistration.ts] Checking for existing user ID (via RPC 'get_user_id_by_email'): ${inputEmail}`,
        )

        const { data: userIdFromRpc, error: rpcErrorUserId } = await supabaseAdmin.rpc(
          'get_user_id_by_email', // Call the new simpler function
          { p_email: inputEmail },
        )
        console.log('🚀 ~ userIdFromRpc________:', userIdFromRpc)

        if (rpcErrorUserId) {
          console.error(
            'Error calling RPC get_user_id_by_email. Message:',
            rpcErrorUserId.message,
          )
          console.error('Full RPC Error object (get_user_id_by_email):', rpcErrorUserId)
        }

        if (userIdFromRpc) {
          console.log(
            `[createRegistration.ts] User ID found via RPC: ${userIdFromRpc}. Fetching full user object.`,
          )
          const { data: userObject, error: getUserByIdError } =
            await supabaseAdmin.auth.admin.getUserById(userIdFromRpc as string)

          if (getUserByIdError) {
            console.error(
              `Error fetching user by ID ${userIdFromRpc} after RPC call:`,
              getUserByIdError.message,
            )
            throw new Error(
              `Could not retrieve details for existing user: ${getUserByIdError.message}`,
            )
          }
          if (!userObject?.user) {
            throw new Error(
              `User details not found for ID ${userIdFromRpc} after RPC call.`,
            )
          }
          existingAuthUser = userObject.user
          console.log(
            `[createRegistration.ts] Full user object fetched for ID: ${existingAuthUser?.id}`,
          )
        } else {
          console.log(
            `[createRegistration.ts] No user ID returned from RPC 'get_user_id_by_email' for email: ${inputEmail}`,
          )
        }

        if (existingAuthUser) {
          // Scenario 2: User account ALREADY EXISTS in Supabase Auth
          effectiveUser = {
            id: existingAuthUser.id,
            email: existingAuthUser.email!,
            firstName: existingAuthUser.user_metadata?.firstName || inputName || 'User',
            user_metadata: existingAuthUser.user_metadata,
          }

          // Ensure UserProfile exists for existing user
          const existingProfile = await pg
            .selectFrom('UserProfile')
            .where('id', '=', existingAuthUser.id)
            .selectAll()
            .executeTakeFirst()

          if (!existingProfile) {
            await pg
              .insertInto('UserProfile')
              .values({
                id: existingAuthUser.id,
                email: existingAuthUser.email!,
                firstName:
                  existingAuthUser.user_metadata?.firstName || inputName || 'User',
                lastName: null,
                picture: null,
                bio: null,
                isSuperUser: false,
                isVerified: existingAuthUser.email_confirmed_at !== null,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .execute()
          }
        } else {
          // Scenario 3: New guest user, CREATE in Supabase Auth
          console.log(
            `[createRegistration.ts] Attempting to create new user for email: ${inputEmail}`,
          )
          const { data: newAuthUserData, error: createUserError } =
            await supabaseAdmin.auth.admin.createUser({
              email: inputEmail,
              email_confirm: true,
              user_metadata: {
                firstName: inputName,
              },
            })

          if (createUserError) {
            console.error(
              'Error creating Supabase user:',
              createUserError.message,
              createUserError,
            )
            const errorMessageLower = createUserError.message.toLowerCase()
            if (
              errorMessageLower.includes('already registered') ||
              errorMessageLower.includes('unique constraint') ||
              errorMessageLower.includes(
                'duplicate key value violates unique constraint',
              ) ||
              (createUserError as any).status === 409 ||
              (createUserError as any).status === 422
            ) {
              throw new Error(
                `This email is already registered. Please try logging in or use a different email. (Error from createUser)`,
              )
            }
            throw new Error(`Could not create user account: ${createUserError.message}`)
          }

          if (!newAuthUserData?.user) {
            throw new Error(
              'Failed to create user account, no user data returned from createUser.',
            )
          }
          console.log(
            `[createRegistration.ts] New user created successfully: ${newAuthUserData.user.id}`,
          )
          effectiveUser = {
            id: newAuthUserData.user.id,
            email: newAuthUserData.user.email!,
            firstName: newAuthUserData.user.user_metadata?.firstName || inputName,
            user_metadata: newAuthUserData.user.user_metadata,
          }

          // Create UserProfile entry for new user
          await pg
            .insertInto('UserProfile')
            .values({
              id: newAuthUserData.user.id,
              email: newAuthUserData.user.email!,
              firstName:
                newAuthUserData.user.user_metadata?.firstName || inputName || 'User',
              lastName: null,
              picture: null,
              bio: null,
              isSuperUser: false,
              isVerified: newAuthUserData.user.email_confirmed_at !== null,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .execute()
        }
      } catch (e: any) {
        console.error(
          'Error in user identification/creation block (Supabase Auth):',
          e.message,
          e, // Log the full error object from the catch block as well
        )
        throw e
      }
    }

    const authUserId = effectiveUser.id // This is the ID from auth.users

    const ticketType = await ctx.loaders.ticketTypeLoader.load(ticketTypeId)
    if (!ticketType) {
      throw new Error('Ticket type not found')
    }

    const competitionId = ticketType.competitionId

    // Handle invitation token FIRST - if user is joining a team via invitation,
    // they should be able to do so even if already registered for the competition
    if (invitationToken) {
      // For team invitations, check if user is already registered
      const existingRegistration = await pg
        .selectFrom('Registration')
        .where('userId', '=', authUserId)
        .where('competitionId', '=', competitionId)
        .select('id')
        .executeTakeFirst()

      if (existingRegistration) {
        // User is already registered, just handle the team invitation
        await handleInvitationToken({
          invitationToken,
          teamSize: ticketType.teamSize,
          email: inputEmail,
          userId: authUserId,
        })

        // Return early - no need to create new registration
        return { updatedUser: effectiveUser, competitionId: ticketType.competitionId }
      }
      // If not registered, continue with normal flow and handle invitation after registration
    }

    // Check for existing registration ONLY if not handling invitation token
    const existingRegistration = await pg
      .selectFrom('Registration')
      .where('userId', '=', authUserId)
      .where('competitionId', '=', competitionId)
      .select('id')
      .executeTakeFirst()

    if (existingRegistration) {
      throw new Error('You are already registered for this competition.')
    }

    // Also check AthleteCompetition as backup
    const existingAthleteEntry = await pg
      .selectFrom('AthleteCompetition')
      .where('userId', '=', authUserId)
      .where('competitionId', '=', competitionId)
      .select('id')
      .executeTakeFirst()

    if (existingAthleteEntry) {
      throw new Error('You are already registered for this competition.')
    }

    const isTeam = ticketType.teamSize > 1

    // Parallel fetch: competition and workouts
    const [comp, workouts] = await Promise.all([
      ctx.loaders.competitionLoader.load(competitionId),
      pg
        .selectFrom('Workout')
        .where('competitionId', '=', competitionId)
        .selectAll()
        .execute(),
    ])

    // Check if competition exists and if registrations are enabled
    if (!comp) {
      throw new Error('Competition not found.')
    }

    if (!(comp as any).registrationEnabled && !invitationToken) {
      throw new Error('Registrations are currently closed for this competition.')
    }

    // Create registration (UserProfile should exist from user creation logic above)
    let registration: any
    try {
      registration = await pg
        .insertInto('Registration')
        .values({
          userId: authUserId,
          competitionId,
          ticketTypeId,
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    } catch (error: any) {
      // Handle foreign key constraint specifically
      if (
        error.message?.includes('fk_registration_userId') ||
        error.constraint === 'fk_registration_userId'
      ) {
        throw new Error(
          'Registration failed due to account setup issue. Please try again or contact hello@fitlo.co',
        )
      }
      throw error
    }

    // Insert registration answers
    const answersToInsert = answers.map((answer: any) => ({
      registrationId: registration.id,
      registrationFieldId: answer.registrationFieldId,
      answer: answer.answer,
    }))

    // Insert registration answers and get their IDs
    const registrationAnswers = await pg
      .insertInto('RegistrationAnswer')
      .values(answersToInsert)
      .returningAll()
      .execute()

    // Handle integrations
    const integrationsToInsert = answers
      .filter((answer: any) => answer.integration)
      .map((answer: any) => {
        const integration = answer.integration
        return {
          type: integration.type,
          accessToken: integration.accessToken,
          refreshToken: integration.refreshToken,
          expiresAt: new Date(parseInt(integration.expiresAt) * 1000),
          athleteId: integration.athleteId,
          athleteFirstname: integration.athleteFirstname,
          athleteLastname: integration.athleteLastname,
          athleteProfile: integration.athleteProfile,
          registrationAnswerId: registrationAnswers.find(
            (ra) => ra.registrationFieldId === answer.registrationFieldId,
          )!.id,
        }
      })

    if (integrationsToInsert.length > 0) {
      await pg.insertInto('Integration').values(integrationsToInsert).execute()
    }

    let teamId: string | null = null

    if (invitationToken) {
      await handleInvitationToken({
        invitationToken,
        teamSize: ticketType.teamSize,
        email: inputEmail,
        userId: authUserId,
      })
    } else {
      const entry = await createEntryHelper({
        isTeam,
        ticketTypeId,
        answers: answersToInsert,
        userId: authUserId,
      })
      teamId = entry.teamId

      if (selectedHeatId && workouts.length > 0) {
        const [heats, scoreSetting] = await Promise.all([
          pg
            .selectFrom('Heat')
            .innerJoin('Workout', 'Heat.workoutId', 'Workout.id')
            .where('Workout.competitionId', '=', competitionId)
            .selectAll('Heat')
            .orderBy('Heat.startTime', 'asc')
            .execute(),
          pg
            .selectFrom('ScoreSetting')
            .where('competitionId', '=', competitionId)
            .selectAll()
            .executeTakeFirstOrThrow(),
        ])

        await addRegistrantToHeat({
          selectedHeatId,
          heats,
          ticketType,
          entryId: entry.id,
          scoreSetting,
          workouts,
          context: ctx,
        })
      }
    }

    const [, fields] = await Promise.all([
      pg
        .insertInto('AthleteCompetition')
        .values({
          userId: authUserId,
          competitionId: competitionId,
        })
        .execute(),
      ticketType.teamSize > 1
        ? pg
            .selectFrom('RegistrationField')
            .where(
              'id',
              'in',
              answers.map((answer: any) => answer.registrationFieldId),
            )
            .selectAll()
            .execute()
        : Promise.resolve(null),
    ])

    await ensureTeamMembership({
      teamId,
      userId: authUserId,
    })

    // Only store user session if this is a guest registration (not already authenticated)
    if (!ctx.user?.id) {
      // Fetch complete user profile from UserProfile table for storeUser
      const userProfile = await pg
        .selectFrom('UserProfile')
        .where('id', '=', authUserId)
        .selectAll()
        .executeTakeFirst()

      if (userProfile) {
        // Create complete user object for storeUser
        const completeUser = {
          ...userProfile,
          hashedPassword: null,
          invitationId: null,
          athleteCompetitionIds: [],
          createdCompetitionIds: [],
          stripeCustomerId: null,
          verificationToken: null,
          referredBy: null,
          referralCode: null,
          orgId: null,
        }
        storeUser(completeUser, ctx)
      }
    }

    let selectedHeatTime: null | Date | undefined = null
    if (workouts.length > 0 && selectedHeatId) {
      const heats = await pg
        .selectFrom('Heat')
        .innerJoin('Workout', 'Heat.workoutId', 'Workout.id')
        .where('Workout.competitionId', '=', competitionId)
        .selectAll('Heat')
        .orderBy('Heat.startTime', 'asc')
        .execute()

      selectedHeatTime = heats.find((heat) => heat.id === selectedHeatId)?.startTime
    }

    sendRegistrationEmail(inputEmail, comp, effectiveUser.firstName, selectedHeatTime)

    const partnerEmailsField = fields?.find(
      (field) => field.question === PartnerEmailQuestion,
    )
    const partnerEmails = answers.find(
      (answer: any) => answer.registrationFieldId === partnerEmailsField?.id,
    )?.answer
    const parsedPartnerEmails = partnerEmails
      ?.split(',')
      .map((email: any) => email.trim())

    // Use data we already have instead of extra query
    const sender = {
      id: authUserId,
      firstName: effectiveUser.firstName,
      lastName: ctx.user?.lastName || null, // Use ctx.user if available, null for guests
    }

    handleTeamInvitations({
      sender,
      teamId: teamId,
      emails: parsedPartnerEmails,
      compName: comp?.name ?? '',
      ticketTypeId,
    })

    if (process.env.NODE_ENV === 'production') {
      if (comp.orgId) {
        notifyOrganiser(
          inputEmail,
          comp.orgId,
          effectiveUser.firstName,
          ticketTypeId,
          ctx,
          selectedHeatTime,
        )
      }
      const emailOptionsForMe = {
        to: 'nickoferrall@gmail.com',
        subject: 'New registration!',
        body: inputEmail,
        html: `
              <h1>Someone registered for ${comp?.name}!</h1>
              <p>${inputEmail}</p>
            `,
      }
      const mailgunManager = new MailgunManager()
      mailgunManager.sendEmail(emailOptionsForMe)
    }

    return { updatedUser: effectiveUser, competitionId: ticketType.competitionId }
  } catch (error: any) {
    console.error('Error creating registration:', error)

    // Provide better error messages for common invitation issues
    const errorMessage = error.message || error

    if (typeof errorMessage === 'string') {
      // Pass through invitation-specific error messages as-is
      if (
        errorMessage.includes('invitation has expired') ||
        errorMessage.includes('invitation is no longer valid') ||
        errorMessage.includes('Email does not match') ||
        errorMessage.includes('Team is full') ||
        errorMessage.includes('already registered')
      ) {
        throw new Error(errorMessage)
      }
    }

    // For other errors, provide a generic message
    throw new Error(errorMessage || 'Registration failed. Please try again.')
  }
}
