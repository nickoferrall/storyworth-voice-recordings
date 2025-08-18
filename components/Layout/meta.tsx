import Head from 'next/head'

const DOMAIN = 'https://fitlo.co'

export default function Meta({
  title = 'Fitlo - Functional Fitness Competition Management',
  description = 'Fitlo helps you manage and organize functional fitness competitions, HYROX events, and CrossFit competitions with ease.',
  image = `${DOMAIN}/api/og`,
  canonical = DOMAIN,
}: {
  title?: string
  description?: string
  image?: string
  canonical?: string
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={canonical} />

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta itemProp="image" content={image} />
      <meta property="og:logo" content={`${DOMAIN}/logo.png`}></meta>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fitlo" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  )
}
