import { NextRequest } from 'next/server'
import { withMiddleware } from '@/lib/api-middleware'
import { createSuccessResponse, createValidationError } from '@/lib/api-errors'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getValidatedBody } from '@/lib/api-middleware'
import { createUser, addUserToFamily } from '@/lib/user-service'

const createMemberSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
})



export const POST = withMiddleware(async (request: NextRequest, { user }) => {
  if (!user) {
    throw createValidationError('Authentication required')
  }

  const body = await getValidatedBody(request, createMemberSchema)
  const { familyId, name, email, password } = body

  // Check if user is admin of this family
  const membership = await db.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId: user.id,
        familyId
      }
    }
  })

  if (!membership || membership.role !== 'ADMIN') {
    throw createValidationError('Only family admins can add new members')
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Add existing user to family using shared utility
    await addUserToFamily(existingUser.id, familyId, 'MEMBER')

    return createSuccessResponse({
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email
      },
      message: 'Existing user added to family'
    })
  }

  // Create new user using shared utility
  const newUser = await createUser({
    email,
    name,
    password,
    skipEmailValidation: true // Allow simpler validation for family member creation
  })

  // Add to family using shared utility  
  await addUserToFamily(newUser.id, familyId, 'MEMBER')

  return createSuccessResponse({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    },
    message: 'New user created and added to family'
  })
}, {
  allowedMethods: ['POST']
}) 