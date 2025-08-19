import React from 'react'

type Props = {
  className?: string
}

export default function Equalizer({ className }: Props) {
  const bars = [0, 1, 2, 3, 4]
  return (
    <div className={className || ''} aria-label="Audio playing">
      <div className="flex items-end gap-[3px] h-6" aria-hidden>
        {bars.map((i) => (
          <span
            key={i}
            className={`block w-[3px] bg-emerald-500 rounded-sm eq-bar eq-bar-${i}`}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes eq-bounce {
          0%,
          100% {
            height: 4px;
            opacity: 0.8;
          }
          50% {
            height: 24px;
            opacity: 1;
          }
        }
        .eq-bar {
          animation: eq-bounce 1s infinite ease-in-out;
        }
        .eq-bar-0 {
          animation-delay: 0ms;
        }
        .eq-bar-1 {
          animation-delay: 150ms;
        }
        .eq-bar-2 {
          animation-delay: 300ms;
        }
        .eq-bar-3 {
          animation-delay: 450ms;
        }
        .eq-bar-4 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  )
}
