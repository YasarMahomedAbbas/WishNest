import { NextRequest } from 'next/server'
import { withMiddleware, getValidatedBody } from '@/lib/api-middleware'
import { createSuccessResponse, createNotFoundError, createValidationError } from '@/lib/api-errors'
import { z } from 'zod'
import { updateFamilyCurrency } from '@/lib/family-service'

// Validation schema for currency update
const currencyUpdateSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'GBP'], {
    required_error: 'Currency is required',
    invalid_type_error: 'Currency must be USD, EUR, or GBP'
  })
})

export const PUT = withMiddleware(async (request, { user, params }) => {
  // 1. Parameter validation
  const resolvedParams = await params
  const familyId = resolvedParams?.id
  
  if (!familyId) {
    throw createValidationError('Family ID is required')
  }
  
  // 2. Authentication check
  if (!user) {
    throw new Error('Authentication required')
  }
  
  // 3. Input validation
  const body = await getValidatedBody(request, currencyUpdateSchema)
  
  try {
    // 4. Update family currency (service will check admin permissions)
    const updatedFamily = await updateFamilyCurrency(familyId, user.id, body.currency)
    
    if (!updatedFamily) {
      throw createNotFoundError('Family')
    }
    
    // 5. Return success response
    return createSuccessResponse({
      family: {
        id: updatedFamily.id,
        name: updatedFamily.name,
        currency: updatedFamily.currency
      },
      message: `Family currency updated to ${body.currency}`
    })
    
  } catch (error) {
    console.error('Currency update error:', error)
    throw error
  }
}, {
  requireAuth: true,
  allowedMethods: ['PUT']
})