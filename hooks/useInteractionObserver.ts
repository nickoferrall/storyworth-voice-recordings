import { RefObject, useEffect, useState } from 'react'

export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options: IntersectionObserverInit = { threshold: 0.1 },
): boolean => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])

  return isVisible
}
