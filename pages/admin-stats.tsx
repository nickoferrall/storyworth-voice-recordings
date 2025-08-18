import React, { useState } from 'react'
import Head from 'next/head'
import { Calendar, Users, TrendingUp, Building } from 'lucide-react'
import withAuth from '../utils/withAuth'
import { Context } from '@apollo/client'
import { useUser } from '../contexts/UserContext'
import NoHeaderLayout from '../components/Layout/NoHeaderLayout'
import { Button } from '../src/components/ui/button'
import dayjs from 'dayjs'
import { useGetRegistrationStatsQuery } from '../src/generated/graphql'

export const getServerSideProps = withAuth(async function (context: Context) {
  // Check if user is a super user
  if (!context.user?.isSuperUser) {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    }
  }

  return {
    props: { user: context.user },
  }
}, true) // Require authentication

type Props = {
  user: any | null
}

const AdminStatsPage = (props: Props) => {
  const { user: dbUser } = props
  const { setUser } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [deselectedCompetitions, setDeselectedCompetitions] = useState<Set<string>>(
    new Set(),
  )

  React.useEffect(() => {
    if (dbUser) {
      setUser(dbUser)
    }
  }, [dbUser])

  const { data, loading, error, refetch } = useGetRegistrationStatsQuery({
    variables: { days: selectedPeriod },
    errorPolicy: 'all',
  })

  const handlePeriodChange = (days: string) => {
    setSelectedPeriod(days)
    refetch({ days })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading stats: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  const stats = data?.getRegistrationStats
  const competitions = stats?.competitions || []

  // Calculate filtered registrations (excluding deselected competitions)
  const filteredRegistrations = competitions
    .filter((comp) => !deselectedCompetitions.has(comp?.competition?.id || ''))
    .reduce((sum, comp) => sum + (comp?.registrationsInPeriod || 0), 0)

  const toggleCompetition = (competitionId: string) => {
    const newDeselected = new Set(deselectedCompetitions)
    if (newDeselected.has(competitionId)) {
      newDeselected.delete(competitionId)
    } else {
      newDeselected.add(competitionId)
    }
    setDeselectedCompetitions(newDeselected)
  }

  const toggleAllCompetitions = () => {
    if (deselectedCompetitions.size === 0) {
      // Deselect all
      const allIds = new Set(
        competitions.map((comp) => comp?.competition?.id).filter(Boolean) as string[],
      )
      setDeselectedCompetitions(allIds)
    } else {
      // Select all
      setDeselectedCompetitions(new Set())
    }
  }

  return (
    <>
      <Head>
        <title>Admin Stats - Fitlo</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              📊 Registration Statistics
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Real registrations through Fitlo (excluding test competitions)
            </p>

            <div className="flex gap-3 mb-6">
              <Button
                variant={selectedPeriod === 'thisMonth' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('thisMonth')}
                size="sm"
              >
                This month
              </Button>
              {['7', '30', '60', '90'].map((days) => (
                <Button
                  key={days}
                  variant={selectedPeriod === days ? 'default' : 'outline'}
                  onClick={() => handlePeriodChange(days)}
                  size="sm"
                >
                  Last {days} days
                </Button>
              ))}
            </div>
          </div>

          {stats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center mb-2">
                    <Users className="text-primary mr-3 w-5 h-5" />
                    <h3 className="font-semibold text-foreground">Total Registrations</h3>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {filteredRegistrations}
                    {filteredRegistrations !== stats.totalRegistrations && (
                      <span className="text-lg text-muted-foreground ml-2">
                        / {stats.totalRegistrations}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPeriod === 'thisMonth'
                      ? 'This calendar month'
                      : `Past ${selectedPeriod} days`}
                    {filteredRegistrations !== stats.totalRegistrations && (
                      <span className="block text-xs">
                        ({competitions.length - deselectedCompetitions.size} of{' '}
                        {competitions.length} competitions)
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center mb-2">
                    <Building className="text-blue-500 mr-3 w-5 h-5" />
                    <h3 className="font-semibold text-foreground">Active Competitions</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">
                    {competitions.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    With registrations in period
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="text-green-500 mr-3 w-5 h-5" />
                    <h3 className="font-semibold text-foreground">Period</h3>
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    {dayjs(stats.periodStart).format('MMM D')} -{' '}
                    {dayjs(stats.periodEnd).format('MMM D')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Date range for this data
                  </p>
                </div>
              </div>

              {/* Competition Breakdown */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Competition Breakdown
                </h2>

                {competitions && competitions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-center py-3 px-4 font-semibold text-foreground w-12">
                            <input
                              type="checkbox"
                              checked={deselectedCompetitions.size === 0}
                              onChange={toggleAllCompetitions}
                              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                              title={
                                deselectedCompetitions.size === 0
                                  ? 'Deselect all'
                                  : 'Select all'
                              }
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Competition
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            ID
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Organizer
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Start Date
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground">
                            Registrations
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitions
                          ?.filter((comp) => comp)
                          .sort(
                            (a, b) =>
                              (b?.registrationsInPeriod || 0) -
                              (a?.registrationsInPeriod || 0),
                          )
                          .map((comp, index) => {
                            const isDeselected = deselectedCompetitions.has(
                              comp?.competition?.id || '',
                            )
                            return (
                              <tr
                                key={comp?.competition?.id}
                                className={`${index % 2 === 0 ? 'bg-muted/30' : ''} ${
                                  isDeselected ? 'opacity-50' : ''
                                } hover:bg-muted/50 transition-colors`}
                              >
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      !deselectedCompetitions.has(
                                        comp?.competition?.id || '',
                                      )
                                    }
                                    onChange={() =>
                                      toggleCompetition(comp?.competition?.id || '')
                                    }
                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                  />
                                </td>
                                <td className="py-3 px-4 text-foreground font-medium">
                                  {comp?.competition?.name}
                                </td>
                                <td className="py-3 px-4">
                                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono text-foreground">
                                    {comp?.competition?.id}
                                  </code>
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                  {comp?.competition?.orgName || '-'}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                  {comp?.competition?.startDateTime
                                    ? dayjs(comp.competition.startDateTime).format(
                                        'MMM D, YYYY',
                                      )
                                    : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-primary">
                                  {comp?.registrationsInPeriod}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations found for this period
                  </div>
                )}
              </div>

              {/* Period Info */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Data from {dayjs(stats.periodStart).format('MMM D, YYYY')} to{' '}
                  {dayjs(stats.periodEnd).format('MMM D, YYYY')}
                </p>
                <p className="mt-1">
                  Excludes test competitions (containing: test, demo, trial, staging,
                  sample)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

AdminStatsPage.layout = NoHeaderLayout
export default AdminStatsPage
