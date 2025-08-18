import React, { useState, useMemo, useEffect } from 'react'
import { useGetExploreCompetitionsQuery } from '../src/generated/graphql'
import Meta from '../components/Layout/meta'
import Head from 'next/head'
import ExploreCTAs from '../components/Explore/ExploreCTAs'
import LoadingEventCard from '../components/Explore/LoadingEventCard'
import { EventCard } from '../components/Explore/EventCard'
import { CompetitionFilterBar } from '../components/Explore/CompetitionFilterBar'
import SuggestCompetitionModal from '../components/Competition/SuggestCompetitionModal'
import { generateEventStructuredData } from '../utils/generateEventStructureData'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { getCountriesByContinent } from '../utils/getCountriesByContinent'
import { GetServerSideProps } from 'next'
import { initializeApollo } from '../lib/apollo'
import {
  GetExploreCompetitionsDocument,
  GetExploreCompetitionsQuery,
} from '../src/generated/graphql'
import { Plus } from 'lucide-react'

interface ExploreProps {
  initialData: GetExploreCompetitionsQuery
}

export const getServerSideProps: GetServerSideProps<ExploreProps> = async () => {
  const apolloClient = initializeApollo()

  try {
    const { data } = await apolloClient.query({
      query: GetExploreCompetitionsDocument,
      variables: {
        limit: 20,
        offset: 0,
        // No filters on initial load
        search: undefined,
        countries: undefined,
        cities: undefined,
        teamSize: undefined,
        startDate: undefined,
        endDate: undefined,
      },
    })

    return {
      props: {
        initialData: data,
      },
    }
  } catch (error) {
    console.error('Error fetching directory comps:', error)
    return {
      props: {
        initialData: { getExploreCompetitions: [] },
      },
    }
  }
}

