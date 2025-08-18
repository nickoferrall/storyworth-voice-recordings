import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, Edit3, Banknote } from 'lucide-react'
import { useRouter } from 'next/router'
import OptimizedImage from '../../components/OptimizedImage'
import {
  User,
  useGetCompetitionByIdQuery,
  useIsUserRegisteredForCompetitionQuery,
  useGetTicketTypesByCompetitionIdLazyQuery,
} from '../../src/generated/graphql'
import SuggestEditModal from '../../components/Competition/SuggestEditModal'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import withAuth from '../../utils/withAuth'
import { Context } from '@apollo/client'
import Location from '../../components/Event/Location'
import { Button } from '../../src/components/ui/button'
import AthleteLayout from '../../components/Layout/AthleteLayout'
import { usePostHog } from 'posthog-js/react'
import { PartnerMatchingSection } from '../../components/Explore/PartnerMatchingSection'
import dynamic from 'next/dynamic'
import WorkoutSection from '../../components/Event/WorkoutSection'
import RegistrationClosedBanner from '../../components/Event/RegistrationClosedBanner'
import { toTitleCase } from '../../utils/toTitleCase'
import { currencySymbols } from '../../utils/currencyMap'
import Head from 'next/head'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)

const Organiser = dynamic(() => import('../../components/Event/Organiser'))
const Registered = dynamic(() => import('../../components/Event/Registered'))
const RegisterModal = dynamic(() => import('../../components/Event/RegisterModal'), {
  ssr: false,
})

export const getServerSideProps = withAuth(async function (context: Context) {
  return {
    props: { user: context.user },
  }
}, false)

type Props = {
  user: User | null
}

