import { useState, useEffect, useCallback } from 'react'

interface LinkPreviewData {
  imageUrl: string | null
  title: string | null
  description: string | null
  url: string
}

interface UseLinkPreviewReturn {
  data: LinkPreviewData | null
  isLoading: boolean
  error: string | null
  fetchPreview: () => Promise<void>
}

export function useLinkPreview(url: string | null): UseLinkPreviewReturn {
  const [data, setData] = useState<LinkPreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreview = useCallback(async () => {
    if (!url || url.trim() === '') {
      setData(null)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/link-preview?url=${encodeURIComponent(url)}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch link preview')
      }

      const result = await response.json()

      if (result.success && result.data) {
        setData(result.data)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [url])

  return {
    data,
    isLoading,
    error,
    fetchPreview,
  }
}
