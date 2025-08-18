export default function Example() {
 return (
  <div id="contact" className="bg-indigo-100">
   <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
    <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
     Ready to dive in? <br />
     Schedule a free call now.
    </h2>
    <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
     <a
      href="https://calendly.com/hello-fitlo/30min"
      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
     >
      Schedule Call
     </a>
    </div>
   </div>
  </div>
 )
}
