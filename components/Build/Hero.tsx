import React, { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Menu, X } from 'lucide-react'

const navigation = [
 { name: 'Features', href: '#features' },
 { name: 'Pricing', href: '#pricing' },
 { name: 'Contact', href: '#contact' },
]

const Hero = () => {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 React.useEffect(() => {
  document.documentElement.style.scrollBehavior = 'smooth'
  return () => {
   document.documentElement.style.scrollBehavior = 'auto'
  }
 }, [])

 return (
  <div className="bg-gray-900">
   <header className="absolute inset-x-0 top-0 z-50">
    <nav
     aria-label="Global"
     className="flex items-center justify-between p-6 lg:px-8"
    >
     <div className="flex lg:flex-1">
      <a href="#" className="-m-1.5 p-1.5">
       <span className="sr-only">Your Company</span>
       <img alt="" src="/favicon.ico" className="h-8 w-auto rounded-2xl" />
      </a>
     </div>
     <div className="flex lg:hidden">
      <button
       type="button"
       onClick={() => setMobileMenuOpen(true)}
       className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
      >
       <span className="sr-only">Open main menu</span>
       <Menu aria-hidden="true" className="size-6" />
      </button>
     </div>
     <div className="hidden lg:flex lg:gap-x-12">
      {navigation.map((item) => (
       <a
        key={item.name}
        href={item.href}
        className="text-sm/6 font-semibold text-white"
       >
        {item.name}
       </a>
      ))}
     </div>
     <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
    </nav>
    <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
     <div className="fixed inset-0 z-50" />
     <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
      <div className="flex items-center justify-between">
       <a href="#" className="-m-1.5 p-1.5">
        <span className="sr-only">Your Company</span>
        <img
         alt=""
         src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
         className="h-8 w-auto"
        />
       </a>
       <button
        type="button"
        onClick={() => setMobileMenuOpen(false)}
        className="-m-2.5 rounded-md p-2.5"
       >
        <span className="sr-only">Close menu</span>
        <X aria-hidden="true" className="size-6" />
       </button>
      </div>
      <div className="mt-6 flow-root">
       <div className="-my-6 divide-y divide-gray-500/25">
        <div className="space-y-2 py-6">
         {navigation.map((item) => (
          <a
           key={item.name}
           href={item.href}
           className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
          >
           {item.name}
          </a>
         ))}
        </div>
        <div className="py-6"></div>
       </div>
      </div>
     </DialogPanel>
    </Dialog>
   </header>

   <div className="relative isolate overflow-hidden pt-14">
    <img
     alt=""
     src="/assets/gym-bg.jpg"
     className="absolute inset-0 -z-10 size-full object-cover opacity-10"
    />
    <div
     aria-hidden="true"
     className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
    >
     <div
      style={{
       clipPath:
        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
      className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
     />
    </div>
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
     <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm/6 ring-1 ring-white/10 hover:ring-white/20">
         Announcing our next round of funding.{' '}
         <a href="#" className="font-semibold text-white">
          <span aria-hidden="true" className="absolute inset-0" />
          Read more <span aria-hidden="true">&rarr;</span>
         </a>
        </div>
       </div> */}
      <div className="text-center">
       <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
        Beautiful websites. Built for gyms.
       </h1>
       <p className="mt-8 text-pretty text-lg font-medium sm:text-xl/8">
        We design, build, and deliver your gym's perfect website so you can focus
        on what you do best.
       </p>
       <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
         href="https://calendly.com/hello-fitlo/30min"
         target="_blank"
         rel="noopener noreferrer"
         className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
         Free Call
        </a>
        <a href="#features" className="text-sm/6 font-semibold text-white">
         Learn more <span aria-hidden="true">→</span>
        </a>
       </div>
      </div>
     </div>
    </div>
    <div
     aria-hidden="true"
     className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
    >
     <div
      style={{
       clipPath:
        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
      className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
     />
    </div>
   </div>
  </div>
 )
}

export default Hero
