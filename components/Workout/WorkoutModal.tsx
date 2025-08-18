import React, { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Textarea } from '../../src/components/ui/textarea'
import {
  WhiteBgSelect,
  WhiteBgSelectContent,
  WhiteBgSelectItem,
  WhiteBgSelectTrigger,
  WhiteBgSelectValue,
} from '../../src/components/ui/white-bg-select'
import {
  GetWorkoutsByCompetitionIdQuery,
  ScoreType,
  Unit,
  useCreateWorkoutMutation,
  useDeleteWorkoutMutation,
  useUpdateWorkoutMutation,
} from '../../src/generated/graphql'
import DateTimePicker from '../DateTimePicker'
import dayjs, { Dayjs } from 'dayjs'
import CustomizedTooltips from '../Tooltip'
import useCompetitionId from '../../hooks/useCompetitionId'
import { useCompetition } from '../../contexts/CompetitionContext'
import DeleteModal from '../DeleteModal'
import ErrorMessage from '../Layout/ErrorMessage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../src/components/ui/alert-dialog'
import { searchCuratedVideos, CuratedVideo } from '../../utils/curatedVideos'
import { Search, Plus, ExternalLink, Video, X, Edit2, Check } from 'lucide-react'

type Workout = GetWorkoutsByCompetitionIdQuery['getWorkoutsByCompetitionId'][0]

type Props = {
  open: boolean
  onClose: () => void
  refetch: () => void
  workout?: Workout
}

type FormData = {
  id: string
  name: string
  description: string
  location: string
  timeCap: number
  releaseDateTime: Dayjs | null
  scoreType: ScoreType
  unitOfMeasurement: Unit
  showTimeCap: boolean
}

const getDefaultFormData = (competitionStartDate?: string | null) => ({
  id: '',
  name: '',
  description: '',
  location: 'Competition Floor',
  timeCap: 0,
  releaseDateTime: competitionStartDate
    ? dayjs(competitionStartDate).hour(9).minute(0).second(0)
    : dayjs().add(1, 'day').hour(9).minute(0).second(0),
  scoreType: ScoreType.RepsLessIsBetter,
  unitOfMeasurement: Unit.Reps,
  showTimeCap: false,
})

// Convert minutes.seconds format to total seconds
const convertTimeCapToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0
  const [minutes, seconds] = timeStr.split('.')
  const totalSeconds =
    (parseInt(minutes) || 0) * 60 + (parseInt(seconds?.padEnd(2, '0').slice(0, 2)) || 0)
  return totalSeconds
}

