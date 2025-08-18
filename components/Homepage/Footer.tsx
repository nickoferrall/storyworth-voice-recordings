import React from 'react'
import Link from 'next/link'

import { Container } from './Container'
import { Logo } from './Logo'
import { NavLink } from './NavLink'

export default function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container>
        <div className="py-16">
          <Logo className="mx-auto h-10 w-auto" />
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#features">Features</NavLink>
              <div className="hidden sm:block">
                <NavLink href="#testimonials">Testimonials</NavLink>
              </div>
              <div className="hidden sm:block">
                <NavLink href="#pricing">Pricing</NavLink>
              </div>
              <NavLink href="/blog">Blog</NavLink>
              {/* <NavLink href="/explore">Directory</NavLink> */}
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-200 py-6 sm:py-10 sm:flex-row-reverse sm:justify-between">
          <p className="text-sm text-slate-500 order-2 sm:order-1 sm:mt-0">
            hello@fitlo.co
          </p>
          <p className="mt-4 text-sm text-slate-500 text-center order-1 sm:order-2 sm:mt-0">
            Copyright &copy; {new Date().getFullYear()} fitlo. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
