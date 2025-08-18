import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'
import {
  GetCompetitionByIdQuery,
  useUpdateCompetitionMutation,
} from '../../src/generated/graphql'
import dayjs, { Dayjs } from 'dayjs'
import ErrorMessage from '../Layout/ErrorMessage'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Textarea } from '../../src/components/ui/textarea'
import { Button } from '../../src/components/ui/button'
import { Calendar } from '../../src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { cn } from '../../src/lib/utils'
import timezoneData from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
dayjs.extend(timezoneData)

type Comp = GetCompetitionByIdQuery['getCompetitionById']

type Props = {
  open: boolean
  onClose: () => void
  comp: Comp
  refetch: () => void
}

type FormData = {
  name: string
  orgName: string
  description: string
  email: string
  website: string
  startDateTime: Dayjs
  endDateTime: Dayjs
  timezone: string
  venue: string
  street: string
  city: string
  country: string
  postcode: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
}

const TIMEZONES = [
  'Europe/London',
  'Europe/Dublin',
  'Europe/Amsterdam',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Kuala_Lumpur',
  'Asia/Jakarta',
  'Asia/Manila',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Vancouver',
  'America/Toronto',
  'UTC',
]

const EditDetailsModal = ({ open, onClose, comp, refetch }: Props) => {
  const defaultData = {
    name: comp?.name ?? '',
    orgName: comp?.orgName ?? comp?.org?.name ?? '',
    description: comp?.description ?? '',
    email: comp?.org?.email ?? '',
    website: comp?.org?.website ?? '',
    startDateTime: comp?.startDateTime
      ? dayjs.utc(comp.startDateTime).tz(comp.timezone ?? 'UTC')
      : dayjs(),
    endDateTime: comp?.endDateTime
      ? dayjs.utc(comp.endDateTime).tz(comp.timezone ?? 'UTC')
      : dayjs(),
    timezone: comp?.timezone ?? '',
    venue: comp?.address.venue ?? '',
    street: comp?.address.street ?? '',
    city: comp?.address.city ?? '',
    country: comp?.address.country ?? '',
    postcode: comp?.address.postcode ?? '',
    facebook: comp?.org?.facebook ?? '',
    instagram: comp?.org?.instagram ?? '',
    twitter: comp?.org?.twitter ?? '',
    youtube: comp?.org?.youtube ?? '',
  }
  const [localFormData, setLocalFormData] = useState<FormData>(defaultData)
  const [updateComp, { error, loading }] = useUpdateCompetitionMutation()

  // Helper to get dayjs in selected timezone
  const getTz = (date: string | Dayjs) => dayjs.tz(date, localFormData.timezone || 'UTC')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLocalFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tz = e.target.value
    setLocalFormData((prev) => ({ ...prev, timezone: tz }))
    // Optionally, adjust start/end times to the new timezone
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // Convert start/end to UTC from selected timezone
      const startUtc = dayjs
        .tz(localFormData.startDateTime, localFormData.timezone)
        .toISOString()
      const endUtc = dayjs
        .tz(localFormData.endDateTime, localFormData.timezone)
        .toISOString()
      await updateComp({
        variables: {
          id: comp!.id as string,
          name: localFormData.name,
          description: localFormData.description,
          email: localFormData.email,
          startDateTime: startUtc,
          endDateTime: endUtc,
          venue: localFormData.venue,
          street: localFormData.street,
          city: localFormData.city,
          country: localFormData.country,
          postcode: localFormData.postcode,
          orgName: localFormData.orgName,
          facebook: localFormData.facebook,
          instagram: localFormData.instagram,
          twitter: localFormData.twitter,
          youtube: localFormData.youtube,
          timezone: localFormData.timezone,
        },
      })
      refetch()
      onClose()
    } catch (error) {
      console.error('Error updating competition:', error)
    }
  }

  const handleChangeStartDate = (date: Date | undefined) => {
    if (date) {
      const newStart = dayjs(date)
        .hour(localFormData.startDateTime.hour())
        .minute(localFormData.startDateTime.minute())
      setLocalFormData((prev) => ({
        ...prev,
        startDateTime: newStart,
        endDateTime: newStart.isAfter(prev.endDateTime)
          ? newStart.add(5, 'hour')
          : prev.endDateTime,
      }))
    }
  }

  const handleChangeStartTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    const [hours, minutes] = newTime.split(':').map(Number)
    const newStart = localFormData.startDateTime.hour(hours).minute(minutes)
    setLocalFormData((prev) => ({
      ...prev,
      startDateTime: newStart,
      endDateTime: newStart.isAfter(prev.endDateTime)
        ? newStart.add(5, 'hour')
        : prev.endDateTime,
    }))
  }

  const handleChangeEndDate = (date: Date | undefined) => {
    if (date) {
      const newEnd = dayjs(date)
        .hour(localFormData.endDateTime.hour())
        .minute(localFormData.endDateTime.minute())
      setLocalFormData((prev) => ({
        ...prev,
        endDateTime: newEnd,
        startDateTime: newEnd.isBefore(prev.startDateTime)
          ? newEnd.subtract(1, 'hour')
          : prev.startDateTime,
      }))
    }
  }

  const handleChangeEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    const [hours, minutes] = newTime.split(':').map(Number)
    const newEnd = localFormData.endDateTime.hour(hours).minute(minutes)
    setLocalFormData((prev) => ({
      ...prev,
      endDateTime: newEnd,
      startDateTime: newEnd.isBefore(prev.startDateTime)
        ? newEnd.subtract(1, 'hour')
        : prev.startDateTime,
    }))
  }

  if (!localFormData) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Event Name"
              value={localFormData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName">Organizer Name</Label>
            <Input
              id="orgName"
              name="orgName"
              placeholder="Organizer Name"
              value={localFormData.orgName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Event description"
              value={localFormData.description}
              onChange={handleChange}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Organiser Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              value={localFormData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              placeholder="Your website"
              value={localFormData.website}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              name="timezone"
              className="w-full border rounded p-2"
              value={localFormData.timezone}
              onChange={handleTimezoneChange}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !localFormData.startDateTime && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFormData.startDateTime ? (
                      format(localFormData.startDateTime.toDate(), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white text-gray-900"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={localFormData.startDateTime.toDate()}
                    onSelect={handleChangeStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                name="startTime"
                value={localFormData.startDateTime.format('HH:mm')}
                onChange={handleChangeStartTime}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !localFormData.endDateTime && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFormData.endDateTime ? (
                      format(localFormData.endDateTime.toDate(), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white text-gray-900"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={localFormData.endDateTime.toDate()}
                    onSelect={handleChangeEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                name="endTime"
                value={localFormData.endDateTime.format('HH:mm')}
                onChange={handleChangeEndTime}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              placeholder="Venue"
              value={localFormData.venue}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                name="street"
                placeholder="Street"
                value={localFormData.street}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="City"
                value={localFormData.city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                value={localFormData.country}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode/Zip Code</Label>
              <Input
                id="postcode"
                name="postcode"
                placeholder="Postcode/Zip Code"
                value={localFormData.postcode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                placeholder="Your Facebook page URL"
                value={localFormData.facebook}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="Your Instagram page URL"
                value={localFormData.instagram}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                name="twitter"
                placeholder="Your Twitter page URL"
                value={localFormData.twitter}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                name="youtube"
                placeholder="Your YouTube channel URL"
                value={localFormData.youtube}
                onChange={handleChange}
              />
            </div>
          </div>

          <ErrorMessage error={error?.message} />
          <DialogFooter>
            <Button
              className="hidden md:flex"
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  Saving
                  <span className="animate-pulse">...</span>
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDetailsModal
