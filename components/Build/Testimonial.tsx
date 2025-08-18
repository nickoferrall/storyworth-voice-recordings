import { Star } from 'lucide-react'

export default function Testimonial() {
 return (
  <section className="bg-white px-6 py-24 sm:py-32 lg:px-8">
   <figure className="mx-auto max-w-2xl">
    <p className="sr-only">5 out of 5 stars</p>
    <div className="flex gap-x-1 text-indigo-600">
     <Star aria-hidden="true" className="size-5 flex-none fill-current" />
     <Star aria-hidden="true" className="size-5 flex-none fill-current" />
     <Star aria-hidden="true" className="size-5 flex-none fill-current" />
     <Star aria-hidden="true" className="size-5 flex-none fill-current" />
     <Star aria-hidden="true" className="size-5 flex-none fill-current" />
    </div>
    <blockquote className="mt-10 text-xl/8 font-semibold tracking-tight sm:text-2xl/9">
     <p>
      “It was so easy working with Fitlo. I had a quick call and shared what I had
      in mind. Within a week they delivered a fantastic website that's perfect for
      us. Whenever I want an update, they make the change so quickly. I've already
      referred them to my friend!”
     </p>
    </blockquote>
    <figcaption className="mt-10 flex items-center gap-x-6">
     <img
      alt="Jo Nash"
      src="/avatars/jo.png"
      className="size-12 rounded-full bg-gray-50"
     />
     <div className="text-sm/6">
      <div className="font-semibold">Jo Nash</div>
      <div className="mt-0.5">Head Coach at RM CrossFit</div>
     </div>
    </figcaption>
   </figure>
  </section>
 )
}
