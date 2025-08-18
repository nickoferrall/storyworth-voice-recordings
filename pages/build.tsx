'use client'

import { useState } from 'react'
import BuildLayout from '../components/Layout/BuildLayout'
import Hero from '../components/Build/Hero'
import Features from '../components/Build/Features'
import Support from '../components/Build/Support'
import Pricing from '../components/Build/Pricing'
import Testimonial from '../components/Build/Testimonial'
import Footer from '../components/Build/Footer'
import Contact from '../components/Build/Contact'

export default function Build() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div>
      <Hero />
      <Features />
      <Support />
      <Testimonial />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  )
}

Build.layout = BuildLayout
