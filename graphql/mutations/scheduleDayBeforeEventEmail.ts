import { extendType, idArg, nonNull } from 'nexus'
import getKysely from '../../src/db'
import MailgunManager from '../../lib/MailgunManager'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const ScheduleDayBeforeEventEmail = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('scheduleDayBeforeEventEmail', {
      args: {
        competitionId: nonNull(idArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        //   resolve: async (_parent, _, ctx) => {
        // const competitionId = 'TeAr4u'
        const userId = ctx.user?.id
        if (!userId) {
          throw new Error('User not authenticated')
        }

        const pg = getKysely()

        const competition = await ctx.loaders.competitionLoader.load(competitionId)
        console.log('🚀 ~ competition:', competition)

        if (!competition) {
          throw new Error('Competition not found')
        }

        const participants = await pg
          .selectFrom('Registration')
          .innerJoin('User', 'User.id', 'Registration.userId')
          .select(['User.id', 'User.email', 'User.firstName'])
          .where('Registration.competitionId', '=', competitionId)
          .execute()

        // const participants = await pg
        //   .selectFrom('Registration')
        //   .innerJoin('User', 'User.id', 'Registration.userId')
        //   .innerJoin('TicketType', 'TicketType.id', 'Registration.ticketTypeId')
        //   .select([
        //     'User.id',
        //     'User.email',
        //     'User.firstName',
        //     'TicketType.name as ticketTypeName',
        //   ])
        //   .where('Registration.competitionId', '=', competitionId)
        //   .execute()

        console.log('🚀 ~ participants:', participants)

        const workouts = await pg
          .selectFrom('Workout')
          .select(['id', 'name', 'description'])
          .where('competitionId', '=', competitionId)
          .execute()

        const allParticipantHeats = await pg
          .selectFrom('Lane')
          .innerJoin('Heat', 'Heat.id', 'Lane.heatId')
          .innerJoin('Entry', 'Entry.id', 'Lane.entryId')
          .select(['Entry.userId', 'Heat.startTime', 'Heat.workoutId'])
          .where(
            'Heat.workoutId',
            'in',
            workouts.map((w) => w.id),
          )
          .execute()

        const mailgunManager = new MailgunManager()

        for (const participant of participants) {
          const participantHeats = allParticipantHeats.filter(
            (heat) => heat.userId === participant.id,
          )

          const emailContent = generateEmailContent(
            participant,
            competition,
            workouts,
            participantHeats,
          )

          console.log('emailContent', emailContent)

          await mailgunManager.sendEmail({
            to: 'nickoferrall@gmail.com',
            // to: participant.email,
            subject: `${competition.name} is happening tomorrow`,
            html: emailContent,
          })

          // Break after sending one email
          // break
        }

        return true
      },
    })
  },
})

interface Participant {
  id: string
  email: string
  firstName: string
}

interface Competition {
  id: string
  name: string
  startDateTime: Date
  timezone: string | null
}

interface Workout {
  id: string
  name: string
  description: string
}

interface ParticipantHeat {
  startTime: Date
  workoutId: string
}

function generateEmailContent(
  participant: Participant,
  competition: Competition,
  workouts: Workout[],
  participantHeats: ParticipantHeat[],
): string {
  let content = `<p>Hello ${participant.firstName},</p>`
  content += `<p>This is a reminder that ${competition.name} is happening tomorrow!</p>`

  if (participantHeats.length > 0) {
    const heat = participantHeats[0] // Assuming there's only one heat
    const heatTime = dayjs(heat.startTime)
      .tz(competition.timezone || 'UTC')
      .format('h:mm A') // Use 12-hour format for consistency with other emails
    content += `<p>Your heat time is <strong>${heatTime}</strong></p>`
  }

  content += `<p>You can find more information about the event, including the leaderboard, here: <a href="https://fitlo.co/event/${competition.id}?sl=true">https://fitlo.co/event/${competition.id}?sl=true</a></p>`
  content += `<p>Have fun!<br>`
  content += `The Fitlo Team</p>`

  return content
}
