import React from 'react'

export function Logo(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 109 40" {...props}>
      {/* Define a circular clip path */}
      <defs>
        <clipPath id="circleClip">
          <circle cx="54.5" cy="20" r="17.5" />
        </clipPath>
      </defs>

      {/* Favicon with circular clip path applied */}
      <image
        href="/favicon.ico"
        width="35"
        height="35"
        x="37"
        y="2.5"
        clipPath="url(#circleClip)"
      />
    </svg>
  )
}
