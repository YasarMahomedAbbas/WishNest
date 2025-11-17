import { NextRequest, NextResponse } from 'next/server'
import ogs from 'open-graph-scraper'

/**
 * Validates if a URL is safe to fetch
 * - Must be HTTPS
 * - Must not be localhost or private IP addresses
 */
function isValidUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed' }
    }

    const hostname = parsed.hostname.toLowerCase()

    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return { valid: false, error: 'Localhost URLs are not allowed' }
    }

    // Block private IP ranges
    // 192.168.x.x
    if (hostname.startsWith('192.168.')) {
      return { valid: false, error: 'Private IP addresses are not allowed' }
    }

    // 10.x.x.x
    if (hostname.startsWith('10.')) {
      return { valid: false, error: 'Private IP addresses are not allowed' }
    }

    // 172.16.x.x - 172.31.x.x
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) {
      return { valid: false, error: 'Private IP addresses are not allowed' }
    }

    // Block IPv6 localhost
    if (hostname === '::1' || hostname === '0:0:0:0:0:0:0:1') {
      return { valid: false, error: 'Localhost URLs are not allowed' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL
    const validation = isValidUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Fetch Open Graph data
    const options = {
      url,
      timeout: 10000, // 10 second timeout
      fetchOptions: {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      },
    }

    const { error, result } = await ogs(options)

    if (error) {
      console.error('OGS error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch link preview' },
        { status: 500 }
      )
    }

    // Extract relevant data
    const imageUrl = result.ogImage?.[0]?.url ||
                     result.twitterImage?.[0]?.url ||
                     null

    const title = result.ogTitle ||
                  result.twitterTitle ||
                  result.dcTitle ||
                  null

    const description = result.ogDescription ||
                       result.twitterDescription ||
                       result.dcDescription ||
                       null

    // Return normalized data
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        title,
        description,
        url: result.ogUrl || url,
      }
    })

  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the link preview' },
      { status: 500 }
    )
  }
}
