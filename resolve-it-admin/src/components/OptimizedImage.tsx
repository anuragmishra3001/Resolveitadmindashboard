import { useState, useCallback, memo } from 'react'
import { Image as ImageIcon } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  onError?: () => void
  onLoad?: () => void
  lazy?: boolean
  placeholder?: string
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onError,
  onLoad,
  lazy = true,
  placeholder
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder || src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  const handleImageLoad = useCallback(() => {
    if (placeholder && imageSrc === placeholder) {
      setImageSrc(src)
    }
  }, [placeholder, imageSrc, src])

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${fallbackClassName}`}>
        <ImageIcon className="h-6 w-6 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoadStart={handleImageLoad}
      />
    </div>
  )
})

// Lazy image component with intersection observer
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onError,
  onLoad,
  placeholder
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(node)
    }
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${fallbackClassName}`}>
        <ImageIcon className="h-6 w-6 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={imgRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {!isInView && placeholder && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  )
})
