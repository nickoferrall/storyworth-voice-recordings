import React from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import withAuth from '../utils/withAuth'
import { Context } from '@apollo/client'
import { useUser } from '../contexts/UserContext'
import NoHeaderLayout from '../components/Layout/NoHeaderLayout'
import Link from 'next/link'
import { Button } from '../src/components/ui/button'
import dayjs from 'dayjs'
import Image from 'next/image'

export const getServerSideProps = withAuth(async function (context: Context) {
  return {
    props: { user: context.user },
  }
}, false)

type Props = {
  user: any | null
}

const comps = [
  {
    id: '3YYbHF',
    name: "Playoffs 500 London Shepherd's Bush",
    date: '2025-09-06',
    city: 'London',
    country: 'UK',
  },
  {
    id: 'XCdOCc',
    name: 'Playoffs 500 London Brixton',
    date: '2025-10-04',
    city: 'London',
    country: 'UK',
  },
  // {
  //   id: 'iv1ZVN',
  //   name: 'Playoffs 500 Amsterdam',
  //   date: '2025-09-12',
  //   city: 'Amsterdam',
  //   country: 'Netherlands',
  // },
  {
    id: '461J8R',
    name: 'Playoffs 500 Cambridge',
    date: '2025-09-20',
    city: 'Cambridge',
    country: 'UK',
  },
  {
    id: '7vcIPm',
    name: 'Playoffs 500 Edinburgh',
    date: '2025-10-04',
    city: 'Edinburgh',
    country: 'UK',
  },
  {
    id: 'gg1r2d',
    name: 'Playoffs 500 Dublin',
    date: '2025-08-16',
    city: 'Dublin',
    country: 'Ireland',
  },
]

const Playoffs500Page = (props: Props) => {
  const { user: dbUser } = props
  const { setUser } = useUser()

  React.useEffect(() => {
    if (dbUser) {
      setUser(dbUser)
    }
  }, [dbUser])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mt-6 mb-6 text-foreground">
            F45 Playoffs 500
          </h1>
          <p className="text-lg max-w-4xl mx-auto mb-4 text-muted-foreground">
            The F45 Playoffs Roadshow is hitting five locations across Europe! Bring your
            community together and lock in your spot for a chance to climb the leaderboard
            and win epic prizes 🙌
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {comps
            .slice()
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((comp) => (
              <div
                key={comp.id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-300"
              >
                <div className="md:flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-1/2 h-80 md:h-full relative">
                    <Image
                      src="/assets/fort-playoffs-large.png"
                      alt="F45 Playoffs 500"
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 w-full md:w-1/2 flex flex-col md:h-full">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">
                        {comp.name}
                      </h2>
                      <div className="flex items-center mb-3">
                        <Calendar className="text-primary mr-3 w-5 h-5" />
                        <div>
                          <p className="text-muted-foreground">
                            {dayjs(comp.date).format('MMMM D, YYYY')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <MapPin className="text-primary mr-3 w-5 h-5" />
                        <div>
                          <p className="text-muted-foreground">
                            {comp.city}, {comp.country}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="md:mt-auto">
                      <Link href={`https://fitlo.co/event/${comp.id}`} passHref>
                        <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

Playoffs500Page.layout = NoHeaderLayout
export default Playoffs500Page
