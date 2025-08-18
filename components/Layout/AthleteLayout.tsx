import React from 'react'
import AthleteHeader from './AthleteHeader'
import { Inter, Lexend } from 'next/font/google'
import clsx from 'clsx'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

const AthleteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={clsx(
        'relative min-h-screen bg-background text-foreground',
        inter.variable,
        lexend.variable,
      )}
    >
      <AthleteHeader />
      <main>{children}</main>
    </div>
  )
}

export default AthleteLayout
