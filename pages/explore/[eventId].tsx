import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  GetDirectoryCompsQuery,
  GetDirectoryCompsDocument,
  useGetDirectoryCompsQuery,
  GetDirectoryCompDocument,
  useUpdateDirectoryCompMutation,
  useRequestDirectoryCompEditMutation,
  useGetTicketTypesByCompetitionIdLazyQuery,
  useGetMyCompetitionsAsAthleteQuery,
  useGetWorkoutsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import Head from 'next/head'
import { formatEventDate } from '../../utils/formatEventDate'
import { GetServerSideProps } from 'next'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Button } from '../../src/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import { Badge } from '../../src/components/ui/badge'
import { Instagram, Mail, Globe, Ticket, Edit, X, Trophy, Calendar } from 'lucide-react'
import { currencySymbols } from '../../utils/currencyMap'
import { upperFirst } from '../../lib/upperFirst'
import { PartnerMatchingSection } from '../../components/Explore/PartnerMatchingSection'
import { useUser } from '../../contexts/UserContext'
import SnackbarComponent from '../../components/Snackbar'
import UploadImageDropzone from '../../components/Overview/UploadImageDropzone'
import WorkoutSection from '../../components/Event/WorkoutSection'
import axios from 'axios'
import dynamic from 'next/dynamic'

const RegisterModal = dynamic(() => import('../../components/Event/RegisterModal'))
const LeaderboardModal = dynamic(() => import('../../components/Event/LeaderboardModal'))
const ScheduleModal = dynamic(() => import('../../components/Event/ScheduleModal'))

type EventPageProps = {
  initialEvent?: GetDirectoryCompsQuery['getDirectoryComps'][0]
  isShallow?: boolean
}

