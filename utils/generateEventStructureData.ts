import { GetDirectoryCompsQuery } from '../src/generated/graphql'

type DirectoryComp = GetDirectoryCompsQuery['getDirectoryComps'][0]

export function generateEventStructuredData(events: DirectoryComp[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'Event',
      '@id': `https://fitlo.co/explore/${event.id}`,
      position: index + 1,
      name: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressCountry: event.country,
          addressLocality: event.location,
        },
      },
      offers: event.price
        ? {
            '@type': 'Offer',
            price: event.price,
            priceCurrency: event.currency,
          }
        : undefined,
      image: event.logo || undefined,
      url: event.website || `https://fitlo.co/explore/${event.id}`,
    })),
  }
}
