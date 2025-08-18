import React, { useState } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  width?: number
  height?: number
  priority?: boolean
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fill,
  className,
  sizes,
  width,
  height,
  priority,
}) => {
  const [imageError, setImageError] = useState(false)

  // Debug logging for production issue
  React.useEffect(() => {
    console.log('🖼️ OptimizedImage mounted:', {
      src,
      alt,
      isCloudinary: src?.includes('res.cloudinary.com'),
      hasExtension: /\.(jpg|jpeg|png|webp|avif)$/i.test(src || ''),
    })
  }, [src, alt])

  // Check if the image is from a known problematic domain
  const isProblematicDomain =
    src &&
    (src.includes('competitioncorner.net') ||
      src.includes('null') ||
      !src.startsWith('http'))

  // Show placeholder for problematic images or error cases
  if (imageError || isProblematicDomain) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
        style={
          fill
            ? { width: '100%', height: '100%' }
            : { width: width || 300, height: height || 200 }
        }
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-400"
        >
          <path
            fill="currentColor"
            d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          />
        </svg>
      </div>
    )
  }

  const handleError = () => {
    console.log('❌ Image failed to load:', src)
    console.log('Event:', alt)
    setImageError(true)
  }

  // For Cloudinary images, bypass Next.js optimization since Cloudinary provides its own
  const isCloudinaryImage = src?.includes('res.cloudinary.com')

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      width={width}
      height={height}
      priority={priority}
      onError={handleError}
      unoptimized={isCloudinaryImage}
    />
  )
}

export default OptimizedImage
