import React from 'react'
import { Label } from '../src/components/ui/label'
import { Input } from '../src/components/ui/input'
import { Dayjs } from 'dayjs'

interface DateTimePickerProps {
  endLabel?: string
  endTimeLabel?: string
  endDateTime: Dayjs
  timezone?: string
  onChangeEnd: (date: Dayjs | null, time: Dayjs | null) => void
}

const DateTimePicker = ({
  endLabel = 'Date',
  endTimeLabel = 'Time',
  endDateTime,
  onChangeEnd,
}: DateTimePickerProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
      ? endDateTime
          .set('year', parseInt(e.target.value.split('-')[0]))
          .set('month', parseInt(e.target.value.split('-')[1]) - 1)
          .set('date', parseInt(e.target.value.split('-')[2]))
      : null
    onChangeEnd(date, endDateTime)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':')
    const time = endDateTime.set('hour', parseInt(hours)).set('minute', parseInt(minutes))
    onChangeEnd(endDateTime, time)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="date">{endLabel}</Label>
        <Input
          type="date"
          id="date"
          value={endDateTime.format('YYYY-MM-DD')}
          onChange={handleDateChange}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="time">{endTimeLabel}</Label>
        <Input
          type="time"
          id="time"
          value={endDateTime.format('HH:mm')}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  )
}

export default DateTimePicker
