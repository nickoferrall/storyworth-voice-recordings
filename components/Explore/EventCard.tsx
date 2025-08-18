import React, { useEffect } from 'react'
import { currencySymbols } from '../../utils/currencyMap'
import { GetExploreCompetitionsQuery } from '../../src/generated/graphql'
import { countryNameToCode } from '../../utils/countries'
import { formatEventDate } from '../../utils/formatEventDate'
import { toTitleCase } from '../../utils/toTitleCase'

import Image from 'next/image'
import { Calendar } from 'lucide-react'
import OptimizedImage from '../OptimizedImage'

type EventCardProps = {
  event: GetExploreCompetitionsQuery['getExploreCompetitions'][0]
  onClick: () => void
}

// Helper function to get country flag emoji
const getCountryFlag = (country: string | null | undefined): string => {
  if (!country) return '🌍' // Global emoji as fallback

  const flagMap: { [key: string]: string } = {
    // Common country mappings
    'United States': '🇺🇸',
    USA: '🇺🇸',
    US: '🇺🇸',
    'United Kingdom': '🇬🇧',
    UK: '🇬🇧',
    Australia: '🇦🇺',
    AUS: '🇦🇺',
    Canada: '🇨🇦',
    CAN: '🇨🇦',
    Germany: '🇩🇪',
    GER: '🇩🇪',
    France: '🇫🇷',
    FRA: '🇫🇷',
    'New Zealand': '🇳🇿',
    NZ: '🇳🇿',
    Ireland: '🇮🇪',
    Spain: '🇪🇸',
    Italy: '🇮🇹',
    Netherlands: '🇳🇱',
    Belgium: '🇧🇪',
    Sweden: '🇸🇪',
    Norway: '🇳🇴',
    Denmark: '🇩🇰',
    Finland: '🇫🇮',
    Poland: '🇵🇱',
    'Czech Republic': '🇨🇿',
    Austria: '🇦🇹',
    Switzerland: '🇨🇭',
    Portugal: '🇵🇹',
    Brazil: '🇧🇷',
    Mexico: '🇲🇽',
    Japan: '🇯🇵',
    'South Korea': '🇰🇷',
    China: '🇨🇳',
    India: '🇮🇳',
    Singapore: '🇸🇬',
    'South Africa': '🇿🇦',
    UAE: '🇦🇪',
    'United Arab Emirates': '🇦🇪',
  }

  // Try exact match first
  if (flagMap[country]) {
    return flagMap[country]
  }

  // Try case-insensitive match
  const lowerCountry = country.toLowerCase()
  for (const [key, flag] of Object.entries(flagMap)) {
    if (key.toLowerCase() === lowerCountry) {
      return flag
    }
  }

  // Fallback to location pin emoji
  return '📍'
}

// Helper function to calculate price range from ticket types
const calculatePriceRange = (
  ticketTypes: any[] | null | undefined,
  currency?: string | null,
) => {
  if (!ticketTypes || ticketTypes.length === 0) {
    return 'View Pricing'
  }

  // Filter out volunteer tickets (include free tickets price = 0)
  const nonVolunteerTickets = ticketTypes.filter(
    (tt) => tt && !tt.isVolunteer && tt.price >= 0,
  )

  if (nonVolunteerTickets.length === 0) {
    return 'View Pricing'
  }

  const prices = nonVolunteerTickets.map((tt) => tt.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // Handle free competitions
  if (maxPrice === 0) {
    return 'Free'
  }

  // Use the currency from ticket types or fallback to competition currency
  const displayCurrency = nonVolunteerTickets[0]?.currency || currency || 'USD'

  // Get currency symbol using the imported currencySymbols
  const symbol =
    currencySymbols[displayCurrency as keyof typeof currencySymbols] || displayCurrency

  // Handle mixed free and paid tickets
  if (minPrice === 0 && maxPrice > 0) {
    return `Free - ${symbol}${maxPrice}`
  }

  if (minPrice === maxPrice) {
    return `${symbol}${minPrice}`
  } else {
    return `${symbol}${minPrice} - ${symbol}${maxPrice}`
  }
}

export function EventCard({ event, onClick }: EventCardProps) {
  // Debug logging for production issue
  useEffect(() => {
    console.log('🎯 EventCard event data:', {
      id: event.id,
      name: event.name,
      logo: event.logo,
      logoType: typeof event.logo,
      logoExists: !!event.logo,
      fullEvent: event,
    })
  }, [event])

  // Use the original logo URL without any modifications for now
  // The 400 errors in production are likely caused by URL transformations
  const optimizedLogoUrl = event.logo

  // Calculate price range from ticket types, fallback to single price
  const hasValidTicketTypes =
    event.ticketTypes &&
    event.ticketTypes.length > 0 &&
    event.ticketTypes.some((tt) => tt && !tt.isVolunteer && tt.price >= 0)

  const priceDisplay = hasValidTicketTypes
    ? calculatePriceRange(event.ticketTypes, event.currency)
    : event.price !== undefined && event.price !== null && event.currency
      ? event.price === 0
        ? 'Free'
        : `${currencySymbols[event.currency as keyof typeof currencySymbols] || event.currency}${event.price}`
      : 'View Pricing'

  const countryFlag = getCountryFlag(event.address.country)

  // Source-aware styling: only user-created comps get the Fitlo badge/styling
  const source = event.source || 'USER_CREATED'
  const isFitloEvent = source === 'USER_CREATED'

  // Special styling for Fitlo events
  const cardClasses = isFitloEvent
    ? 'group flex items-stretch gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 bg-gray-900 border-2 border-purple-500/60 shadow-lg shadow-purple-500/20 h-40'
    : 'group flex items-stretch gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/20 bg-gray-900 border border-gray-800 h-40'

  return (
    <div onClick={onClick} className={cardClasses}>
      {/* Content Section - Left Side */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title */}
        <h3
          className="font-bold text-lg text-white mb-3 truncate"
          title={event.name || undefined}
        >
          {event.name}
        </h3>

        {/* Date and Location */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">{formatEventDate(event.startDateTime, true)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-base flex-shrink-0">{countryFlag}</span>
            <span className="text-sm truncate">
              {event.address.city && event.address.country
                ? `${toTitleCase(event.address.city)}, ${(event.address.country && countryNameToCode[event.address.country]) || event.address.country}`
                : (event.address.city && toTitleCase(event.address.city)) ||
                  (event.address.country && countryNameToCode[event.address.country]) ||
                  event.address.country}
            </span>
          </div>
        </div>

        {/* Price - Always at bottom */}
        <div className="text-sm font-semibold text-gray-200 mt-auto">
          <span className="text-gray-400">{priceDisplay}</span>
        </div>
      </div>

      {/* Square Image Section - Right Side */}
      <div className="flex-shrink-0 relative">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-800">
          {event.logo ? (
            <>
              <OptimizedImage
                src={optimizedLogoUrl || event.logo}
                alt={event.name || 'Competition'}
                fill
                className="object-cover"
                sizes="96px"
                priority={false}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Source Badge - Bottom Right Corner */}
        {isFitloEvent && (
          <span className="absolute -bottom-3 -right-1 px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full shadow-lg">
            Fitlo
          </span>
        )}
      </div>
    </div>
  )
}
