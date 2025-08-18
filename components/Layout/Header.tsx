import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Modal from './Modal'
import { useApolloClient } from '@apollo/client'
import Avatar from './Avatar'
import clsx from 'clsx'
import { useUser } from '../../contexts/UserContext'
import { useLogoutMutation } from '../../src/generated/graphql'
import Image from 'next/image'

const Header = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<any>()
  const buttonRef = useRef<any>()
  const { user } = useUser()

  const [logout] = useLogoutMutation()
  const { setUser } = useUser()

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null) // Update the user context
      toggleDropdown()
      router.push('/') // Redirect to home page after logout
    } catch (error) {
      console.error('Failed to logout. Please try again.', error)
    }
  }

  const isHomePage = router.pathname === '/'
  const isExplorePage = router.pathname.startsWith('/explore')

  return (
    <header className="fixed top-0 z-50 w-full h-8">
      <div className="container mx-auto p-5 flex flex-row items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/favicon.ico"
              alt="Fitlo Logo"
              width={30}
              height={40}
              className="rounded-3xl"
            />
          </Link>

          {/* {!isExplorePage && (
            <Link href="/explore">
              <div
                className={clsx(
                  'hover:cursor-pointer hover:text-primary text-sm select-none items-center border-0 py-1 px-2 focus:outline-none rounded font-medium',
                  {
                    'text-white': isHomePage,
                    'text-foreground': !isHomePage,
                  },
                )}
              >
                Directory
              </div>
            </Link>
          )} */}
        </div>

        <nav
          className={clsx('flex flex-wrap items-center text-sm justify-end w-full', {
            'text-white': isHomePage,
            'text-foreground': !isHomePage,
          })}
        >
          {!user && (
            <Link href="/login">
              <div
                className={`hover:cursor-pointer hover:text-primary text-sm md:block hidden select-none items-center border-0 py-1 px-2 focus:outline-none rounded ${
                  router.pathname.startsWith('/login') ? 'font-semibold' : ''
                }`}
              >
                {'Sign In'}
              </div>
            </Link>
          )}

          {user && (
            <Link href="/manage">
              <div
                className={`hover:cursor-pointer md:block hover:text-primary hidden select-none items-center border-0 py-1 px-2 focus:outline-none rounded text-sm ${
                  router.pathname.startsWith('/manage') ? 'font-semibold' : ''
                }`}
              >
                Manage
              </div>
            </Link>
          )}

          {user && (
            <div ref={toggleRef} className="relative inline-block text-left">
              <button
                ref={buttonRef}
                onClick={toggleDropdown}
                type="button"
                className="inline-flex ml-3 justify-center items-center"
              >
                {user && <Avatar email={user.email} />}
              </button>
              {isOpen && (
                <Modal buttonRef={buttonRef} isOpen={isOpen} onClose={toggleDropdown}>
                  <div className="text-center">
                    <Link href="/create" onClick={toggleDropdown}>
                      <div className="md:hidden hover:cursor-pointer select-none block px-4 py-2 text-sm text-foreground hover:bg-card w-full">
                        Create
                      </div>
                    </Link>
                    <Link href="/manage" onClick={toggleDropdown}>
                      <div className="md:hidden hover:cursor-pointer select-none block px-4 py-2 text-sm text-foreground hover:bg-card w-full">
                        Manage
                      </div>
                    </Link>
                    <Link href="/profile" onClick={toggleDropdown}>
                      <div className="hover:cursor-pointer select-none block px-4 py-2 text-sm text-foreground hover:bg-card w-full">
                        Profile
                      </div>
                    </Link>
                    <Link href="/partners" onClick={toggleDropdown}>
                      <div className="hover:cursor-pointer select-none block px-4 py-2 text-sm text-foreground hover:bg-card w-full">
                        Partners
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hover:cursor-pointer select-none block px-4 py-2 text-sm text-gray-900 hover:bg-card w-full"
                    >
                      Logout
                    </button>
                  </div>
                </Modal>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
