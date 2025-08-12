"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Currency } from '@/lib/currency-utils'

interface Family {
  id: string
  name: string
  description: string | null
  inviteCode: string
  currency: Currency
  membershipRole: 'ADMIN' | 'MEMBER'
  membershipStatus: string
  createdAt: string
  updatedAt: string
  joinedAt: string
}

interface FamilyContextType {
  family: Family | null
  loading: boolean
  refreshFamily: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

interface FamilyProviderProps {
  children: ReactNode
}

export function FamilyProvider({ children }: FamilyProviderProps) {
  const { user } = useAuth()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFamily = async () => {
    if (!user) {
      setFamily(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/families/me')
      if (response.ok) {
        const data = await response.json()
        if (data.data.families && data.data.families.length > 0) {
          setFamily(data.data.families[0])
        } else {
          setFamily(null)
        }
      } else {
        setFamily(null)
      }
    } catch (error) {
      console.error('Failed to fetch family:', error)
      setFamily(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshFamily = async () => {
    await fetchFamily()
  }

  useEffect(() => {
    fetchFamily()
  }, [user])

  return (
    <FamilyContext.Provider value={{ family, loading, refreshFamily }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
} 