// Convert seconds to minutes.seconds format for display
const formatTimeCapFromSeconds = (seconds: number): string => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}.${remainingSeconds.toString().padStart(2, '0')}`
}

const WorkoutModal = (props: Props) => {
  const { open, onClose, refetch, workout } = props
  const [formData, setFormData] = useState<FormData | null>(null)
  const [updateWorkout, { error: updateError }] = useUpdateWorkoutMutation()
  const [createWorkout, { error: createError }] = useCreateWorkoutMutation()
  const [deleteWorkout, { error: deleteError }] = useDeleteWorkoutMutation()
  const [timeCapInputValue, setTimeCapInputValue] = useState<string>('')
  const competitionId = useCompetitionId()
  const { startDateTime } = useCompetition()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const isEditMode = Boolean(workout)
  const canDelete = isEditMode
  const error = updateError?.message || createError?.message
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)

  // Movement Standards state
  const [videos, setVideos] = useState<Array<{ title: string; url: string }>>([])
  const [videoSearchQuery, setVideoSearchQuery] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isAddingVideo, setIsAddingVideo] = useState(false)

  console.log('🚀 ~ hasUnsavedChanges:', hasUnsavedChanges)

  useEffect(() => {
    if (!workout) {
      const defaultFormData = getDefaultFormData(startDateTime)
      setFormData(defaultFormData)
      setTimeCapInputValue('')
      setVideos([])
      return
    }
    const newFormData = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      location: workout.location,
      timeCap: workout.timeCap,
      unitOfMeasurement: workout.unitOfMeasurement,
      releaseDateTime: workout.releaseDateTime ? dayjs(workout.releaseDateTime) : null,
      scoreType: workout.scoreType,
      showTimeCap: !!(workout.timeCap && workout.timeCap > 0),
    }
    setFormData(newFormData)
    setTimeCapInputValue(workout.timeCap ? formatTimeCapFromSeconds(workout.timeCap) : '')

    // Load existing videos
    if (workout.videos) {
      setVideos(
        workout.videos
          .filter((video) => video !== null)
          .map((video) => ({
            title: video.title,
            url: video.url,
          })),
      )
    }
  }, [workout, startDateTime])

  useEffect(() => {
    const seconds = convertTimeCapToSeconds(timeCapInputValue)
    setFormData((prev) => (prev ? { ...prev, timeCap: seconds } : null))
  }, [timeCapInputValue])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setHasUnsavedChanges(true)
    if (e.target.name === 'scoreType') {
      // Auto-select appropriate unit based on score type
      let defaultUnit = Unit.Reps
      switch (e.target.value) {
        case ScoreType.WeightMoreIsBetter:
        case ScoreType.WeightLessIsBetter:
          defaultUnit = Unit.Kilograms
          break
        case ScoreType.TimeMoreIsBetter:
        case ScoreType.TimeLessIsBetter:
          defaultUnit = Unit.Minutes
          break
        case ScoreType.RepsMoreIsBetter:
        case ScoreType.RepsLessIsBetter:
          defaultUnit = Unit.Reps
          break
        case ScoreType.RepsOrTimeCompletionBased:
          defaultUnit = Unit.Reps
          break
      }
      setFormData({
        ...formData,
        scoreType: e.target.value as ScoreType,
        unitOfMeasurement: defaultUnit,
      } as FormData)
      return
    }
    if (e.target.name === 'showTimeCap') {
      const showTimeCap = e.target.value === 'yes'
      setFormData({
        ...formData,
        showTimeCap,
        timeCap: showTimeCap ? formData?.timeCap : 0,
      } as FormData)
      return
    }
    if (e.target.name === 'timeCap') {
      setTimeCapInputValue(e.target.value)
      return
    }

    if (
      e.target.name === 'price' ||
      e.target.name === 'teamSize' ||
      e.target.name === 'maxEntries'
    ) {
      setFormData({
        ...formData,
        [e.target.name]: parseFloat(e.target.value),
      } as FormData)
      return
    }

    setFormData({ ...formData, [e.target.name]: e.target.value } as FormData)
  }

  const handleReleaseDate = (date: Dayjs | null, time: Dayjs | null) => {
    if (!date || !time) return

    setHasUnsavedChanges(true)
    const combinedDateTime = date
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second())

    setFormData((prevState: any) => ({
      ...prevState,
      releaseDateTime: combinedDateTime,
    }))
  }

  const clearForm = () => {
    if (!workout) {
      const defaultFormData = getDefaultFormData(startDateTime)
      setFormData(defaultFormData)
      setTimeCapInputValue('')
      setVideos([])
      return
    }
    const newFormData = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      location: workout.location,
      timeCap: workout.timeCap,
      unitOfMeasurement: workout.unitOfMeasurement,
      releaseDateTime: workout.releaseDateTime ? dayjs(workout.releaseDateTime) : null,
      scoreType: workout.scoreType,
      showTimeCap: !!(workout.timeCap && workout.timeCap > 0),
    }
    setFormData(newFormData)
    setTimeCapInputValue(workout.timeCap ? formatTimeCapFromSeconds(workout.timeCap) : '')

    if (workout.videos) {
      setVideos(
        workout.videos
          .filter((video) => video !== null)
          .map((video) => ({
            title: video.title,
            url: video.url,
          })),
      )
    } else {
      setVideos([])
    }
  }

  const closeAndReset = () => {
    onClose()
    if (!workout) {
      const defaultFormData = getDefaultFormData(startDateTime)
      setFormData(defaultFormData)
      setTimeCapInputValue('')
      setVideos([])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!formData) return

      // Prepare videos data
      const videosData = videos.map((video, index) => ({
        title: video.title,
        description: null,
        url: video.url,
        orderIndex: index,
      }))

      if (workout) {
        await updateWorkout({
          variables: {
            id: workout.id,
            input: {
              name: formData.name,
              description: formData.description,
              location: formData.location,
              scoreType: formData.scoreType,
              timeCap: formData.timeCap,
              releaseDateTime: formData.releaseDateTime?.toISOString(),
              unitOfMeasurement: formData.unitOfMeasurement,
              includeStandardsVideo: videos.length > 0,
              videos: videosData,
            },
          },
        })
        refetch()
        closeAndReset()
      } else {
        await createWorkout({
          variables: {
            input: {
              name: formData.name,
              description: formData.description,
              location: formData.location,
              scoreType: formData.scoreType,
              timeCap: formData.timeCap,
              releaseDateTime: formData.releaseDateTime?.toISOString(),
              competitionId: competitionId,
              unitOfMeasurement: formData.unitOfMeasurement,
              includeStandardsVideo: videos.length > 0,
              videos: videosData,
            },
          },
        })
        closeAndReset()
        refetch()
      }
      setHasUnsavedChanges(false)
    } catch (error: any) {
      console.error('Error updating workout:', error)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true)
      return
    }
    onClose()
  }

  const handleConfirmClose = () => {
    setHasUnsavedChanges(false)
    setShowUnsavedChangesDialog(false)
    clearForm()
    onClose()
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout({ variables: { id } })
      refetch()
      setIsDeleteModalOpen(false)
      handleClose()
    } catch (error) {
      console.error('Error deleting ticket type:', error)
    }
  }

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true)
  }

  const handleClickSecondary = () => {
    if (canDelete) {
      handleOpenDeleteModal()
    } else {
      handleClose()
    }
  }

  // Video management functions
  const searchResults = searchCuratedVideos(videoSearchQuery)

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string): string => {
    try {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : ''
    } catch {
      return ''
    }
  }

  // Helper function to get YouTube video title
  const getYouTubeTitle = async (url: string): Promise<string> => {
    try {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      if (!videoId) return 'Custom Video'

      // Use YouTube oEmbed API to get video title
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      )
      if (response.ok) {
        const data = await response.json()
        return data.title || 'Custom Video'
      }
      return 'Custom Video'
    } catch {
      return 'Custom Video'
    }
  }

  const addCustomVideo = async () => {
    if (!newVideoUrl.trim() || isAddingVideo) return

    setIsAddingVideo(true)
    try {
      // Get the actual YouTube title
      const title = await getYouTubeTitle(newVideoUrl.trim())
      setVideos((prev) => [...prev, { title, url: newVideoUrl.trim() }])
      setNewVideoUrl('')
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error adding video:', error)
      // Fallback to default title if there's an error
      setVideos((prev) => [...prev, { title: 'Custom Video', url: newVideoUrl.trim() }])
      setNewVideoUrl('')
      setHasUnsavedChanges(true)
    } finally {
      setIsAddingVideo(false)
    }
  }

  const startEditingTitle = (index: number) => {
    setEditingVideoIndex(index)
    setEditingTitle(videos[index].title)
  }

  const saveEditedTitle = () => {
    if (editingVideoIndex !== null && editingTitle.trim()) {
      setVideos((prev) =>
        prev.map((video, index) =>
          index === editingVideoIndex ? { ...video, title: editingTitle.trim() } : video,
        ),
      )
      setEditingVideoIndex(null)
      setEditingTitle('')
      setHasUnsavedChanges(true)
    }
  }

  const cancelEditingTitle = () => {
    setEditingVideoIndex(null)
    setEditingTitle('')
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
    setHasUnsavedChanges(true)
  }

  if (!formData) return null
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{workout ? 'Update Workout' : 'Create Workout'}</DialogTitle>
            <DialogDescription>Fill in the workout details below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description ?? ''}
                onChange={handleChange}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Competition Floor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scoreType">Scoring Type</Label>
              <WhiteBgSelect
                name="scoreType"
                value={formData.scoreType}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'scoreType', value } } as any)
                }
              >
                <WhiteBgSelectTrigger>
                  <WhiteBgSelectValue placeholder="Select scoring type" />
                </WhiteBgSelectTrigger>
                <WhiteBgSelectContent>
                  <WhiteBgSelectItem value={ScoreType.RepsMoreIsBetter}>
                    Reps - more is better
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={ScoreType.RepsLessIsBetter}>
                    Reps - less is better
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={ScoreType.WeightMoreIsBetter}>
                    Weight - more is better
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={ScoreType.TimeLessIsBetter}>
                    Time - less is better
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={ScoreType.TimeMoreIsBetter}>
                    Time - more is better
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={ScoreType.RepsOrTimeCompletionBased}>
                    Reps or Time (completion-based)
                  </WhiteBgSelectItem>
                </WhiteBgSelectContent>
              </WhiteBgSelect>

              {formData.scoreType === ScoreType.RepsOrTimeCompletionBased && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Completion-based scoring</p>
                      <p>
                        Athletes who complete the workout get time-based scores. Athletes
                        who don't complete the workout get rep-based scores. All completed
                        athletes rank above incomplete athletes, regardless of time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitOfMeasurement">Units</Label>
              <WhiteBgSelect
                name="unitOfMeasurement"
                value={formData.unitOfMeasurement}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'unitOfMeasurement', value } } as any)
                }
              >
                <WhiteBgSelectTrigger>
                  <WhiteBgSelectValue placeholder="Select unit" />
                </WhiteBgSelectTrigger>
                <WhiteBgSelectContent>
                  <WhiteBgSelectItem value={Unit.Reps}>Reps</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Feet}>Feet</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Meters}>Meters</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Kilometers}>
                    Kilometers
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Kilograms}>Kilograms</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Pounds}>Pounds</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Miles}>Miles</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Placement}>Placement</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Calories}>Calories</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Round}>Round</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Seconds}>Seconds</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Minutes}>Minutes</WhiteBgSelectItem>
                  <WhiteBgSelectItem value={Unit.Other}>Other</WhiteBgSelectItem>
                </WhiteBgSelectContent>
              </WhiteBgSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showTimeCap">Time Cap?</Label>
              <WhiteBgSelect
                name="showTimeCap"
                value={formData.showTimeCap ? 'yes' : 'no'}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'showTimeCap', value } } as any)
                }
              >
                <WhiteBgSelectTrigger>
                  <WhiteBgSelectValue />
                </WhiteBgSelectTrigger>
                <WhiteBgSelectContent>
                  <WhiteBgSelectItem value="yes">Yes</WhiteBgSelectItem>
                  <WhiteBgSelectItem value="no">No</WhiteBgSelectItem>
                </WhiteBgSelectContent>
              </WhiteBgSelect>
            </div>

            {formData.showTimeCap && (
              <div className="space-y-2">
                <Label htmlFor="timeCap">
                  Time Cap (Minutes and Seconds)
                  <CustomizedTooltips title="Enter as minutes.seconds (e.g., 13.30 for 13 minutes and 30 seconds)">
                    <Info className="h-4 w-4 ml-1 inline" />
                  </CustomizedTooltips>
                </Label>
                <Input
                  id="timeCap"
                  name="timeCap"
                  type="text"
                  pattern="\d*\.?\d{0,2}"
                  value={timeCapInputValue}
                  onChange={handleChange}
                  placeholder="13.30"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                When is this workout available?
                <CustomizedTooltips title="This is the date and time that athletes will be able to view the workout, schedule, and leaderboard. Choose today to make it available immediately.">
                  <Info className="h-4 w-4 cursor-help" />
                </CustomizedTooltips>
              </Label>
              <div className="grid gap-4">
                <DateTimePicker
                  endLabel="Release Date"
                  endDateTime={dayjs(formData.releaseDateTime) ?? dayjs().add(1, 'day')}
                  timezone="UTC"
                  endTimeLabel="Release Time"
                  onChangeEnd={handleReleaseDate}
                />
              </div>
            </div>

            {/* Movement Standards Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <Label className="text-base font-medium">Movement Standards Videos</Label>
              </div>

              {/* Existing Videos */}
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        {editingVideoIndex === index ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="text-sm font-medium"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditedTitle()
                                if (e.key === 'Escape') cancelEditingTitle()
                              }}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                saveEditedTitle()
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                cancelEditingTitle()
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{video.title}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                startEditingTitle(index)
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Video
                        </a>
                      </div>
                      {editingVideoIndex !== index && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeVideo(index)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Video */}
              <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="space-y-2">
                  <Label>Search for Movement Videos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                    <Input
                      placeholder="Type movement name (e.g., Burpees, Box Jumps, Pull-ups)"
                      value={videoSearchQuery}
                      onChange={(e) => setVideoSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {videoSearchQuery && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                      {searchResults.slice(0, 5).map((video, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            // Use the video title as default
                            setVideos((prev) => [
                              ...prev,
                              { title: video.title, url: video.url },
                            ])
                            setVideoSearchQuery('')
                            setHasUnsavedChanges(true)
                          }}
                        >
                          {/* Video Thumbnail - Larger */}
                          <div className="w-24 h-18 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            <img
                              src={getYouTubeThumbnail(video.url)}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.title}</p>
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Video
                            </a>
                          </div>

                          <Button size="sm" variant="ghost">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center text-sm">or</div>

                <div className="space-y-2">
                  <Label>Add Custom Video URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCustomVideo}
                      disabled={!newVideoUrl.trim() || isAddingVideo}
                      size="sm"
                    >
                      {isAddingVideo ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <ErrorMessage error={error} />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant={canDelete ? 'destructive' : 'secondary'}
                onClick={handleClickSecondary}
              >
                {canDelete ? 'Delete' : 'Cancel'}
              </Button>
              <Button type="submit">{canDelete ? 'Update' : 'Submit'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        handleDelete={handleDelete}
        id={formData.id}
        title={`Delete ${formData.name}`}
        description="Are you sure you want to delete this workout?"
        error={deleteError?.message}
      />

      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your changes will
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default WorkoutModal
