import React from 'react'
import NotificationSubscription from './NotificationSubscription'
import AddCompModal from './AddCompModal'
import { Toaster } from '../../src/components/ui/toaster'

interface FilterValues {
  eventType: string
  gender: string
  teamSize: string
  difficulty: string
  countries: string[]
  locations: string[]
  tags: string[]
}

interface FilterOptions {
  eventTypes: string[]
  genders: ['ALL', 'MALE', 'FEMALE', 'MIXED']
  teamSizes: ['ALL', '1', '2', '3', '4']
  difficulties: ['ALL', 'ELITE', 'RX', 'INTERMEDIATE', 'EVERYDAY', 'MASTERS', 'TEEN']
  countries: string[]
  locations: string[]
  tags: string[]
}

// Constants from AddCompModal that might be useful in other components
export const EVENT_TYPES = ['CrossFit', 'HYROX', 'Functional Fitness'] as const
export const FORMATS = ['Individual', 'Team', 'Both'] as const
export const TAGS = [
  'Prize Money',
  'Masters Division',
  'Oly Lifting',
  'Women Only',
  'Beginners Welcome',
  'Elite',
  'Scaled Division',
] as const

interface ExploreCTAsProps {
  filterValues: FilterValues
  filterOptions: FilterOptions
}

const ExploreCTAs = ({ filterValues, filterOptions }: ExploreCTAsProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <NotificationSubscription
          filterValues={{
            eventType: filterValues.eventType === 'All' ? '' : filterValues.eventType,
            gender: filterValues.gender,
            teamSize: filterValues.teamSize,
            difficulty: filterValues.difficulty,
            countries: filterValues.countries,
            locations: filterValues.locations,
            tags: filterValues.tags,
          }}
          filterOptions={filterOptions}
        />
        <AddCompModal />
      </div>
      <Toaster />
    </>
  )
}

export default ExploreCTAs
