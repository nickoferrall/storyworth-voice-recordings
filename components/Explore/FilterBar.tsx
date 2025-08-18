import React from 'react'
import { Input } from '../../src/components/ui/input'
import { Checkbox } from '../../src/components/ui/checkbox'
import { Button } from '../../src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../src/components/ui/command'
import { useState, useMemo } from 'react'
import { DatePickerWithRange } from '../DateRangePicker'
import { cn } from '../../src/lib/utils'
import { ChevronsUpDown } from 'lucide-react'
import { getCountriesByContinent } from '../../utils/getCountriesByContinent'
import { GetDirectoryCompsQuery } from '../../src/generated/graphql'

type Filters = {
  searchTerm: string
  selectedEventType: string
  selectedCountries: string[]
  selectedLocations: string[]
  selectedGender: string
  selectedTeamSize: string
  selectedDifficulty: string
  selectedTags: string[]
  startDate?: Date
  endDate?: Date
}

type FilterBarProps = {
  data: GetDirectoryCompsQuery['getDirectoryComps']
  filters: Filters
  onFilterChange: (key: keyof Filters, value: any) => void
  clearFilters: () => void
}

export function FilterBar({
  data,
  filters,
  onFilterChange,
  clearFilters,
}: FilterBarProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string>('')

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    onFilterChange('startDate', range?.from)
    onFilterChange('endDate', range?.to)
  }

  const handleSelect = (key: string, value: string) => {
    const filterKey =
      `selected${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Filters
    onFilterChange(filterKey, value)
    setOpenPopover(null)
  }

  const { eventTypes, countries, locations, isUSSelected, filterConfigs } =
    useMemo(() => {
      const eventTypes = ['All', 'CrossFit', 'HYROX']
      const countries = Array.from(new Set(data.map((comp) => comp.country)))
        .filter(
          (country) =>
            getCountriesByContinent('Europe').includes(country) ||
            getCountriesByContinent('North America').includes(country) ||
            getCountriesByContinent('Oceania').includes(country),
        )
        .sort()

      const isUSSelected = filters.selectedCountries.includes('United States')

      const locations = isUSSelected
        ? Array.from(
            new Set(
              data
                .filter((comp) => comp.country === 'United States')
                .map((comp) => comp.region)
                .filter(Boolean),
            ),
          ).sort()
        : Array.from(
            new Set(
              data
                .filter(
                  (comp) =>
                    filters.selectedCountries.length === 0 ||
                    filters.selectedCountries.includes(comp.country),
                )
                .map((comp) => comp.location)
                .filter(Boolean),
            ),
          ).sort()

      const filterConfigs = [
        {
          key: 'eventType',
          label: 'Event Type',
          value: filters.selectedEventType,
          options: eventTypes,
        },
        {
          key: 'dateRange',
          component: (
            <DatePickerWithRange
              date={{
                from: filters.startDate,
                to: filters.endDate,
              }}
              setDate={handleDateRangeChange}
            />
          ),
        },
        {
          key: 'country',
          label: 'Countries',
          value: filters.selectedCountries,
          options: ['Europe', 'North America', 'Oceania', '---', ...countries],
          showSearch: true,
          onSelect: (value: string) => {
            if (value === '---') return

            if (['Europe', 'North America', 'Oceania'].includes(value)) {
              const continentCountries = getCountriesByContinent(value).filter(
                (country) => countries.includes(country),
              )
              const allSelected = continentCountries.every((country) =>
                filters.selectedCountries.includes(country),
              )

              onFilterChange(
                'selectedCountries',
                allSelected
                  ? filters.selectedCountries.filter(
                      (c) => !continentCountries.includes(c),
                    )
                  : [...new Set([...filters.selectedCountries, ...continentCountries])],
              )
            } else {
              onFilterChange(
                'selectedCountries',
                filters.selectedCountries.includes(value)
                  ? filters.selectedCountries.filter((c) => c !== value)
                  : [...filters.selectedCountries, value],
              )
            }
          },
          formatLabel: (value: string) => (value === '---' ? '──────────' : value),
          renderButton: (selectedCountries: string[]) =>
            selectedCountries.length === 0 ? (
              <span className="text-foreground">All Countries</span>
            ) : (
              `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'}`
            ),
        },
        {
          key: 'location',
          label: isUSSelected ? 'States' : 'Cities',
          value: filters.selectedLocations,
          options: locations,
          showSearch: true,
          onSelect: (value: string) => {
            onFilterChange(
              'selectedLocations',
              filters.selectedLocations.includes(value)
                ? filters.selectedLocations.filter((l) => l !== value)
                : [...filters.selectedLocations, value],
            )
          },
          renderButton: (selectedLocations: string[]) => {
            if (selectedLocations.length === 0) {
              return (
                <span className="text-foreground">
                  {isUSSelected ? 'All States' : 'All Cities'}
                </span>
              )
            }
            return `${selectedLocations.length} ${
              isUSSelected
                ? selectedLocations.length === 1
                  ? 'state'
                  : 'states'
                : selectedLocations.length === 1
                  ? 'city'
                  : 'cities'
            }`
          },
        },
        {
          key: 'gender',
          label: 'Gender',
          value: filters.selectedGender,
          options: ['ALL', 'MALE', 'FEMALE', 'MIXED'],
          formatLabel: (value: string) =>
            ({
              ALL: 'All Genders',
              MALE: 'Male',
              FEMALE: 'Female',
              MIXED: 'Mixed',
            })[value] || value,
        },
        {
          key: 'teamSize',
          label: 'Team Size',
          value: filters.selectedTeamSize,
          options: ['ALL', '1', '2', '3', '4'],
          formatLabel: (value: string) =>
            ({
              ALL: 'All Team Sizes',
              '1': 'Individual',
              '2': 'Pairs',
              '3': 'Teams of 3',
              '4': 'Teams of 4',
            })[value] || value,
        },
        {
          key: 'difficulty',
          label: 'Difficulty',
          value: filters.selectedDifficulty,
          options: ['ALL', 'ELITE', 'RX', 'INTERMEDIATE', 'EVERYDAY', 'MASTERS', 'TEEN'],
          formatLabel: (value: string) =>
            ({
              ALL: 'All Difficulties',
              ELITE: 'Elite',
              RX: 'RX',
              INTERMEDIATE: 'Intermediate',
              EVERYDAY: 'Everyday/Scaled',
              MASTERS: 'Masters',
              TEEN: 'Teen',
            })[value] || value,
        },
      ]

      return { eventTypes, countries, locations, isUSSelected, filterConfigs }
    }, [data, filters, handleDateRangeChange])

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search events..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="flex-1 placeholder:text-gray-500"
        />
        <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
          Clear Filters
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterConfigs.map((filter) =>
          filter.component ? (
            <div key={filter.key} className="col-span-1">
              {filter.component}
            </div>
          ) : (
            <Popover
              key={filter.key}
              open={openPopover === filter.key}
              onOpenChange={(open) => setOpenPopover(open ? filter.key : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
                    !filter.value?.length && 'text-muted-foreground',
                  )}
                >
                  <span className="truncate">
                    {filter.renderButton
                      ? filter.renderButton(filter.value)
                      : filter.formatLabel
                        ? filter.formatLabel(filter.value)
                        : filter.value || filter.label}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px]" align="start">
                <Command>
                  {filter.showSearch && (
                    <CommandInput
                      placeholder={`Search ${filter.label.toLowerCase()}...`}
                      className="border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                    />
                  )}
                  <CommandList>
                    <CommandEmpty>No {filter.label.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                      {filter.options.map((option) => (
                        <CommandItem
                          key={option}
                          onSelect={() => {
                            if (filter.onSelect) {
                              filter.onSelect(option)
                            } else {
                              handleSelect(filter.key, option)
                            }
                          }}
                          className={cn(
                            'text-foreground',
                            option === '---' && 'border-t border-border py-2 my-1',
                          )}
                          disabled={option === '---'}
                        >
                          {(filter.key === 'country' || filter.key === 'location') &&
                            option !== '---' && (
                              <Checkbox
                                checked={
                                  filter.key === 'country'
                                    ? ['Europe', 'North America'].includes(option)
                                      ? getCountriesByContinent(option)
                                          .filter((country) =>
                                            countries.includes(country),
                                          )
                                          .every((country) =>
                                            filters.selectedCountries.includes(country),
                                          )
                                      : filters.selectedCountries.includes(option)
                                    : filters.selectedLocations.includes(option)
                                }
                                className="mr-2"
                              />
                            )}
                          {filter.formatLabel ? filter.formatLabel(option) : option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ),
        )}
      </div>

      {dateError && <p className="text-sm text-red-500 mt-1">{dateError}</p>}
    </div>
  )
}
