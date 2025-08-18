// File path: pages/api/sitemap.xml/index.ts

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const GetAllDirectoryCompsDocument = gql`
  query GetAllDirectoryComps {
    getAllDirectoryComps {
      id
      updatedAt
    }
  }
`

// Auto-discover pages function
function getStaticPages() {
  const pagesDir = path.join(process.cwd(), 'pages')
  const files = fs.readdirSync(pagesDir)

  const pages = files
    .filter((file) => {
      return (
        file.endsWith('.tsx') &&
        !file.startsWith('_') &&
        !file.startsWith('api') &&
        file !== '404.tsx' &&
        file !== '500.tsx'
      )
    })
    .map((file) => {
      const name = file.replace('.tsx', '')
      return name === 'index' ? '/' : `/${name}`
    })

  // Add manually curated high-priority pages
  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/explore', priority: '0.9', changefreq: 'daily' },
  ]

  // Add auto-discovered pages with standard priority
  pages.forEach((page) => {
    if (!staticRoutes.find((route) => route.url === page)) {
      staticRoutes.push({
        url: page,
        priority: '0.8',
        changefreq: 'weekly',
      })
    }
  })

  return staticRoutes
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_API_URL || 'https://fitlo.co/api/graphql',
      cache: new InMemoryCache(),
    })

    const { data } = await client.query({
      query: GetAllDirectoryCompsDocument,
    })

    // Set proper XML headers with no-transform to preserve formatting
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    res.setHeader('Cache-Control', 'no-transform')

    const baseUrl = 'https://fitlo.co'

    // Get static routes (now auto-discovered)
    const staticRoutes = getStaticPages()

    const staticUrlsXml = staticRoutes
      .map(
        (route) => `
      <url>
        <loc>${baseUrl}${route.url}</loc>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>`,
      )
      .join('')

    const eventUrlsXml = data.getAllDirectoryComps
      .map((event) => {
        const lastmod = event.updatedAt || new Date().toISOString()
        return `
      <url>
        <loc>${baseUrl}/explore/${event.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/event/${event.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
      })
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrlsXml}${eventUrlsXml}
</urlset>`

    // Send response
    res.status(200).send(xml)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return XML even in error case
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fitlo.co</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    res.status(200).send(fallbackXml)
  }
}
