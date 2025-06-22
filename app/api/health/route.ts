import { NextRequest } from 'next/server'
import { withMiddleware, RequestContext } from '@/lib/api-middleware'
import { successResponse } from '@/lib/api-errors'
import { db } from '@/lib/db'

// Health check endpoint
async function healthHandler(request: NextRequest, context: RequestContext) {
  const startTime = Date.now()
  
  // Check database connectivity
  let dbStatus = 'unknown'
  let dbLatency = 0
  
  try {
    const dbStartTime = Date.now()
    await db.$queryRaw`SELECT 1`
    dbLatency = Date.now() - dbStartTime
    dbStatus = 'healthy'
  } catch (error) {
    dbStatus = 'unhealthy'
    console.error('Database health check failed:', error)
  }
  
  const totalLatency = Date.now() - startTime
  
  const healthData = {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latency: `${dbLatency}ms`
    },
    api: {
      latency: `${totalLatency}ms`
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }
  }
  
  // Return 503 if database is unhealthy
  const status = dbStatus === 'healthy' ? 200 : 503
  
  return successResponse(healthData, status)
}

// Export handlers for different HTTP methods
export const GET = withMiddleware(healthHandler, {
  allowedMethods: ['GET'],
  skipRateLimit: true, // Health checks shouldn't be rate limited
  requireAuth: false
}) 