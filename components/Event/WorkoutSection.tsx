import React, { useState } from 'react'
import { useGetWorkoutsByCompetitionIdQuery } from '../../src/generated/graphql'
import { GetDirectoryCompsQuery } from '../../src/generated/graphql'

// Convert seconds to minutes:seconds format for display
const formatTimeCapFromSeconds = (seconds: number): string => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

type Event = GetDirectoryCompsQuery['getDirectoryComps'][0]

interface WorkoutSectionProps {
  event: Event
}

const WorkoutSection: React.FC<WorkoutSectionProps> = ({ event }) => {
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)
  const { data: workoutsData, loading: workoutsLoading } =
    useGetWorkoutsByCompetitionIdQuery({
      variables: { competitionId: event.competitionId! },
      skip: !event.competitionId,
    })

  const workouts = workoutsData?.getWorkoutsByCompetitionId || []
  const hasWorkouts = workouts.length > 0
  const isWorkoutReleased = workouts.some(
    (workout) => new Date() >= new Date(workout.releaseDateTime),
  )

  const getEmbedUrl = (url: string) => {
    if (url.includes('vimeo.com')) {
      const [, videoId] = url.match(/vimeo\.com\/(\d+)/) || []
      return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const [, videoId] =
        url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
        ) || []
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  return (
    <div className="mt-8 w-full max-w-2xl">
      <div>
        <h2 className="text-xl font-bold font-montserrat text-white not-prose pb-2">
          {hasWorkouts && workouts.length > 1 ? 'Workouts' : 'Workout'}
        </h2>
        <hr className="mb-2 border-gray-200 w-full" />
        {workoutsLoading ? (
          <p className="text-base">Loading workout information...</p>
        ) : hasWorkouts && isWorkoutReleased ? (
          <div className="space-y-6">
            {workouts.map((workout) => {
              return (
                <div key={workout.id} className="space-y-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg text-white">{workout.name}</h4>
                    <p className="text-sm mt-1 whitespace-pre-wrap text-white">
                      {workout.description}
                    </p>
                    {workout.timeCap ? (
                      <p className="text-xs mt-2 font-medium text-white">
                        Time Cap: {formatTimeCapFromSeconds(workout.timeCap)} minutes
                      </p>
                    ) : null}
                  </div>

                  {/* Movement Standards Section */}
                  {workout.includeStandardsVideo && (
                    <div className="mt-4">
                      <button
                        onClick={() =>
                          setExpandedWorkout(
                            expandedWorkout === workout.id ? null : workout.id,
                          )
                        }
                        className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="font-medium flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 00-3-3H6a3 3 0 00-3 3v10a3 3 0 003 3h12a3 3 0 003-3v-1M9 9l3 3 3-3"
                            />
                          </svg>
                          Movement Standards
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            expandedWorkout === workout.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {expandedWorkout === workout.id && (
                        <div className="mt-4 space-y-4">
                          {workout.videos && workout.videos.length > 0 ? (
                            <div className="space-y-4">
                              {workout.videos.map(
                                (video) =>
                                  video && (
                                    <div
                                      key={video.id}
                                      className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                      <h5 className="font-medium mb-2">{video.title}</h5>
                                      {video.description && (
                                        <p className="text-sm mb-3">
                                          {video.description}
                                        </p>
                                      )}
                                      <div className="aspect-video">
                                        {video.url.includes('cloudinary.com') ? (
                                          <video
                                            src={video.url}
                                            title={video.title}
                                            className="w-full h-full rounded"
                                            controls
                                            preload="metadata"
                                            controlsList="nodownload"
                                          >
                                            Your browser does not support the video tag.
                                          </video>
                                        ) : (
                                          <iframe
                                            src={getEmbedUrl(video.url)}
                                            title={video.title}
                                            className="w-full h-full rounded"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ),
                              )}
                            </div>
                          ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-sm">
                                Movement standards videos will be available here when
                                configured by the organizer.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : hasWorkouts ? (
          <p className="text-base">
            Workout details will be released on{' '}
            {new Date(workouts[0].releaseDateTime).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-base">
            Workout details will be available closer to the event date.
          </p>
        )}
      </div>
    </div>
  )
}

export default WorkoutSection
