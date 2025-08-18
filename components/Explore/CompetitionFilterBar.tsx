import React, { useState, useMemo } from 'react'
import { Input } from '../../src/components/ui/input'
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
import { DatePickerWithRange } from '../DateRangePicker'
import { cn } from '../../src/lib/utils'
import { ChevronsUpDown, X } from 'lucide-react'
import { getCountriesByContinent } from '../../utils/getCountriesByContinent'
import { GetExploreCompetitionsQuery } from '../../src/generated/graphql'

// Hardcoded filter data until we can fix the GraphQL schema
const FILTER_DATA = {
  countries: [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Ireland',
    'Germany',
    'France',
    'Netherlands',
    'Spain',
    'Italy',
    'Sweden',
    'Norway',
    'Denmark',
  ].sort(),

  // Group cities by country to show relevant cities when country is selected
  citiesByCountry: {
    'United Kingdom': [
      'London',
      'Manchester',
      'Birmingham',
      'Leeds',
      'Liverpool',
      'Bristol',
      'Edinburgh',
      'Glasgow',
      'Cardiff',
      'Bexhill',
      'Kings Langley',
    ],
    'United States': [
      'New York',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
    ],
    Canada: [
      'Toronto',
      'Vancouver',
      'Montreal',
      'Calgary',
      'Ottawa',
      'Edmonton',
      'Mississauga',
      'Winnipeg',
      'Quebec City',
      'Hamilton',
    ],
    Australia: [
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Perth',
      'Adelaide',
      'Gold Coast',
      'Newcastle',
      'Canberra',
      'Sunshine Coast',
      'Wollongong',
    ],
    Ireland: [
      'Dublin',
      'Cork',
      'Limerick',
      'Galway',
      'Waterford',
      'Drogheda',
      'Dundalk',
      'Bray',
      'Navan',
      'Ennis',
    ],
    Germany: [
      'Berlin',
      'Hamburg',
      'Munich',
      'Cologne',
      'Frankfurt',
      'Stuttgart',
      'Düsseldorf',
      'Dortmund',
      'Essen',
      'Leipzig',
    ],
    France: [
      'Paris',
      'Marseille',
      'Lyon',
      'Toulouse',
      'Nice',
      'Nantes',
      'Strasbourg',
      'Montpellier',
      'Bordeaux',
      'Lille',
    ],
    Netherlands: [
      'Amsterdam',
      'Rotterdam',
      'The Hague',
      'Utrecht',
      'Eindhoven',
      'Tilburg',
      'Groningen',
      'Almere',
      'Breda',
      'Nijmegen',
    ],
    Spain: [
      'Madrid',
      'Barcelona',
      'Valencia',
      'Seville',
      'Zaragoza',
      'Málaga',
      'Murcia',
      'Palma',
      'Las Palmas',
      'Bilbao',
    ],
    Italy: [
      'Rome',
      'Milan',
      'Naples',
      'Turin',
      'Palermo',
      'Genoa',
      'Bologna',
      'Florence',
      'Bari',
      'Catania',
    ],
    Sweden: [
      'Stockholm',
      'Gothenburg',
      'Malmö',
      'Uppsala',
      'Västerås',
      'Örebro',
      'Linköping',
      'Helsingborg',
      'Jönköping',
      'Norrköping',
    ],
    Norway: [
      'Oslo',
      'Bergen',
      'Stavanger',
      'Trondheim',
      'Drammen',
      'Fredrikstad',
      'Kristiansand',
      'Sandnes',
      'Tromsø',
      'Sarpsborg',
    ],
    Denmark: [
      'Copenhagen',
      'Aarhus',
      'Odense',
      'Aalborg',
      'Esbjerg',
      'Randers',
      'Kolding',
      'Horsens',
      'Vejle',
      'Roskilde',
    ],
  },

  teamSizes: [1, 2, 3, 4, 5],
}

type Filters = {
  searchTerm: string
  selectedEventType: string
  selectedCountries: string[]
  selectedLocations: string[]
  selectedTeamSizes: string[]
  selectedDifficulty: string
  selectedTags: string[]
  startDate?: Date
  endDate?: Date
}

type CompetitionFilterBarProps = {
  data: GetExploreCompetitionsQuery['getExploreCompetitions']
  filters: Filters
  onFilterChange: (key: string, value: any) => void
  clearFilters: () => void
}