export const getServerSideProps: GetServerSideProps<EventPageProps> = async (context) => {
  if (context.query._shallow) {
    return { props: { isShallow: true } }
  }

  const { eventId } = context.params || {}

  const client = new ApolloClient({
    uri:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL || 'https://fitlo.co/api/graphql'
        : 'http://localhost:3000/api/graphql',
    cache: new InMemoryCache(),
  })

  try {
    const { data } = await client.query<GetDirectoryCompsQuery>({
      query: GetDirectoryCompsDocument,
      variables: { initialLoad: false },
    })

    const event = data.getDirectoryComps.find((comp) => comp.id === eventId)

    if (!event) {
      const { data: specificData } = await client.query({
        query: GetDirectoryCompDocument,
        variables: { id: eventId },
      })

      if (!specificData.getDirectoryComp) {
        return {
          notFound: true,
        }
      }

      return {
        props: {
          initialEvent: specificData.getDirectoryComp,
        },
      }
    }

    return {
      props: {
        initialEvent: event,
      },
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return {
      notFound: true,
    }
  }
}

export default function EventPage({ initialEvent, isShallow }) {
  const router = useRouter()
  const { eventId } = router.query
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [updateDirectoryComp] = useUpdateDirectoryCompMutation()
  const [requestDirectoryCompEdit] = useRequestDirectoryCompEditMutation()
  const [getTicketTypes, { data: ticketTypesData, loading: ticketTypesLoading }] =
    useGetTicketTypesByCompetitionIdLazyQuery()

  const { data } = useGetDirectoryCompsQuery({
    variables: { initialLoad: false },
    skip: !isShallow,
    fetchPolicy: 'cache-only',
  })

  const event = isShallow
    ? data?.getDirectoryComps?.find((comp) => comp.id === eventId)
    : initialEvent

  // Redirect to competition page if this directory comp is linked to a competition
  useEffect(() => {
    if (event?.competitionId) {
      router.replace(`/event/${event.competitionId}`)
    }
  }, [event?.competitionId, router])

  // Check if user is registered for the linked competition
  const { data: myCompetitionsData, loading: myCompetitionsLoading } =
    useGetMyCompetitionsAsAthleteQuery({
      skip: !event?.competitionId,
    })

  const isRegistered =
    event?.competitionId &&
    !myCompetitionsLoading &&
    !!myCompetitionsData?.getMyCompetitionsAsAthlete?.some(
      (comp) => comp.id === event.competitionId,
    )

  // Check for ?sl=true parameter to show registered view
  const showRegisteredView = router.query.sl === 'true' || isRegistered

  const eventType = event?.title.toLowerCase().includes('hyrox') ? 'HYROX' : 'CrossFit'

  useEffect(() => {
    return () => {
      router.beforePopState(() => true)
    }
  }, [router])

  const handleBack = () => {
    router.push('/explore')
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'fitova')

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dkeppgndn/image/upload`,
        formData,
      )
      return response.data.secure_url
    } catch (error) {
      setUploadError('Error uploading image')
      console.error('Error uploading image to Cloudinary:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleEditClick = () => {
    // Both super users and regular users can access the edit form
    setEditData({
      id: event.id,
      title: event.title,
      location: event.location,
      price: event.price,
      currency: event.currency,
      website: event.website,
      ticketWebsite: event.ticketWebsite,
      email: event.email,
      instagramHandle: event.instagramHandle,
      logo: event.logo,
      description: event.description,
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editData) return

    try {
      if (user?.isSuperUser) {
        // Super user - save changes directly
        await updateDirectoryComp({
          variables: {
            input: editData,
          },
        })
        setIsEditing(false)
        setEditData(null)
        setSnackbarMessage('Event updated successfully!')
        setShowSnackbar(true)
        // Refresh the page to show updated data
        setTimeout(() => {
          router.reload()
        }, 1000)
      } else {
        // Regular user - send edit request via GraphQL mutation
        const result = await requestDirectoryCompEdit({
          variables: {
            input: {
              eventId: event.id,
              eventTitle: event.title,
              title: editData.title !== event.title ? editData.title : undefined,
              location:
                editData.location !== event.location ? editData.location : undefined,
              price: editData.price !== event.price ? editData.price : undefined,
              website: editData.website !== event.website ? editData.website : undefined,
              ticketWebsite:
                editData.ticketWebsite !== event.ticketWebsite
                  ? editData.ticketWebsite
                  : undefined,
              email: editData.email !== event.email ? editData.email : undefined,
              instagramHandle:
                editData.instagramHandle !== event.instagramHandle
                  ? editData.instagramHandle
                  : undefined,
              logo: editData.logo !== event.logo ? editData.logo : undefined,
              description:
                editData.description !== event.description
                  ? editData.description
                  : undefined,
            },
          },
        })

        setIsEditing(false)
        setEditData(null)

        if (result.data?.requestDirectoryCompEdit) {
          setSnackbarMessage(
            "Edit request sent! We'll review your request and get back to you.",
          )
        } else {
          setSnackbarMessage('Failed to send edit request. Please try again.')
        }
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      setSnackbarMessage('Failed to update event. Please try again.')
      setShowSnackbar(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const handleOpenRegistrationModal = () => {
    if (event.competitionId) {
      // Track registration modal opened (if PostHog is available)
      if (typeof window !== 'undefined' && (window as any).posthog) {
        ;(window as any).posthog.capture('Registration Modal Opened', {
          competitionId: event.competitionId,
          competitionName: event.title,
          page: 'explore',
        })
      }

      getTicketTypes({ variables: { competitionId: event.competitionId } })
      setOpenRegistrationModal(true)
    }
  }

  const handleCloseRegistrationModal = () => {
    setOpenRegistrationModal(false)
  }

  // Helper function to ensure URL has proper protocol
  const ensureHttps = (url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Explore',
        item: 'https://fitlo.co/explore',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: event.title,
        item: `https://fitlo.co/explore/${event.id}`,
      },
    ],
  }

  if (!event) return null

  return (
    <>
      <Head>
        <title>{`${event.title} - ${eventType} Competition in ${event.location}`}</title>
        <meta
          name="description"
          content={`Find ${eventType} competitions in ${event.location}. Register for ${event.title}, a ${eventType} competition in ${event.location} on ${formatEventDate(event.startDate, true)}. Find ${eventType} competitions near you.`}
        />
        <meta
          property="og:title"
          content={`${event.title} - ${eventType} Competition in ${event.location}`}
        />
        <meta
          property="og:description"
          content={`Join ${event.title}, a ${eventType} competition in ${event.location} on ${formatEventDate(event.startDate, true)}`}
        />
        <meta property="og:image" content={event.logo || ''} />
        <meta property="og:type" content="event" />
        <meta property="og:url" content={`https://fitlo.co/explore/${eventId}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${event.title} - ${eventType} Competition in ${event.location}`}
        />
        <meta
          name="twitter:description"
          content={`Join ${event.title}, a ${eventType} competition in ${event.location} on ${formatEventDate(event.startDate, true)}`}
        />
        <meta name="twitter:image" content={event.logo || ''} />

        <meta
          name="keywords"
          content={`${eventType.toLowerCase()}, ${eventType} competition, ${event.location}, ${eventType} events, competitive ${eventType.toLowerCase()}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsEvent',
              name: event.title,
              startDate: event.startDate,
              location: {
                '@type': 'Place',
                name: event.location,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: event.location,
                  addressCountry: event.country,
                },
              },
              description: `${event.title} - A ${eventType} competition in ${event.location}`,
              image: event.logo || '',
              url: `https://fitlo.co/explore/${eventId}`,
              sport: eventType,
              eventStatus: 'https://schema.org/EventScheduled',
              offers: event.price
                ? {
                    '@type': 'Offer',
                    price: event.price,
                    priceCurrency: event.currency,
                    availability: 'https://schema.org/InStock',
                  }
                : undefined,
              organizer: {
                '@type': 'Organization',
                name: event.organizerName || 'Event Organizer',
              },
            }),
          }}
        />

        <link rel="canonical" href={`https://fitlo.co/explore/${eventId}`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            ← Back to Explore
          </Button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-square sm:aspect-[2/1] bg-gray-200">
              {event.logo && (
                <img
                  src={event.logo}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  <div className="mt-2 flex items-center">
                    <span>
                      {event.competition?.startDateTime
                        ? formatEventDate(event.competition.startDateTime, true)
                        : formatEventDate(event.startDate, true)}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="inline">{event.location}</span>
                    {event.instagramHandle && (
                      <>
                        <span className="mx-2">•</span>
                        <a
                          href={
                            event.instagramHandle.startsWith('http')
                              ? event.instagramHandle
                              : `https://instagram.com/${event.instagramHandle}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className=" hover:text-purple-600 transition-colors"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {user && !event.competitionId && (
                    <Button variant="outline" size="sm" onClick={handleEditClick}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {event.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={ensureHttps(event.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {!showRegisteredView &&
                    (event.competitionId || event.ticketWebsite) && (
                      <Button
                        size="sm"
                        onClick={
                          event.competitionId ? handleOpenRegistrationModal : undefined
                        }
                        asChild={!event.competitionId}
                      >
                        {event.competitionId ? (
                          <>
                            <Ticket className="w-4 h-4 mr-2" />
                            Get Tickets
                          </>
                        ) : (
                          <a
                            href={ensureHttps(event.ticketWebsite)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            Get Tickets
                          </a>
                        )}
                      </Button>
                    )}
                </div>
              </div>

              {showRegisteredView && !isEditing && event.competitionId && (
                <div className="mt-6 bg-card border border-border p-6 rounded-xl shadow text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-white">You're In!</p>
                  </div>
                  {user?.email && (
                    <p className="text-sm mb-4 text-white">
                      A confirmation email has been sent to <strong>{user.email}</strong>.
                    </p>
                  )}

                  {/* Google Calendar Link */}
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      event.title || '',
                    )}&dates=${formatEventDate(event.startDate, false).replace(/[-:]/g, '')}T000000Z/${formatEventDate(event.endDate || event.startDate, false).replace(/[-:]/g, '')}T235959Z&details=${encodeURIComponent(
                      event.description || `${event.title} competition`,
                    )}&location=${encodeURIComponent(event.location || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm border border-slate-600 shadow-sm text-white mb-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Add to Calendar
                  </a>

                  <div className="my-6 border-t border-slate-700"></div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowLeaderboard(true)}
                      className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm border border-slate-600 shadow-sm text-white"
                    >
                      <Trophy className="h-4 w-4" />
                      <span className="hidden sm:block">View Leaderboard</span>
                      <span className="block sm:hidden">Leaderboard</span>
                    </button>

                    <button
                      onClick={() => setShowSchedule(true)}
                      className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm border border-slate-600 shadow-sm text-white"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:block">Your Schedule</span>
                      <span className="block sm:hidden">Schedule</span>
                    </button>
                  </div>

                  <p className="text-sm mt-4 text-white">
                    No longer able to attend?
                    <a
                      href={`mailto:${event.email || 'support@fitlo.co'}?subject=Unable to attend ${event.title}`}
                      className="text-sm text-purple-300 hover:text-purple-400"
                    >
                      {' Notify the hosts here.'}
                    </a>
                  </p>
                </div>
              )}

              <div className="mt-6">
                {isEditing ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Edit Event Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          value={editData?.title || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                          type="text"
                          value={editData?.location || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, location: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          value={editData?.price || ''}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price: parseFloat(e.target.value),
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Website</label>
                        <input
                          type="url"
                          value={editData?.website || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, website: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ticket Website
                        </label>
                        <input
                          type="url"
                          value={editData?.ticketWebsite || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, ticketWebsite: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={editData?.email || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Instagram Handle
                        </label>
                        <input
                          type="text"
                          value={editData?.instagramHandle || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, instagramHandle: e.target.value })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          About / Description
                        </label>
                        <textarea
                          value={editData?.description || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          rows={6}
                          className="w-full p-2 border rounded"
                          placeholder="Tell people about this event..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Event Image
                        </label>
                        <div className="space-y-2">
                          {editData?.logo ? (
                            <div className="relative">
                              <img
                                src={editData.logo}
                                alt="Event preview"
                                className="w-full h-48 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => setEditData({ ...editData, logo: '' })}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <UploadImageDropzone
                              onDrop={async (files) => {
                                if (files.length > 0) {
                                  try {
                                    const imageUrl = await handleImageUpload(files[0])
                                    setEditData({ ...editData, logo: imageUrl })
                                  } catch (error) {
                                    console.error('Error uploading image:', error)
                                  }
                                }
                              }}
                              onRemove={() => setEditData({ ...editData, logo: '' })}
                              type="images"
                              description="Upload event image"
                              showUploadUI={true}
                            />
                          )}
                          {editData?.logo && (
                            <div className="text-center">
                              <button
                                type="button"
                                onClick={() => setEditData({ ...editData, logo: '' })}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Remove image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveEdit}>
                          {user?.isSuperUser ? 'Save Changes' : 'Submit Edit Request'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                      <div className="space-y-4">
                        {event.price !== null && event.price !== undefined && (
                          <div>
                            <span className="font-medium">Price:</span>{' '}
                            {event.price === 0
                              ? 'Free'
                              : `${currencySymbols[event.currency] || '$'}${event.price}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {event.categories && event.categories.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Categories</h2>
                          <div className="space-y-2">
                            {event.categories.map((category) => (
                              <Badge
                                key={category.id}
                                variant="secondary"
                                className="mr-2 mb-2"
                              >
                                {upperFirst(category.difficulty.toLowerCase())} •{' '}
                                {upperFirst(category.gender.toLowerCase())} •{' '}
                                {category.teamSize === 1
                                  ? 'Individual'
                                  : `Team of ${category.teamSize}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {!showRegisteredView && (
                        <div>
                          <PartnerMatchingSection event={event} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && event.description && event.competitionId && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold font-montserrat text-white not-prose mb-4">
                    About
                  </h2>
                  <div className="prose max-w-none">
                    <div className=" whitespace-pre-wrap leading-normal">
                      {isDescriptionExpanded ? (
                        event.description
                      ) : (
                        <>
                          {event.description.length > 200 ? (
                            <>
                              {event.description.substring(0, 200)}
                              {!event.description.substring(0, 200).endsWith('.') &&
                                '...'}
                            </>
                          ) : (
                            event.description
                          )}
                        </>
                      )}
                    </div>
                    {event.description.length > 200 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-3 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        {isDescriptionExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isEditing && event.competitionId && <WorkoutSection event={event} />}
            </div>
          </div>
        </div>
      </div>

      {showSnackbar && (
        <SnackbarComponent
          openSnackbar={showSnackbar}
          setOpenSnackbar={setShowSnackbar}
          message={snackbarMessage}
        />
      )}

      {event.competitionId && (
        <RegisterModal
          ticketTypes={ticketTypesData?.getTicketTypesByCompetitionId ?? []}
          open={openRegistrationModal}
          handleClose={handleCloseRegistrationModal}
          loading={ticketTypesLoading}
        />
      )}

      {showRegisteredView && event.competitionId && (
        <>
          <LeaderboardModal
            open={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            competitionId={event.competitionId || ''}
          />
          <ScheduleModal
            open={showSchedule}
            onClose={() => setShowSchedule(false)}
            userId={user?.id || ''}
            competitionId={event.competitionId || ''}
          />
        </>
      )}
    </>
  )
}
