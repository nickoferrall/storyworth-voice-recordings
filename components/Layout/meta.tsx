import Head from 'next/head'

const DOMAIN = 'https://storyworth.com'

export default function Meta({
  title = 'Storyworth - Phone recording and transcription',
  description = 'Record your voice by phone and get a transcript with Storyworth.',
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
      <meta name="twitter:site" content="@storyworth" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  )
}