export function CompetitionFilterBar({
  data,
  filters,
  onFilterChange,
  clearFilters,
}: CompetitionFilterBarProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    onFilterChange('startDate', range?.from)
    onFilterChange('endDate', range?.to)
  }

  const { countries, locations, isUSSelected, filterConfigs } = useMemo(() => {
    // Use hardcoded country data for better UX
    const countries = FILTER_DATA.countries

    const isUSSelected = filters.selectedCountries.includes('United States')

    // Filter cities based on selected countries
    const locations = (() => {
      if (filters.selectedCountries.length === 0) {
        // If no countries selected, show all cities
        return Object.values(FILTER_DATA.citiesByCountry).flat().sort()
      }

      // Show cities only for selected countries
      const filteredCities = filters.selectedCountries.flatMap(
        (country) =>
          FILTER_DATA.citiesByCountry[
            country as keyof typeof FILTER_DATA.citiesByCountry
          ] || [],
      )

      return Array.from(new Set(filteredCities)).sort()
    })()

    const filterConfigs = [
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
            const continentCountries = getCountriesByContinent(value).filter((country) =>
              countries.includes(country),
            )
            const allSelected = continentCountries.every((country) =>
              filters.selectedCountries.includes(country),
            )

            onFilterChange(
              'selectedCountries',
              allSelected
                ? filters.selectedCountries.filter((c) => !continentCountries.includes(c))
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
        label: 'Cities',
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
            return <span className="text-foreground">All Cities</span>
          }
          return `${selectedLocations.length} ${
            selectedLocations.length === 1 ? 'city' : 'cities'
          }`
        },
      },
      {
        key: 'teamSizes',
        label: 'Team Size',
        value: filters.selectedTeamSizes,
        options: ['1', '2', '3', '4'],
        showSearch: false,
        onSelect: (value: string) => {
          onFilterChange(
            'selectedTeamSizes',
            filters.selectedTeamSizes.includes(value)
              ? filters.selectedTeamSizes.filter((size) => size !== value)
              : [...filters.selectedTeamSizes, value],
          )
        },
        formatLabel: (value: string) =>
          ({
            '1': 'Individual',
            '2': 'Pairs',
            '3': 'Teams of 3',
            '4': 'Teams of 4',
          })[value] || value,
        renderButton: (selectedTeamSizes: string[]) => {
          if (selectedTeamSizes.length === 0) {
            return <span className="text-foreground">All Team Sizes</span>
          }
          return `${selectedTeamSizes.length} ${
            selectedTeamSizes.length === 1 ? 'size' : 'sizes'
          }`
        },
      },
    ]

    return { countries, locations, isUSSelected, filterConfigs }
  }, [data, filters])

  const hasActiveFilters =
    filters.selectedCountries.length > 0 ||
    filters.selectedLocations.length > 0 ||
    filters.selectedTeamSizes.length > 0 ||
    filters.startDate ||
    filters.endDate

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        {filterConfigs.map((config) => {
          if (config.component) {
            return (
              <div key={config.key} className="w-full sm:w-auto">
                {config.component}
              </div>
            )
          }

          const {
            key,
            label,
            value,
            options,
            showSearch,
            onSelect,
            formatLabel,
            renderButton,
          } = config

          return (
            <Popover
              key={key}
              open={openPopover === key}
              onOpenChange={(open) => setOpenPopover(open ? key : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover === key}
                  className="justify-between w-full sm:w-auto sm:min-w-[150px] text-left bg-gray-50 text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-0 transition-colors [&:hover]:!bg-gray-100 [&:focus]:!bg-gray-100 [&:focus]:!border-gray-400"
                >
                  <span className="truncate">
                    {renderButton
                      ? renderButton(value)
                      : typeof value === 'string'
                        ? formatLabel?.(value) || value
                        : `${label}: ${value}`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0 bg-white border border-gray-200 shadow-lg">
                <Command className="bg-white [&_[cmdk-item]]:!bg-transparent [&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item]:hover]:!bg-gray-100">
                  {showSearch && (
                    <CommandInput
                      placeholder={`Search ${label.toLowerCase()}...`}
                      className="text-gray-900 placeholder:text-gray-500 border-0 focus:ring-0 focus:border-0"
                    />
                  )}
                  <CommandList>
                    <CommandEmpty className="text-gray-500 text-sm py-6 text-center">
                      No {label.toLowerCase()} found.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => {
                        // Render divider as non-interactive separator
                        if (option === '---') {
                          return (
                            <div
                              key={option}
                              className="border-t border-gray-200 my-1 mx-3"
                              aria-hidden="true"
                            />
                          )
                        }

                        // Render regular interactive options
                        return (
                          <CommandItem
                            key={option}
                            value={option}
                            className="text-gray-900 hover:bg-gray-100 cursor-pointer px-3 py-2 transition-colors [&:hover]:!bg-gray-100 [&[data-selected='true']]:!bg-gray-100 [&[aria-selected='true']]:!bg-gray-100"
                            onSelect={() => {
                              if (onSelect) {
                                onSelect(option)
                              } else {
                                onFilterChange(
                                  `selected${key.charAt(0).toUpperCase() + key.slice(1)}`,
                                  option,
                                )
                                setOpenPopover(null)
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              {Array.isArray(value) ? (
                                <input
                                  type="checkbox"
                                  checked={(() => {
                                    // Handle continent checkboxes
                                    if (
                                      ['Europe', 'North America', 'Oceania'].includes(
                                        option,
                                      )
                                    ) {
                                      const continentCountries = getCountriesByContinent(
                                        option,
                                      ).filter((country) => countries.includes(country))
                                      return (
                                        continentCountries.length > 0 &&
                                        continentCountries.every((country) =>
                                          value.includes(country),
                                        )
                                      )
                                    }
                                    // Handle regular country checkboxes
                                    return value.includes(option)
                                  })()}
                                  readOnly
                                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                                />
                              ) : null}
                              <span className="text-gray-900">
                                {formatLabel?.(option) || option}
                              </span>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )
        })}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.selectedCountries.map((country) => (
            <span
              key={country}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
            >
              {country}
              <button
                onClick={() =>
                  onFilterChange(
                    'selectedCountries',
                    filters.selectedCountries.filter((c) => c !== country),
                  )
                }
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.selectedLocations.map((location) => (
            <span
              key={location}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
            >
              {location}
              <button
                onClick={() =>
                  onFilterChange(
                    'selectedLocations',
                    filters.selectedLocations.filter((l) => l !== location),
                  )
                }
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.selectedTeamSizes.map((teamSize) => (
            <span
              key={teamSize}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
            >
              Team Size: {teamSize === '1' ? 'Individual' : `${teamSize} person`}
              <button
                onClick={() =>
                  onFilterChange(
                    'selectedTeamSizes',
                    filters.selectedTeamSizes.filter((size) => size !== teamSize),
                  )
                }
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