const EventDetails = (props: Props) => {
  const [openModal, setOpenModal] = useState(false)
  const [suggestEditModalOpen, setSuggestEditModalOpen] = useState(false)
  const router = useRouter()
  const compId = router.query.id as string
  const posthog = usePostHog()

  const { data: competitionData } = useGetCompetitionByIdQuery({
    variables: { id: compId },
    fetchPolicy: 'cache-and-network',
  })
  const competition = competitionData?.getCompetitionById

  const { data: registrationData, loading: registrationLoading } =
    useIsUserRegisteredForCompetitionQuery({
      variables: { competitionId: compId },
      skip: !compId || !props.user,
      fetchPolicy: 'cache-first',
    })

  const isRegistered = registrationData?.isUserRegisteredForCompetition

  const [getTicketTypes, { data: ticketTypesData, loading: ticketTypesLoading, called }] =
    useGetTicketTypesByCompetitionIdLazyQuery({
      variables: { competitionId: compId },
      fetchPolicy: 'cache-and-network',
    })
  const isSoldOut = ticketTypesData?.getTicketTypesByCompetitionId?.every(
    (ticketType) => !ticketType?.hasAvailability,
  )

  useEffect(() => {
    if (!called && compId && competition && !competition.source?.startsWith('SCRAPED')) {
      getTicketTypes()
    }
  }, [called, getTicketTypes, compId, competition])

  // Redirect to directory comp page if this competition has a linked directory comp
  useEffect(() => {
    if (competition?.directoryCompId) {
      // router.replace(`/explore/${competition.directoryCompId}`)
    }
  }, [competition?.directoryCompId, router])

  const startDate = dayjs
    .utc(competition?.startDateTime)
    .tz(competition?.timezone ?? 'UTC')
  const endDate = dayjs.utc(competition?.endDateTime).tz(competition?.timezone ?? 'UTC')
  const venue = competition?.address?.venue
  const city = competition?.address?.city
  const country = competition?.address?.country

  let dateRange
  if (startDate.isSame(endDate, 'day')) {
    dateRange = startDate.format('MMMM D, YYYY')
  } else {
    dateRange = `${startDate.format('MMMM D')}-${endDate.format('D, YYYY')}`
  }

  let timeRange
  // For scraped competitions, don't show time since it's often not accurate
  const isScrapedCompetition = competition?.source?.startsWith('SCRAPED')

  if (isScrapedCompetition) {
    timeRange = null // Don't show time for scraped competitions
  } else {
    if (startDate.isSame(endDate, 'day')) {
      timeRange = `${startDate.format('h:mm A')} - ${endDate.format('h:mm A')}`
    } else {
      timeRange = `${startDate.format('MMMM D, h:mm A')} - ${endDate.format(
        'MMMM D, h:mm A',
      )}`
    }
  }

  const handleOpen = () => {
    // Track registration modal opened
    posthog?.capture('Registration Modal Opened', {
      competitionId: compId,
      competitionName: competition?.name,
      page: 'event',
    })

    if (!isScrapedCompetition) {
      getTicketTypes({
        variables: { competitionId: compId },
        fetchPolicy: 'network-only',
      })
    }
    setOpenModal(true)
  }

  const handleExternalRegistration = () => {
    if (!competition?.website) {
      console.error('❌ No website URL available for registration')
      return
    }

    // Track external registration click
    posthog?.capture('External Registration Clicked', {
      competitionId: compId,
      competitionName: competition.name,
      website: competition.website,
      source: competition.source,
    })

    console.log('🌐 Opening competition website:', competition.website)
    window.open(competition.website, '_blank')
  }

  const handleClose = () => {
    setOpenModal(false)
  }

  const showLeaderboard =
    router.query.showLeaderboard === 'true' || router.query.sl === 'true'

  // Check for ?sl=true parameter to show registered view
  const showRegisteredView = router.query.sl === 'true' || isRegistered

  // Only show partner matching if at least one ticket type has teamSize >= 2
  const hasTeamTicket = ticketTypesData?.getTicketTypesByCompetitionId?.some(
    (tt) => tt?.teamSize && tt.teamSize >= 2,
  )

  // Calculate price display
  const calculatePriceRange = (
    ticketTypes: any[] | undefined | null,
    currency?: string | null,
  ) => {
    if (!ticketTypes || ticketTypes.length === 0) return null
    const nonVolunteerTickets = ticketTypes.filter(
      (tt) => tt && !tt.isVolunteer && tt.price >= 0,
    )
    if (nonVolunteerTickets.length === 0) return null
    const prices = nonVolunteerTickets.map((tt) => tt.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    if (maxPrice === 0) return 'Free'
    const displayCurrency = nonVolunteerTickets[0]?.currency || currency || 'USD'
    const symbol =
      currencySymbols[displayCurrency as keyof typeof currencySymbols] || displayCurrency
    if (minPrice === 0 && maxPrice > 0) return `Free - ${symbol}${maxPrice}`
    if (minPrice === maxPrice) return `${symbol}${minPrice}`
    return `${symbol}${minPrice} - ${symbol}${maxPrice}`
  }

  let priceDisplay: string | null = null
  if (isScrapedCompetition) {
    if (
      competition?.price !== undefined &&
      competition?.price !== null &&
      competition?.currency
    ) {
      const symbol =
        currencySymbols[competition.currency as keyof typeof currencySymbols] ||
        competition.currency
      priceDisplay = competition.price === 0 ? 'Free' : `${symbol}${competition.price}`
    }
  } else {
    priceDisplay = calculatePriceRange(
      ticketTypesData?.getTicketTypesByCompetitionId ?? [],
      competition?.currency ?? null,
    )
  }

  if (!competition) return null
  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <title>{`${competition?.name || ''}${city || country ? ' – ' : ''}${[city, country].filter(Boolean).join(', ')}`}</title>
        <meta
          name="description"
          content={`${competition?.name || ''}${city || country ? ' in ' : ''}${[city, country].filter(Boolean).join(', ')} on ${dateRange}${priceDisplay ? ` • ${priceDisplay}` : ''}`}
        />
        <link rel="canonical" href={`https://fitlo.co/event/${compId}`} />
        <meta property="og:type" content="event" />
        <meta property="og:title" content={`${competition?.name || ''}`} />
        <meta
          property="og:description"
          content={`${[city, country].filter(Boolean).join(', ')} • ${dateRange}${priceDisplay ? ` • ${priceDisplay}` : ''}`}
        />
        <meta
          property="og:image"
          content={competition?.logo || 'https://fitlo.co/api/og'}
        />
        <meta property="og:url" content={`https://fitlo.co/event/${compId}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: competition?.name,
              description: competition?.description,
              startDate: dayjs.utc(competition?.startDateTime).toISOString(),
              endDate: dayjs.utc(competition?.endDateTime).toISOString(),
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              image: competition?.logo || undefined,
              location: {
                '@type': 'Place',
                name: venue || [city, country].filter(Boolean).join(', '),
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: city || undefined,
                  addressCountry: country || undefined,
                },
              },
              offers:
                priceDisplay && priceDisplay !== 'Free'
                  ? {
                      '@type': 'Offer',
                      url: `https://fitlo.co/event/${compId}`,
                    }
                  : undefined,
              url: `https://fitlo.co/event/${compId}`,
            }),
          }}
        />
      </Head>
      <div className="flex justify-center pt-4 bg-background">
        <div className="md:w-3/4 xl:w-3/5 w-full flex flex-col">
          {/* Event image - Mobile only, full width at top */}
          {competition?.logo && (
            <div className="md:hidden w-full px-6 mx-auto pt-2">
              <div className="relative aspect-square bg-background rounded-xl shadow-md overflow-hidden">
                <OptimizedImage
                  src={competition.logo}
                  alt={competition.name || 'Event image'}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 0px"
                />
              </div>
            </div>
          )}

          {/* Main layout with padding - unified background */}
          <div className="flex flex-col md:flex-row items-start justify-between p-8 bg-background rounded-xl shadow-none mt-4">
            {/* Left sidebar - Desktop only */}
            <div className="hidden md:block flex-shrink-0 w-full md:w-2/5 space-y-4 text-white">
              <Organiser competition={competition} />
              {!isRegistered && !showRegisteredView && hasTeamTicket && (
                <div>
                  <PartnerMatchingSection
                    event={
                      {
                        id: compId,
                        title: competition.name || '',
                        location: `${city || ''}, ${country || ''}`,
                        country: country || '',
                        startDate: competition.startDateTime,
                        endDate: competition.endDateTime,
                        competitionId: compId,
                        categories: [],
                      } as any
                    }
                  />
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col justify-start items-start w-full md:pl-8">
              {/* Event image section removed - now handled by Organiser component */}

              <h2 className="text-4xl font-semibold text-white mb-4 text-left">
                {competition.name}
              </h2>

              <div className="flex items-center mb-4">
                <Calendar className="text-primary mr-3 w-8 h-8" />
                <div>
                  <p className="text-md text-white">{dateRange}</p>
                  {timeRange && <p className="text-sm">{timeRange}</p>}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <MapPin className="text-primary mr-3 w-8 h-8" />
                <div>
                  <p className="text-md text-white">
                    {venue ? toTitleCase(venue) : venue}
                  </p>
                  <p className="text-sm">
                    {city ? toTitleCase(city) : city}
                    {city && country ? ', ' : ''}
                    {country ? toTitleCase(country) : country}
                  </p>
                </div>
              </div>
              {priceDisplay && (
                <div className="flex items-center mb-2">
                  <Banknote className="text-primary mr-3 w-8 h-8" />
                  <div>
                    <p className="text-md font-medium">{priceDisplay}</p>
                  </div>
                </div>
              )}

              {/* Suggest Edit Button - Only for scraped competitions */}
              {props.user && competition.source?.startsWith('SCRAPED') && (
                <button
                  onClick={() => setSuggestEditModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 w-full max-w-sm mt-4 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                  Suggest Edit
                </button>
              )}

              {isRegistered || showRegisteredView ? (
                <Registered user={props.user as any} competition={competition} />
              ) : (
                <>
                  {/* Check if this is a scraped competition */}
                  {competition.source?.startsWith('SCRAPED') ? (
                    // Scraped competition - show external registration button
                    <Button
                      onClick={handleExternalRegistration}
                      variant={'default'}
                      className="w-full max-w-sm mt-6 font-semibold"
                      data-testid="register-button"
                    >
                      Register
                    </Button>
                  ) : (
                    // User-created competition - show existing logic
                    <>
                      {!competition.registrationEnabled && (
                        <RegistrationClosedBanner
                          competitionName={competition.name || undefined}
                        />
                      )}
                      <Button
                        onClick={handleOpen}
                        variant={'default'}
                        className="w-full max-w-sm mt-6 font-semibold"
                        disabled={
                          isSoldOut ||
                          registrationLoading ||
                          !competition.registrationEnabled
                        }
                        data-testid="register-button"
                      >
                        {registrationLoading
                          ? 'Checking...'
                          : !competition.registrationEnabled
                            ? 'Registrations Closed'
                            : isSoldOut
                              ? 'Sold Out'
                              : 'Register'}
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Partner matching section - Mobile only, appears below register button */}
              {!isRegistered && !showRegisteredView && hasTeamTicket && (
                <div className="md:hidden w-full mt-6">
                  <PartnerMatchingSection
                    event={
                      {
                        id: compId,
                        title: competition.name || '',
                        location: `${city || ''}, ${country || ''}`,
                        country: country || '',
                        startDate: competition.startDateTime,
                        endDate: competition.endDateTime,
                        competitionId: compId,
                        categories: [],
                      } as any
                    }
                  />
                </div>
              )}

              {/* Mobile organiser section */}
              <div className="md:hidden w-full mt-6 text-white">
                <Organiser competition={competition} />
              </div>

              <div className="mt-6 md:mt-0 text-white w-full max-w-lg">
                <h2 className="text-xl font-montserrat text-white not-prose pb-2 pt-2 md:pt-6">
                  About
                </h2>
                <hr className="mb-2 border-gray-700 w-full" />
                <div className="overflow-y-auto">
                  {competition.description?.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-base py-1">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Only show workout section for user-created competitions */}
                {!competition.source?.startsWith('SCRAPED') && (
                  <WorkoutSection
                    event={{
                      id: competition.id,
                      title: competition.name || '',
                      location: competition.address?.city || '',
                      country: competition.address?.country || '',
                      startDate: competition.startDateTime,
                      endDate: competition.endDateTime,
                      competitionId: competition.id,
                      description: competition.description || '',
                    }}
                  />
                )}
                <div className="mt-6 md:mt-0">
                  <Location competition={competition} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-6">
        <div className="md:w-3/4 xl:w-3/5 w-full px-8">
          <div className="text-center">
            <button
              onClick={() => router.push('/create')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Create your comp with Fitlo ↗
            </button>
          </div>
        </div>
      </div>

      <RegisterModal
        ticketTypes={ticketTypesData?.getTicketTypesByCompetitionId ?? []}
        open={openModal}
        handleClose={handleClose}
        loading={ticketTypesLoading}
      />

      {/* Suggest Edit Modal */}
      {competition && (
        <SuggestEditModal
          competition={{
            id: competition.id,
            name: competition.name || '',
            description: competition.description,
            website: competition.website,
            email: (competition as any).email,
            startDateTime: competition.startDateTime,
            endDateTime: competition.endDateTime,
            price: (competition as any).price,
            currency: (competition as any).currency,
            address: {
              venue: competition.address?.venue,
              city: competition.address?.city,
              country: competition.address?.country,
            },
          }}
          user={props.user}
          isOpen={suggestEditModalOpen}
          onClose={() => setSuggestEditModalOpen(false)}
        />
      )}
    </>
  )
}

EventDetails.layout = AthleteLayout
export default EventDetails
