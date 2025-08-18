import React, { useMemo, useState } from 'react'
import { useGetCompetitionsByIdsQuery } from '../src/generated/graphql'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import NoHeaderLayout from '../components/Layout/NoHeaderLayout'
import dayjs from 'dayjs'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import Meta from '../components/Layout/meta'
import { RegistrationTrendsChart } from '../components/Charts/RegistrationTrendsChart'

const comps = [
  {
    id: '3YYbHF',
    name: "Playoffs 500 London Shepherd's Bush",
    date: '2025-09-06',
    city: 'London',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  {
    id: 'XCdOCc',
    name: 'Playoffs 500 London Brixton',
    date: '2025-10-04',
    city: 'London',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  // {
  //   id: 'iv1ZVN',
  //   name: 'Playoffs 500 Amsterdam',
  //   date: '2025-09-12',
  //   city: 'Amsterdam',
  //   country: 'Netherlands',
  //   flag: '🇳🇱',
  // },
  {
    id: '461J8R',
    name: 'Playoffs 500 Cambridge',
    date: '2025-09-20',
    city: 'Cambridge',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  {
    id: '7vcIPm',
    name: 'Playoffs 500 Edinburgh',
    date: '2025-10-04',
    city: 'Edinburgh',
    country: 'Scotland',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  },
  {
    id: 'gg1r2d',
    name: 'Playoffs 500 Dublin',
    date: '2025-08-16',
    city: 'Dublin',
    country: 'Ireland',
    flag: '🇮🇪',
  },
]

const CompetitionRow = ({ comp, data, loading, rank }: any) => {
  const registrationsCount = data?.getCompetitionById?.registrationsCount || 0
  const participantsCount =
    data?.getCompetitionById?.participantsCount || registrationsCount || 0
  const teamsCount = data?.getCompetitionById?.teamsCount || 0

  // Calculate breakdown: teams (pairs) and solo participants
  const pairsTickets = teamsCount
  const soloTickets = Math.max(0, participantsCount - teamsCount * 2)
  const hasBreakdown = !loading && participantsCount > 0

  return (
    <Link href={`/event/${comp.id}`} target="_blank" rel="noopener noreferrer">
      <div className="bg-card border border-border rounded-lg p-3 md:p-4 flex items-center justify-between hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              rank === 1
                ? 'bg-yellow-500'
                : rank === 2
                  ? 'bg-gray-400'
                  : rank === 3
                    ? 'bg-amber-600'
                    : 'bg-gray-600'
            }`}
          >
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">
              {comp.name}
            </h3>
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {dayjs(comp.date).format('MMM D')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="md:hidden">
                  {comp.city} {comp.flag}
                </span>
                <span className="hidden md:inline">
                  {comp.city}, {comp.country} {comp.flag}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl md:text-2xl font-bold text-primary">
            {loading ? '...' : participantsCount}
          </div>
          <div className="text-xs text-muted-foreground">
            {participantsCount === 1 ? 'participant' : 'participants'}
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1">
            {!loading && participantsCount > 0
              ? `${soloTickets} solo + ${pairsTickets} pairs`
              : `0 solo + 0 pairs`}
          </div>
        </div>
      </div>
    </Link>
  )
}

const Playoffs500LeagueTable = () => {
  // Extract all competition IDs for batch query
  const competitionIds = useMemo(() => comps.map((comp) => comp.id), [])

  // State for country ranking view mode
  const [viewMode, setViewMode] = useState<'total' | 'average'>('total')

  // Use single efficient batch query with automatic updates
  const { data: competitionsData, loading } = useGetCompetitionsByIdsQuery({
    variables: { ids: competitionIds },
    errorPolicy: 'ignore',
    pollInterval: 120000, // Refresh every 2 minutes
  })

  // Transform batch query data into lookup object for easy access
  const competitionData = useMemo(() => {
    const data: any = {}
    if (competitionsData?.getCompetitionsByIds) {
      competitionsData.getCompetitionsByIds.forEach((comp) => {
        if (comp) {
          data[comp.id] = {
            getCompetitionById: comp, // Wrap to match existing data structure
          }
        }
      })
    }
    return data
  }, [competitionsData])

  // Group competitions by country for country rankings
  const compsByCountry = useMemo(() => {
    const grouped: any = {}
    comps.forEach((comp) => {
      if (!grouped[comp.country]) {
        grouped[comp.country] = []
      }
      grouped[comp.country].push(comp)
    })
    return grouped
  }, [])

  // Calculate country totals and rankings
  const countryRankings = useMemo(() => {
    const rankings = Object.entries(compsByCountry).map(
      ([country, countryComps]: [string, any]) => {
        const totalParticipants = countryComps.reduce((sum: number, comp: any) => {
          const data = competitionData[comp.id]
          const participantsCount =
            data?.getCompetitionById?.participantsCount ||
            data?.getCompetitionById?.registrationsCount ||
            0
          return sum + participantsCount
        }, 0)

        const averageParticipants = Math.round(totalParticipants / countryComps.length)

        return {
          country,
          totalParticipants,
          averageParticipants,
          compCount: countryComps.length,
          comps: countryComps,
        }
      },
    )

    // Sort by either total or average depending on view mode
    const sortKey = viewMode === 'average' ? 'averageParticipants' : 'totalParticipants'
    return rankings.sort((a, b) => b[sortKey] - a[sortKey])
  }, [compsByCountry, competitionData, viewMode])

  // Sort all competitions by participant count
  const sortedCompetitions = useMemo(() => {
    return [...comps].sort((a, b) => {
      const aParticipants =
        competitionData[a.id]?.getCompetitionById?.participantsCount ||
        competitionData[a.id]?.getCompetitionById?.registrationsCount ||
        0
      const bParticipants =
        competitionData[b.id]?.getCompetitionById?.participantsCount ||
        competitionData[b.id]?.getCompetitionById?.registrationsCount ||
        0
      return bParticipants - aParticipants
    })
  }, [competitionData])

  return (
    <>
      <Meta
        title="F45 Playoffs 500 League Table | Competition Rankings"
        description="Live rankings and participant counts for F45 Playoffs 500 competitions across UK cities. Track registration trends and see which locations are leading the challenge."
        canonical="https://fitlo.co/500-league-table"
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsEvent',
              name: 'F45 Playoffs 500 League Table',
              description:
                'Live rankings and registration tracking for F45 Playoffs 500 competitions across multiple UK cities',
              sport: 'Functional Fitness',
              organizer: {
                '@type': 'Organization',
                name: 'F45 Training',
                url: 'https://f45training.com',
              },
              location: {
                '@type': 'Place',
                addressCountry: 'GB',
                name: 'Multiple UK Cities',
              },
              startDate: '2025-09-06',
              url: 'https://fitlo.co/500-league-table',
              eventStatus: 'https://schema.org/EventScheduled',
              keywords: [
                'F45',
                'Playoffs 500',
                'Functional Fitness',
                'Competition',
                'UK',
                'Fitness Challenge',
              ],
            }),
          }}
        />
      </Head>
      <div className="min-h-screen bg-background text-foreground">
        {/* Logo at top left */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src="/favicon.ico"
              alt="Fitlo Logo"
              width={30}
              height={30}
              className="rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground flex items-center justify-center gap-3">
              <Trophy className="hidden md:block w-10 h-10 text-primary" />
              F45 Playoffs 500 League Table
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-muted-foreground">
              Live sign-ups across Europe
            </p>
          </div>

          {/* Country Rankings */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
              Country Rankings
            </h2>

            {/* View Mode Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-card border border-border rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('total')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'total'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setViewMode('average')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'average'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Average
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {countryRankings.map((ranking, index) => (
                <div
                  key={ranking.country}
                  className={`bg-card border rounded-lg p-6 text-center ${
                    index === 0 ? 'border-primary shadow-lg' : 'border-border'
                  }`}
                >
                  {index === 0 && (
                    <div className="text-primary font-bold text-sm mb-2">🏆 LEADING</div>
                  )}
                  <h3 className="text-xl font-bold mb-2">
                    {ranking.comps[0]?.flag} {ranking.country}
                  </h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {loading
                      ? '...'
                      : viewMode === 'average'
                        ? ranking.averageParticipants
                        : ranking.totalParticipants}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {viewMode === 'average'
                      ? `Avg per Comp (${ranking.compCount} ${ranking.compCount === 1 ? 'comp' : 'comps'})`
                      : 'Total Participants'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Trends Chart */}
          <div className="mb-8 md:mb-10">
            <RegistrationTrendsChart
              competitions={sortedCompetitions.map((comp) => ({
                id: comp.id,
                name: comp.name,
                registrationTrend:
                  competitionData[comp.id]?.getCompetitionById?.registrationTrend || [],
              }))}
              loading={loading}
            />
          </div>

          {/* All Competitions */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
              All Competitions
            </h2>
            <div className="space-y-2 md:space-y-3">
              {sortedCompetitions.map((comp, index) => (
                <CompetitionRow
                  key={comp.id}
                  comp={comp}
                  data={competitionData[comp.id]}
                  loading={loading}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-6">
          <div className="max-w-4xl w-full px-4">
            <div className="text-center">
              <button
                onClick={() => window.open('/create', '_blank')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Create your comp with Fitlo ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

Playoffs500LeagueTable.layout = NoHeaderLayout
export default Playoffs500LeagueTable
