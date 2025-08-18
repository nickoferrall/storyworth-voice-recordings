import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
 slug: string
 title: string
 date: string
 datetime: string
 excerpt: string
 coverImage: string
 category: {
  title: string
  href: string
 }
 author: {
  name: string
  role: string
  href: string
  imageUrl: string
 }
}

interface BlogProps {
 posts: Post[]
}

export default function Blog({ posts }: BlogProps) {
 return (
  <div className="bg-white py-24 sm:py-32">
   <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
     <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
      From the Blog
     </h2>
     <p className="mt-2 text-lg leading-8">
      Learn about our latest updates and insights.
     </p>
     <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
      {posts.map((post) => (
       <article
        key={post.slug}
        className="relative isolate flex flex-col gap-8 lg:flex-row"
       >
        <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:flex-shrink-0">
         <Link href={`/blog/${post.slug}`}>
          <Image
           alt={post.title}
           src={post.coverImage}
           layout="fill"
           objectFit="cover"
           className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50"
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
         </Link>
        </div>
        <div>
         <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={post.datetime} className="">
           {post.date}
          </time>
          <Link
           href={post.category.href}
           className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium hover:bg-gray-100"
          >
           {post.category.title}
          </Link>
         </div>
         <div className="group relative max-w-xl">
          <h3 className="mt-3 text-lg font-semibold leading-6 group-hover:">
           <Link href={`/blog/${post.slug}`}>
            <span className="absolute inset-0" />
            {post.title}
           </Link>
          </h3>
          <p className="mt-5 text-sm leading-6">{post.excerpt}</p>
         </div>
         <div className="mt-6 flex border-t border-gray-900/5 pt-6">
          <div className="relative flex items-center gap-x-4">
           <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-50">
            <Image
             alt={post.author.name}
             src={post.author.imageUrl}
             layout="fill"
             objectFit="cover"
            />
           </div>

           <div className="text-sm leading-6">
            <p className="font-semibold">
             {/* <Link href={post.author.href}> */}
             <span className="absolute inset-0" />
             {post.author.name}
             {/* </Link> */}
            </p>
            <p className="">{post.author.role}</p>
           </div>
          </div>
         </div>
        </div>
       </article>
      ))}
     </div>
    </div>
   </div>
  </div>
 )
}

export const getStaticProps = async () => {
 const files = fs.readdirSync(path.join(process.cwd(), 'posts'))

 const posts = files.map((filename) => {
  const slug = filename.replace('.md', '')
  const filePath = path.join(process.cwd(), 'posts', filename)
  const fileContents = fs.readFileSync(filePath, 'utf8')

  // Parse front matter
  const { data } = matter(fileContents)

  return {
   ...(data as Post),
   slug,
  }
 })

 // Sort posts by date
 posts.sort((a, b) => (a.datetime < b.datetime ? 1 : -1))

 return {
  props: {
   posts,
  },
 }
}
