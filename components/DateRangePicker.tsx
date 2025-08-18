'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '../src/lib/utils'
import { Button } from '../src/components/ui/button'
import { Calendar } from '../src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/ui/popover'

type DatePickerWithRangeProps = React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-between border border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100 hover:border-gray-400 transition-colors [&:hover]:!bg-gray-100 [&:focus]:!bg-gray-100 [&:focus]:!border-gray-400',
              !date && 'text-gray-500',
            )}
          >
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Date Range</span>
              )}
            </span>
            <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border border-gray-200 shadow-lg"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="bg-white text-gray-900"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
