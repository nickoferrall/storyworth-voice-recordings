import { Search, Headphones, Calendar, TrendingUp } from 'lucide-react'

const features = [
 {
  name: 'Advanced SEO',
  description:
   'We use advanced SEO techniques to make sure that your gym ranks well in search engines.',
  icon: Search,
 },
 {
  name: 'Ongoing Support',
  description: `World class support. Simply email us or message us on whatsapp/SMS and we'll make the changes you need.`,
  icon: Headphones,
 },
 {
  name: 'Tailored for Gyms',
  description: `Display your gyms timetable on your website and accept drop-ins.`,
  icon: Calendar,
 },
 {
  name: 'Increased Conversions',
  description: `We build Lightning fast, intuitive websites that convert visitors into paying members.`,
  icon: TrendingUp,
 },
]

export default function Features() {
 return (
  <div id="features" className="bg-white py-24 sm:py-32">
   <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-2xl lg:text-center">
     <h2 className="text-base/7 font-semibold text-indigo-600">Stress Free</h2>
     <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance">
      Everything you need for success
     </p>
     <p className="mt-6 text-lg/8">
      We deliver beautiful websites for your gym, quickly. Make ongoing updates as
      your gym evolves.
     </p>
    </div>
    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
     <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {features.map((feature) => (
       <div key={feature.name} className="relative pl-16">
        <dt className="text-base/7 font-semibold">
         <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
          <feature.icon aria-hidden="true" className="size-6 text-white" />
         </div>
         {feature.name}
        </dt>
        <dd className="mt-2 text-base/7">{feature.description}</dd>
       </div>
      ))}
     </dl>
    </div>
   </div>
  </div>
 )
}
