import React from 'react'
import { Label } from '../src/components/ui/label'
import { Input } from '../src/components/ui/input'
import { Dayjs } from 'dayjs'

type Props = {
 startDateTime: Dayjs
 endDateTime: Dayjs
 timezone: string
 onChangeStart?: (date: Dayjs | null, time: Dayjs | null) => void
 onChangeEnd?: (date: Dayjs | null, time: Dayjs | null) => void
 startLabel?: string
 endLabel?: string
 startTimeLabel?: string
 endTimeLabel?: string
}

const DateTimePickers: React.FC<Props> = ({
 startDateTime,
 endDateTime,
 onChangeStart,
 onChangeEnd,
 timezone,
 startLabel = 'Start Date',
 endLabel = 'End Date',
 startTimeLabel = 'Start Time',
 endTimeLabel = 'End Time',
}) => {
 const timeZoneShort = new Date()
  .toLocaleString('en-US', {
   timeZone: timezone ?? 'UTC',
   timeZoneName: 'short',
  })
  .split(' ')
  .pop()

 const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!onChangeStart) return
  const date = e.target.value
   ? startDateTime
     .set('year', parseInt(e.target.value.split('-')[0]))
     .set('month', parseInt(e.target.value.split('-')[1]) - 1)
     .set('date', parseInt(e.target.value.split('-')[2]))
   : null
  onChangeStart(date, startDateTime)
 }

 const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!onChangeStart) return
  const [hours, minutes] = e.target.value.split(':')
  const time = startDateTime
   .set('hour', parseInt(hours))
   .set('minute', parseInt(minutes))
  onChangeStart(startDateTime, time)
 }

 const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!onChangeEnd) return
  const date = e.target.value
   ? endDateTime
     .set('year', parseInt(e.target.value.split('-')[0]))
     .set('month', parseInt(e.target.value.split('-')[1]) - 1)
     .set('date', parseInt(e.target.value.split('-')[2]))
   : null
  onChangeEnd(date, endDateTime)
 }

 const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!onChangeEnd) return
  const [hours, minutes] = e.target.value.split(':')
  const time = endDateTime.set('hour', parseInt(hours)).set('minute', parseInt(minutes))
  onChangeEnd(endDateTime, time)
 }

 return (
  <div className="flex flex-col space-y-6 pt-3">
   <div className="grid gap-2">
    <Label>Start Date and Time</Label>
    <div className="flex gap-2">
     <Input
      type="date"
      value={startDateTime.format('YYYY-MM-DD')}
      onChange={handleStartDateChange}
      className="flex-1"
     />
     <Input
      type="time"
      value={startDateTime.format('HH:mm')}
      onChange={handleStartTimeChange}
      className="flex-1"
     />
    </div>
    <Label className="mt-4">End Date and Time</Label>
    <div className="flex gap-2">
     <Input
      type="date"
      value={endDateTime.format('YYYY-MM-DD')}
      onChange={handleEndDateChange}
      className="flex-1"
     />
     <Input
      type="time"
      value={endDateTime.format('HH:mm')}
      onChange={handleEndTimeChange}
      className="flex-1"
     />
    </div>
    <div className="text-sm">
     All times are in{' '}
     {timezone.includes('London') ? 'UK Time' : timezone.replace(/_/g, ' ')}
    </div>
   </div>
  </div>
 )
}

export default DateTimePickers
