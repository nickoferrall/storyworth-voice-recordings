import React from 'react'
import { Calendar, MapPin, Trophy, Users } from 'lucide-react'
import NoHeaderLayout from '../components/Layout/NoHeaderLayout'
import Link from 'next/link'
import { Button } from '../src/components/ui/button'
import dayjs from 'dayjs'
import Image from 'next/image'

const comps = [
  {
    id: 'crossfit',
    title: 'FORT FEST 2025 - CrossFit competition entry',
    date: '2025-07-26',
    location: 'London, United Kingdom',
    type: 'CrossFit Competition',
    description:
      'Welcome to the festival of CrossFit, Powerlifting and a celebration of the FORT and extended fitness community spirit! Expect - CrossFit comp and prizes, Powerlifting comp and prizes, food, drink, music and more.',
    image: '/assets/fort-crossfit.png',
    eventId: 'p4hLBs',
  },
  {
    id: 'powerlifting',
    title: 'FORT FEST 2025 - Powerlifting competition entry',
    date: '2025-07-26',
    location: 'London, United Kingdom',
    type: 'Powerlifting Competition',
    description:
      'Welcome to the festival of CrossFit, Powerlifting and a celebration of the FORT and extended fitness community spirit! Expect - CrossFit comp and prizes, Powerlifting comp and prizes, food, drink, music and more.',
    image: '/assets/fort-powerlifting.png',
    eventId: 'IkmTl8',
  },
]

const FortFestPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mt-6 mb-6">Fort Fest 2025</h1>
          <p className="text-lg max-w-4xl mx-auto mb-4">
            Join us for the third year of our epic FORT FEST! This year we are running 2
            competitions under 1 roof. We have our Team CrossFit competition AND this year
            we have added a Team SBD throwdown. Powerlifters. Crossfitters. Weightlifters
            at the ready.
          </p>
          <p className="text-lg max-w-4xl mx-auto mb-4">
            Choose your comp…Pick your team…And get ready for the biggest in house
            throwdown in London!
          </p>
        </div>
        <div className="flex flex-col gap-16">
          {comps.map((comp, idx) => (
            <div
              key={comp.id}
              className={`bg-card border border-border rounded-xl overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col md:flex-row${idx % 2 === 1 ? ' md:flex-row-reverse' : ''}`}
            >
              <div className="md:w-2/5 relative h-80 md:h-auto">
                <Image
                  src={comp.image}
                  alt={comp.title}
                  layout="fill"
                  objectFit="cover"
                  priority={idx === 0}
                />
              </div>
              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">{comp.title}</h2>
                <div className="flex items-center mb-4">
                  <Calendar className="text-primary mr-3 w-5 h-5" />
                  <div>
                    <p>{dayjs(comp.date).format('MMMM D, YYYY')}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <MapPin className="text-primary mr-3 w-5 h-5" />
                  <div>
                    <p>{comp.location}</p>
                  </div>
                </div>
                <div className="flex items-center mb-6">
                  <Users className="text-primary mr-3 w-5 h-5" />
                  <div>
                    <p>{comp.type}</p>
                  </div>
                </div>
                <div className="mb-6 h-6" />
                <Link href={`https://fitlo.co/event/${comp.eventId}`} passHref>
                  <Button
                    className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold`}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

FortFestPage.layout = NoHeaderLayout
export default FortFestPage
