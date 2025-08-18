import React, { useState } from 'react'
import { Trophy, Calendar, Plus } from 'lucide-react'
import CustomizedTooltips from '../Tooltip'
import clsx from 'clsx'
import Chip from '../Chip'
import { makeInviteLink } from '../../utils/makeInviteLink'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import {
  GetCompetitionByIdQuery,
  InvitationStatus,
  User,
  useGetEntryByUserAndCompetitionQuery,
  useGetUserScheduleQuery,
  useGetHeatsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import { Card, CardContent } from '../../src/components/ui/card'

const LeaderboardModal = dynamic(() => import('./LeaderboardModal'))
const ScheduleModal = dynamic(() => import('./ScheduleModal'))
const InviteModal = dynamic(() => import('./InviteModal'))

type Props = {
  user: User | null
  competition: GetCompetitionByIdQuery['getCompetitionById'] | null
}

const Registered = (props: Props) => {
  const { user, competition } = props
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [openInviteModal, setOpenInviteModal] = useState(false)
  const { data, refetch } = useGetEntryByUserAndCompetitionQuery({
    variables: {
      userId: user?.id || '',
      competitionId: competition?.id || '',
    },
  })

  const entry = data?.getEntryByUserAndCompetition || null
  const team = entry?.team || null
  const location = `${competition?.address?.venue}, ${competition?.address?.city}, ${competition?.address?.country}`
  const eventDetails = {
    title: competition?.name,
    location,
    description: competition?.description,
    startDate: dayjs(competition?.startDateTime).format('YYYYMMDDTHHmmSSZ'),
    endDate: dayjs(competition?.endDateTime).format('YYYYMMDDTHHmmSSZ'),
  }
  const isReleased = dayjs(competition?.releaseDateTime).isBefore(dayjs())
  const pendingInvitations = team?.invitations
    .filter((invitation) => invitation?.status === InvitationStatus.Pending)
    .filter((invitation) => invitation?.email)
  const ticketTypeId = data?.getEntryByUserAndCompetition?.ticketTypeId
  const token = data?.getEntryByUserAndCompetition?.invitationToken
  const eventLink = ticketTypeId && token ? makeInviteLink(ticketTypeId, token) : null

  const createGoogleCalendarUrl = () => {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails?.title || '',
    )}&dates=${eventDetails.startDate || ''}/${
      eventDetails.endDate || ''
    }&details=${encodeURIComponent(
      eventDetails?.description || '',
    )}&location=${encodeURIComponent(eventDetails.location || '')}`
  }

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true)
  }

  const handleInviteMember = () => {
    setOpenInviteModal(true)
  }

  const handleShowSchedule = () => {
    setShowSchedule(true)
  }

  const { data: scheduleData } = useGetUserScheduleQuery({
    variables: {
      userId: user?.id || '',
      competitionId: competition?.id || '',
    },
    skip: !user?.id || !competition?.id,
    fetchPolicy: 'network-only',
  })
  const hasSchedule = (scheduleData?.getUserSchedule?.length || 0) > 0

  const { data: heatsData } = useGetHeatsByCompetitionIdQuery({
    variables: { competitionId: competition?.id || '' },
    skip: !competition?.id,
    fetchPolicy: 'cache-and-network',
  })
  const hasAssignedHeats = Boolean(
    heatsData?.getHeatsByCompetitionId?.some((h) => (h?.registrationsCount || 0) > 0),
  )

  return (
    <>
      <div className="mt-12">
        <Card className="bg-card border border-border shadow">
          <CardContent className="p-6 text-card-foreground">
            {user?.email && (
              <>
                <p className="text-2xl font-bold mb-2 text-white">You're In!</p>
                <p className="text-sm mb-4 !text-slate-300">
                  A confirmation email has been sent to{' '}
                  <strong className="text-white">{user.email}</strong>.
                </p>
              </>
            )}
            {team && (
              <>
                <p className="text-sm font-semibold mt-4 !text-slate-200">
                  Your Team{team.name ? `"${team.name}"` : ``}:
                </p>
                <ul className="list-disc ml-5 mt-2 text-sm space-y-2 !text-slate-300">
                  {team.members.map((member, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center truncate">
                        {member?.user?.email && (
                          <>
                            <span className="mr-2">•</span>
                            {member.user.email}
                          </>
                        )}
                      </div>
                      <div className="flex items-center flex-shrink-0 space-x-2">
                        <Chip
                          label={member.isCaptain ? 'Captain' : 'Member'}
                          secondary={member.isCaptain}
                        />
                      </div>
                    </li>
                  ))}
                  {pendingInvitations?.map((invitee, index) => (
                    <li
                      key={invitee?.email ?? '' + index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center truncate">
                        <span className="mr-2">•</span>
                        {invitee?.email}
                      </div>
                      <div className="flex items-center flex-shrink-0 space-x-2">
                        <Chip label={'Pending'} className="ml-2 bg-slate-500" />
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleInviteMember}
                  className="mt-4 text-sm text-purple-300 hover:text-purple-400 flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Invite Teammates
                </button>
                <hr className="my-4 border-slate-700" />
              </>
            )}
            <a
              href={createGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="border w-fit text-sm border-slate-600 text-white hover:border-slate-500 hover:text-slate-200 font-semibold py-1 px-3 rounded-xl flex items-center"
            >
              <Calendar className="mr-1 h-4 w-4" />
              Add to Calendar
            </a>
            <hr className="my-4 border-slate-700" />
            {competition?.hasWorkouts && (
              <div className="flex space-x-4">
                <CustomizedTooltips
                  title={
                    !isReleased
                      ? `Will be released on ${dayjs(competition?.releaseDateTime).format(
                          'MMMM D, YYYY h:mm A',
                        )}`
                      : ''
                  }
                >
                  <button
                    onClick={isReleased ? handleShowLeaderboard : undefined}
                    className={clsx(
                      'border text-sm font-semibold py-1 px-3 rounded-xl flex items-center',
                      isReleased
                        ? 'border-slate-600 text-white hover:border-slate-500 hover:text-slate-200'
                        : 'border-slate-700 text-slate-500 cursor-not-allowed',
                    )}
                  >
                    <Trophy className="mr-1 h-4 w-4" />
                    <span className="hidden text-sm lg:block">View Leaderboard</span>
                    <span className="block text-sm lg:hidden">Leaderboard</span>
                  </button>
                </CustomizedTooltips>
                {(hasAssignedHeats || hasSchedule) && (
                  <CustomizedTooltips title={''}>
                    <button
                      onClick={handleShowSchedule}
                      className={clsx(
                        'border text-sm font-semibold py-1 px-3 rounded-xl flex items-center',
                        'border-slate-600 text-white hover:border-slate-500 hover:text-slate-200',
                      )}
                    >
                      <Calendar className="mr-1 h-4 w-4" />
                      <span className="hidden text-sm lg:block">Your Schedule</span>
                      <span className="block text-sm lg:hidden">Schedule</span>
                    </button>
                  </CustomizedTooltips>
                )}
              </div>
            )}

            <p className="text-sm mt-4 !text-slate-300">
              No longer able to attend?
              <a
                href="mailto:your-email@example.com"
                className="text-sm text-purple-300 hover:text-purple-400"
              >
                {' Notify the hosts here.'}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        competitionId={competition?.id || ''}
      />
      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        userId={user?.id || ''}
        competitionId={competition?.id || ''}
      />
      <InviteModal
        refetch={refetch}
        open={openInviteModal}
        handleClose={() => setOpenInviteModal(false)}
        eventLink={eventLink}
      />
    </>
  )
}

export default Registered
