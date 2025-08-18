import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '../components/Homepage/Hero'
import { Header } from '../components/Homepage/Header'
import Head from 'next/head'
import Meta from '../components/Layout/meta'

const PrimaryFeatures = dynamic(
  () => import('../components/Homepage/PrimaryFeatures'),
) as React.ComponentType
const SecondaryFeatures = dynamic(
  () => import('../components/Homepage/SecondaryFeatures'),
  { ssr: false },
) as React.ComponentType
const CallToAction = dynamic(() => import('../components/Homepage/CallToAction'), {
  ssr: false,
}) as React.ComponentType
const Testimonials = dynamic(() => import('../components/Homepage/Testimonials'), {
  ssr: false,
}) as React.ComponentType
const Pricing = dynamic(() => import('../components/Homepage/Pricing'), {
  ssr: false,
}) as React.ComponentType
const Faqs = dynamic(() => import('../components/Homepage/Faqs'), {
  ssr: false,
}) as React.ComponentType
const Footer = dynamic(() => import('../components/Homepage/Footer'), {
  ssr: false,
}) as React.ComponentType

export default function HomePage() {
  useEffect(() => {
    document.body.setAttribute('data-page', 'homepage')
    return () => {
      document.body.removeAttribute('data-page')
    }
  }, [])

  return (
    <>
      <Meta
        title="Fitlo – HYROX Simulation, CrossFit, & Functional Fitness Competition Software"
        description="Organize HYROX simulations, CrossFit, and functional fitness competitions. Manage tickets, heats, leaderboards, emails, and payments in one place."
        canonical="https://fitlo.co/"
      />
      <Head>
        <style>{`
          /* Force homepage to use light theme */
          body[data-page="homepage"] {
            background-color: white !important;
            color: #111827 !important;
          }

          /* Override all text colors on homepage */
          body[data-page="homepage"] * {
            color: inherit !important;
          }

          /* Specific text color overrides for homepage */
          body[data-page="homepage"] .text-slate-900 {
            color: #0f172a !important;
          }

          body[data-page="homepage"] .text-slate-700 {
            color: #334155 !important;
          }

          body[data-page="homepage"] .text-slate-600 {
            color: #475569 !important;
          }

          body[data-page="homepage"] .text-slate-500 {
            color: #64748b !important;
          }

          body[data-page="homepage"] .text-slate-400 {
            color: #94a3b8 !important;
          }

          body[data-page="homepage"] .text-slate-300 {
            color: #cbd5e1 !important;
          }

          body[data-page="homepage"] .text-slate-200 {
            color: #e2e8f0 !important;
          }

          body[data-page="homepage"] .text-slate-100 {
            color: #f1f5f9 !important;
          }

          body[data-page="homepage"] .text-slate-50 {
            color: #f8fafc !important;
          }

          body[data-page="homepage"] .text-white {
            color: white !important;
          }

          body[data-page="homepage"] .text-blue-600 {
            color: #2563eb !important;
          }

          body[data-page="homepage"] .text-blue-100 {
            color: #dbeafe !important;
          }

          body[data-page="homepage"] .text-blue-300 {
            color: #93c5fd !important;
          }

          /* Background color overrides */
          body[data-page="homepage"] .bg-white {
            background-color: white !important;
          }

          body[data-page="homepage"] .bg-slate-50 {
            background-color: #f8fafc !important;
          }

          body[data-page="homepage"] .bg-slate-900 {
            background-color: #0f172a !important;
          }

          body[data-page="homepage"] .bg-blue-600 {
            background-color: #2563eb !important;
          }

          /* Button hover states */
          body[data-page="homepage"] .hover\\:text-slate-900:hover {
            color: #0f172a !important;
          }

          body[data-page="homepage"] .hover\\:text-slate-700:hover {
            color: #334155 !important;
          }

          body[data-page="homepage"] .hover\\:bg-slate-100:hover {
            background-color: #f1f5f9 !important;
          }

          body[data-page="homepage"] .hover\\:bg-slate-700:hover {
            background-color: #334155 !important;
          }

          body[data-page="homepage"] .hover\\:bg-blue-500:hover {
            background-color: #3b82f6 !important;
          }

          /* Ring colors */
          body[data-page="homepage"] .ring-slate-200 {
            --tw-ring-color: #e2e8f0 !important;
          }

          body[data-page="homepage"] .ring-slate-300 {
            --tw-ring-color: #cbd5e1 !important;
          }

          body[data-page="homepage"] .hover\\:ring-slate-300:hover {
            --tw-ring-color: #cbd5e1 !important;
          }

          /* Border colors */
          body[data-page="homepage"] .border-slate-200 {
            border-color: #e2e8f0 !important;
          }

          body[data-page="homepage"] .border-slate-300 {
            border-color: #cbd5e1 !important;
          }

          /* Focus states */
          body[data-page="homepage"] .focus-visible\\:outline-slate-900:focus-visible {
            outline-color: #0f172a !important;
          }

          body[data-page="homepage"] .focus-visible\\:outline-blue-600:focus-visible {
            outline-color: #2563eb !important;
          }

          /* Active states */
          body[data-page="homepage"] .active\\:bg-slate-800:active {
            background-color: #1e293b !important;
          }

          body[data-page="homepage"] .active\\:bg-blue-800:active {
            background-color: #1d4ed8 !important;
          }

          body[data-page="homepage"] .active\\:text-slate-300:active {
            color: #cbd5e1 !important;
          }

          body[data-page="homepage"] .active\\:text-blue-100:active {
            color: #dbeafe !important;
          }

          /* Footer specific overrides */
          body[data-page="homepage"] footer {
            background-color: white !important;
            color: #111827 !important;
          }

          body[data-page="homepage"] footer * {
            color: inherit !important;
          }

          body[data-page="homepage"] footer .text-slate-500 {
            color: #64748b !important;
          }

          body[data-page="homepage"] footer .border-slate-200 {
            border-color: #e2e8f0 !important;
          }

          /* Import the homepage-specific Tailwind CSS */
          @import url('../styles/home-tailwind.css');
        `}</style>
      </Head>
      <div data-page="homepage">
        <Header />
        <main>
          <Hero />
          <PrimaryFeatures />
          <SecondaryFeatures />
          <CallToAction />
          <Testimonials />
          <Pricing />
          <Faqs />
        </main>
        <Footer />
      </div>
    </>
  )
}
