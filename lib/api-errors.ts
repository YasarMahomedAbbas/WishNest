import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Standard API error types
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

// Standard API error response interface
export interface ApiErrorResponse {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    details?: any
    timestamp: string
    path?: string
  }
}

// Standard API success response interface
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
}

// Custom API Error class
export class ApiError extends Error {
  public readonly code: ApiErrorCode
  public readonly statusCode: number
  public readonly details?: any

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Error factory functions
export const createValidationError = (message: string, details?: any) =>
  new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 400, details)

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new ApiError(ApiErrorCode.AUTHENTICATION_ERROR, message, 401)

export const createAuthorizationError = (message: string = 'Access denied') =>
  new ApiError(ApiErrorCode.AUTHORIZATION_ERROR, message, 403)

export const createNotFoundError = (resource: string = 'Resource') =>
  new ApiError(ApiErrorCode.NOT_FOUND, `${resource} not found`, 404)

export const createConflictError = (message: string) =>
  new ApiError(ApiErrorCode.CONFLICT, message, 409)

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new ApiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, message, 429)

export const createInternalServerError = (message: string = 'Internal server error') =>
  new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, message, 500)

export const createDatabaseError = (message: string = 'Database operation failed') =>
  new ApiError(ApiErrorCode.DATABASE_ERROR, message, 500)

// Error response formatter
export function formatErrorResponse(
  error: unknown,
  path?: string
): ApiErrorResponse {
  const timestamp = new Date().toISOString()

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp,
        path
      }
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        timestamp,
        path
      }
    }
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        return {
          success: false,
          error: {
            code: ApiErrorCode.CONFLICT,
            message: 'Unique constraint violation',
            details: prismaError.meta,
            timestamp,
            path
          }
        }
      case 'P2025':
        return {
          success: false,
          error: {
            code: ApiErrorCode.NOT_FOUND,
            message: 'Record not found',
            timestamp,
            path
          }
        }
      default:
        return {
          success: false,
          error: {
            code: ApiErrorCode.DATABASE_ERROR,
            message: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? prismaError : undefined,
            timestamp,
            path
          }
        }
    }
  }

  // Handle generic errors
  const genericError = error as Error
  return {
    success: false,
    error: {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: genericError?.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? genericError : undefined,
      timestamp,
      path
    }
  }
}

// Success response formatter
export function formatSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

// Next.js response helpers
export function errorResponse(error: unknown, status?: number, path?: string) {
  const errorRes = formatErrorResponse(error, path)
  const statusCode = error instanceof ApiError ? error.statusCode : (status || 500)
  
  return NextResponse.json(errorRes, { status: statusCode })
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(formatSuccessResponse(data), { status })
} 