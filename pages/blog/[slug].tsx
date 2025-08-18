import { GetStaticPaths, GetStaticProps } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Head from 'next/head'

interface PostData {
  title: string
  date: string
  content: string
  slug?: string
}

interface PostProps {
  postData: PostData
}

export default function Post({ postData }: PostProps) {
  return (
    <div className="prose mx-auto py-16 prose-h1:text-slate-800">
      <Head>
        <title>{postData.title} | Fitlo Blog</title>
        <meta name="description" content={postData.title} />
        <link rel="canonical" href={`https://fitlo.co/blog/${postData.slug || ''}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${postData.title} | Fitlo Blog`} />
        <meta property="og:description" content={postData.title} />
        <meta property="og:image" content="https://fitlo.co/api/og" />
        <meta
          property="og:url"
          content={`https://fitlo.co/blog/${postData.slug || ''}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1>{postData.title}</h1>
      <p className="">{postData.date}</p>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{postData.content}</ReactMarkdown>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'posts'))

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace('.md', ''),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const filePath = path.join(process.cwd(), 'posts', `${params?.slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')

  // Parse front matter
  const { data, content } = matter(fileContents)

  return {
    props: {
      postData: {
        ...(data as { title: string; date: string }),
        content,
        slug: params?.slug as string,
      },
    },
  }
}
