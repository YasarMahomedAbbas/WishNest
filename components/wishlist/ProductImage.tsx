"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductImageProps {
  src: string | null
  alt: string
  className?: string
  priority?: boolean
}

export function ProductImage({ src, alt, className = "", priority = false }: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // If no src or error occurred, show placeholder
  if (!src || hasError) {
    return (
      <div className={`relative bg-muted flex items-center justify-center ${className}`}>
        <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