export default function Explore({ initialData }: ExploreProps) {
  const router = useRouter()
  const [isPageReady, setIsPageReady] = useState(false)
  const [allCompetitions, setAllCompetitions] = useState<any[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreCompetitions, setHasMoreCompetitions] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [showSuggestModal, setShowSuggestModal] = useState(false)

  // Enhanced filtering state (moved before query)
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedEventType: 'All',
    selectedCountries: [] as string[],
    selectedLocations: [] as string[],
    selectedTeamSizes: [] as string[],
    selectedDifficulty: 'ALL',
    selectedTags: [] as string[],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  })

  // Load competitions with server-side filtering
  const { data, loading, error, fetchMore, refetch } = useGetExploreCompetitionsQuery({
    variables: {
      limit: 20,
      offset: 0,
      search: undefined, // Don't search on initial load
      countries: undefined,
      cities: undefined,
      teamSize: undefined,
      startDate: undefined,
      endDate: undefined,
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setAllCompetitions(data.getExploreCompetitions)
      setHasMoreCompetitions(data.getExploreCompetitions.length === 20)
    },
  })

  // Separate debounced search from other filters
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchTerm)

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [filters.searchTerm])

  // Load more competitions function
  const loadMoreCompetitions = async () => {
    if (isLoadingMore || !hasMoreCompetitions) return

    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          limit: 20,
          offset: allCompetitions.length,
          search: debouncedSearch || undefined,
          countries:
            filters.selectedCountries.length > 0 ? filters.selectedCountries : undefined,
          cities:
            filters.selectedLocations.length > 0 ? filters.selectedLocations : undefined,
          teamSize:
            filters.selectedTeamSizes.length === 1
              ? filters.selectedTeamSizes[0]
              : undefined,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
        },
        updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult || prev,
      })

      const newCompetitions = result.data.getExploreCompetitions
      setAllCompetitions((prev) => [...prev, ...newCompetitions])
      setHasMoreCompetitions(newCompetitions.length === 20)
    } catch (error) {
      console.error('Error loading more competitions:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    // Reset competitions when filters change - fresh data will come from refetch
    if (key !== 'searchTerm') {
      // For non-search filters, clear immediately since they don't debounce
      setAllCompetitions([])
      setHasMoreCompetitions(true)
    }
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedEventType: 'All',
      selectedCountries: [],
      selectedLocations: [],

      selectedTeamSizes: [],
      selectedDifficulty: 'ALL',
      selectedTags: [],
      startDate: undefined,
      endDate: undefined,
    })
    // Reset competitions when clearing filters
    setAllCompetitions([])
    setHasMoreCompetitions(true)
  }

  // Use competitions directly from server-side filtering
  const filteredEvents = allCompetitions || []

  const handleEventCardClick = (eventId: string) => {
    // Open event page in new tab
    window.open(`/event/${eventId}`, '_blank')
  }

  useEffect(() => {
    setIsPageReady(true)
  }, [])

  // Refetch when debounced search or other filters change
  useEffect(() => {
    setIsFiltering(true)
    refetch({
      limit: 20,
      offset: 0,
      search: debouncedSearch || undefined,
      countries:
        filters.selectedCountries.length > 0 ? filters.selectedCountries : undefined,
      cities:
        filters.selectedLocations.length > 0 ? filters.selectedLocations : undefined,

      teamSize:
        filters.selectedTeamSizes.length === 1 ? filters.selectedTeamSizes[0] : undefined,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    })
      .then((result) => {
        // Update competitions with new filtered results
        if (result.data) {
          setAllCompetitions(result.data.getExploreCompetitions)
          setHasMoreCompetitions(result.data.getExploreCompetitions.length === 20)
        }
        setIsFiltering(false)
      })
      .catch(() => {
        setIsFiltering(false)
      })
  }, [
    debouncedSearch,
    filters.selectedCountries,
    filters.selectedLocations,
    filters.selectedTeamSizes,
    filters.startDate,
    filters.endDate,
    refetch,
  ])

  // Check if any filters are applied
  const hasFiltersApplied = useMemo(() => {
    return (
      filters.searchTerm ||
      filters.selectedCountries.length > 0 ||
      filters.selectedLocations.length > 0 ||
      filters.selectedTeamSizes.length > 0 ||
      filters.startDate ||
      filters.endDate
    )
  }, [filters])

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 2000
      ) {
        if (hasMoreCompetitions && !isLoadingMore) {
          loadMoreCompetitions()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMoreCompetitions, isLoadingMore, loadMoreCompetitions, hasFiltersApplied])

  if (loading && !isFiltering) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingEventCard key={i} />
          ))}
        </div>
      </div>
    )
  }
  if (error) return <div>Error loading competitions</div>

  return (
    <>
      <Meta
        title="Explore Fitness Competitions | Fitlo"
        description="Discover and join functional fitness competitions, HYROX events, and CrossFit competitions near you. Filter by location, type, and more."
        canonical="https://fitlo.co/explore"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateEventStructuredData(
              (filteredEvents || []).map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description || '',
                startDate: e.startDate,
                endDate: e.endDate,
                location: [e.city, e.country].filter(Boolean).join(', '),
                country: e.country || '',
                price: e.price || null,
                currency: e.currency || null,
                logo: e.logo || null,
                website: e.website || null,
              })) as any,
            ),
          ),
        }}
      />
      <div className={`min-h-screen ${!isPageReady ? 'invisible' : ''}`}>
        <div className="max-w-6xl mx-auto md:px-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">Upcoming Events</h1>
              <p className="text-gray-300 mb-4 sm:mb-0">
                Discover HYROX, CrossFit, and other fitness competitions near you
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowSuggestModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Suggest Competition
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search events..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full p-3 mb-4 bg-gray-50 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all [&:focus]:!border-gray-400 [&:focus]:!ring-gray-100"
            />
            <CompetitionFilterBar
              data={allCompetitions || []}
              filters={filters}
              onFilterChange={handleFilterChange}
              clearFilters={clearFilters}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isFiltering && filteredEvents.length === 0
              ? // Show loading cards while filtering
                [...Array(6)].map((_, i) => <LoadingEventCard key={i} />)
              : filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventCardClick(event.id)}
                  />
                ))}
          </div>

          {!loading && hasMoreCompetitions && !hasFiltersApplied && (
            <div className="text-center py-4">
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <p className="text-gray-300">Loading more competitions...</p>
                </div>
              ) : (
                <p className="text-gray-300">Scroll down to load more competitions...</p>
              )}
            </div>
          )}

          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-300">
                No competitions found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suggest Competition Modal */}
      <SuggestCompetitionModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
      />
    </>
  )
}
