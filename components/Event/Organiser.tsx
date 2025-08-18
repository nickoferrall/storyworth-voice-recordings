import React, { useId } from 'react'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { Mail } from 'lucide-react'
import OptimizedImage from '../OptimizedImage'
import { GetCompetitionByIdQuery } from '../../src/generated/graphql'

interface OrganiserProps {
  competition: GetCompetitionByIdQuery['getCompetitionById']
}

const Organiser: React.FC<OrganiserProps> = ({ competition }) => {
  const comp = competition
  const org = comp?.org ?? {
    name: 'example org',
    image: '',
    logo: '',
    email: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
  }

  const organizerName = comp?.orgName || org.name
  const gradientId = useId()

  return (
    <div className="flex-col items-start mb-4 w-full space-y-1 text-white">
      {/* Image: show competition logo */}
      {comp?.logo && (
        <div className="hidden md:block relative w-full aspect-square md:aspect-square rounded-xl overflow-hidden">
          <OptimizedImage
            src={comp.logo}
            alt="Event Logo"
            fill
            className="transition-transform duration-300 group-hover:scale-105 object-cover object-center bg-white"
            sizes="(min-width: 768px) 20vw, 0px"
          />
        </div>
      )}

      {/* Only show organizer info if there's actual org data */}
      {(comp?.org || comp?.orgName) && (
        <div className="flex items-start pt-4">
          <div className="flex flex-col justify-start">
            <p className="text-sm text-white">Organised By</p>
            <div className="flex items-center mb-2">
              <p className="text-md text-white">{organizerName}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <div className="flex items-center space-x-4 mb-2">
          {org.instagram && (
            <a
              href={org.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'unset' }}
              className=""
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', color: 'unset' }}
                className=""
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f58529" />
                    <stop offset="50%" stopColor="#dd2a7b" />
                    <stop offset="100%" stopColor="#515bd4" />
                  </linearGradient>
                </defs>
                <path
                  d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3.25A5.25 5.25 0 1 1 6.75 12 5.25 5.25 0 0 1 12 6.75Zm0 1.5A3.75 3.75 0 1 0 15.75 12 3.75 3.75 0 0 0 12 8.25Zm5.25-.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
                  fill={`url(#${gradientId})`}
                />
              </svg>
            </a>
          )}
          {comp?.org?.email && (
            <a
              href={`mailto:${comp.org.email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail style={{ width: 22, height: 22, color: '#3f729b' }} />
            </a>
          )}
          {org.facebook && (
            <a href={org.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook style={{ fontSize: 24, color: '#3b5998' }} />
            </a>
          )}
          {org.twitter && (
            <a href={org.twitter} target="_blank" rel="noopener noreferrer">
              <Twitter style={{ fontSize: 24, color: '#1da1f2' }} />
            </a>
          )}
          {org.youtube && (
            <a href={org.youtube} target="_blank" rel="noopener noreferrer">
              <Youtube className="w-6 h-6 text-[#ff0000]" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default Organiser
