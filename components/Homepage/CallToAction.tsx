import Image from 'next/image'

import { Button } from './Button'
import { Container } from './Container'
import backgroundImage from '../../public/assets/background-call-to-action.jpg'

export default function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Create your own competition in seconds.
          </p>
          <Button href="/create" color="white" className="mt-10">
            Get Started
          </Button>
        </div>
      </Container>
    </section>
  )
}
