import getKysely from '../src/db'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const fakeFirstNames = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Avery',
  'Riley',
  'Jamie',
  'Sage',
  'River',
  'Sam',
  'Charlie',
  'Blake',
  'Quinn',
  'Rowan',
  'Emery',
  'Finley',
  'Hayden',
  'Kai',
  'Logan',
  'Parker',
  'Reese',
  'Skylar',
  'Cameron',
  'Eden',
  'Ari',
  'Dakota',
  'Ellis',
  'Gray',
  'Jules',
]

const fakeLastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
]

function generateFakeUser() {
  const firstName = fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)]
  const lastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}@test.com`

  return {
    firstName,
    lastName,
    email,
    name: `${firstName} ${lastName}`,
  }
}

async function populateUsers(competitionId: string, numUsers: number) {
  const pg = getKysely()

  // Get ticket types for the competition
  const ticketTypes = await pg
    .selectFrom('TicketType')
    .where('competitionId', '=', competitionId)
    .where('isVolunteer', '=', false)
    .selectAll()
    .execute()

  if (ticketTypes.length === 0) {
    throw new Error(
      `No non-volunteer ticket types found for competition ${competitionId}`,
    )
  }

  console.log(`Found ${ticketTypes.length} ticket types:`)
  ticketTypes.forEach((tt) => {
    console.log(`- ${tt.name} (Team size: ${tt.teamSize})`)
  })

  // Get registration fields for each ticket type
  const registrationFields = await pg
    .selectFrom('RegistrationField as rf')
    .innerJoin(
      'RegistrationFieldTicketTypes as rftt',
      'rf.id',
      'rftt.registrationFieldId',
    )
    .where(
      'rftt.ticketTypeId',
      'in',
      ticketTypes.map((tt) => tt.id),
    )
    .select([
      'rf.id',
      'rf.question',
      'rf.type',
      'rf.requiredStatus',
      'rf.options',
      'rf.sortOrder',
      'rf.isEditable',
      'rf.repeatPerAthlete',
      'rf.createdAt',
      'rf.updatedAt',
      'rftt.ticketTypeId',
    ])
    .execute()

  console.log(`\nCreating ${numUsers} registrations...`)

  let createdCount = 0
  let teamGroupCounter = 1

  for (let i = 0; i < numUsers; i++) {
    try {
      // Distribute users across ticket types
      const ticketType = ticketTypes[i % ticketTypes.length]
      const user = generateFakeUser()

      // Get registration fields for this ticket type
      const fieldsForTicketType = registrationFields.filter(
        (rf) => rf.ticketTypeId === ticketType.id,
      )

      // For team registrations, add team name
      let teamName: string | undefined
      if (ticketType.teamSize > 1) {
        teamName = `Team ${teamGroupCounter}`
        if (i % ticketType.teamSize === ticketType.teamSize - 1) {
          teamGroupCounter++
        }
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            firstName: user.firstName,
          },
        })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      if (!authData?.user) {
        throw new Error('No user data returned from Supabase')
      }

      // Create UserProfile
      await pg
        .insertInto('UserProfile')
        .values({
          id: authData.user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: null,
          bio: null,
          isSuperUser: false,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute()

      // Create Registration
      const registration = await pg
        .insertInto('Registration')
        .values({
          userId: authData.user.id,
          competitionId,
          ticketTypeId: ticketType.id,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      // Create AthleteCompetition link
      await pg
        .insertInto('AthleteCompetition')
        .values({
          userId: authData.user.id,
          competitionId,
        })
        .execute()

      // Generate registration field answers
      if (fieldsForTicketType.length > 0) {
        const answersToInsert = fieldsForTicketType.map((field) => ({
          registrationId: registration.id,
          registrationFieldId: field.id,
          answer:
            field.type === 'EMAIL' ? user.email : `Test answer for ${field.question}`,
        }))

        await pg.insertInto('RegistrationAnswer').values(answersToInsert).execute()
      }

      // Create Entry and Team if needed
      if (ticketType.teamSize > 1) {
        // Create team
        const team = await pg
          .insertInto('Team')
          .values({
            status: 'ACTIVE',
            name: teamName,
            teamCaptainId: authData.user.id,
          })
          .returningAll()
          .executeTakeFirstOrThrow()

        // Create entry with team
        await pg
          .insertInto('Entry')
          .values({
            userId: authData.user.id,
            teamId: team.id,
            ticketTypeId: ticketType.id,
          })
          .execute()

        // Create team member
        await pg
          .insertInto('TeamMember')
          .values({
            teamId: team.id,
            userId: authData.user.id,
          })
          .execute()
      } else {
        // Create individual entry
        await pg
          .insertInto('Entry')
          .values({
            userId: authData.user.id,
            teamId: null,
            ticketTypeId: ticketType.id,
          })
          .execute()
      }

      createdCount++

      if (ticketType.teamSize > 1) {
        console.log(
          `✓ Created user ${createdCount}: ${user.name} (${user.email}) - ${ticketType.name} - ${teamName}`,
        )
      } else {
        console.log(
          `✓ Created user ${createdCount}: ${user.name} (${user.email}) - ${ticketType.name}`,
        )
      }
    } catch (error: any) {
      console.error(`✗ Failed to create user ${i + 1}:`, error.message)
    }
  }

  console.log(
    `\n🎉 Successfully created ${createdCount}/${numUsers} users for competition ${competitionId}`,
  )
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length !== 2) {
    console.log('Usage: npm run populate:users <competitionId> <numUsers>')
    console.log('Example: npm run populate:users clrx1234567890 20')
    process.exit(1)
  }

  const [competitionId, numUsersStr] = args
  const numUsers = parseInt(numUsersStr, 10)

  if (isNaN(numUsers) || numUsers <= 0) {
    console.error('Number of users must be a positive integer')
    process.exit(1)
  }

  try {
    await populateUsers(competitionId, numUsers)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
