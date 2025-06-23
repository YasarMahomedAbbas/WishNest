"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import {
  Users,
  UserPlus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface FamilyPreview {
  id: string
  name: string
  description: string | null
  createdAt: string
  memberCount: number
  isAtMemberLimit: boolean
}

interface CurrentMembership {
  role: 'ADMIN' | 'MEMBER'
  status: string
  joinedAt: string
}

function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [familyPreview, setFamilyPreview] = useState<FamilyPreview | null>(null)
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteCode = params.code as string

  useEffect(() => {
    if (inviteCode) {
      fetchFamilyPreview()
    }
  }, [inviteCode])

  const fetchFamilyPreview = async () => {
    try {
      const response = await fetch(`/api/families/invite/${inviteCode}`)
      const data = await response.json()
      
      if (data.success) {
        setFamilyPreview(data.data.family)
        setCurrentMembership(data.data.currentMembership)
      } else {
        setError(data.error?.message || 'Invalid invite code')
      }
    } catch (error) {
      setError('Failed to load family information')
    } finally {
      setLoading(false)
    }
  }

  const joinFamily = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setJoining(true)
    try {
      const response = await fetch('/api/families/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: `You have joined ${data.data.family.name}!`
        })
        router.push('/families')
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to join family',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join family',
        variant: 'destructive'
      })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading family information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 rounded-2xl shadow-lg border border-slate-200">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Invalid Invite</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!familyPreview) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <Card className="max-w-lg w-full mx-4 rounded-2xl shadow-lg border border-slate-200">
        <CardHeader className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">You're Invited!</CardTitle>
          <CardDescription className="text-slate-600">
            Join the family group to share wishlists and coordinate gifts
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Family Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">{familyPreview.name}</h3>
            {familyPreview.description && (
              <p className="text-slate-600">{familyPreview.description}</p>
            )}
          </div>

          {/* Family Stats */}
          <div className="flex justify-between items-center py-4 border-t border-b border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{familyPreview.memberCount}</div>
              <div className="text-sm text-slate-600">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {new Date(familyPreview.createdAt).getFullYear()}
              </div>
              <div className="text-sm text-slate-600">Created</div>
            </div>
          </div>

          {/* Current Status */}
          {currentMembership ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 font-medium">You're already a member!</span>
              </div>
              <Badge variant={currentMembership.role === 'ADMIN' ? 'default' : 'secondary'} className="rounded-xl">
                {currentMembership.role}
              </Badge>
              <p className="text-sm text-slate-600">
                Joined on {new Date(currentMembership.joinedAt).toLocaleDateString()}
              </p>
              <Button 
                onClick={() => router.push('/families')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                Go to Family Management
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : familyPreview.isAtMemberLimit ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-orange-700 font-medium">Family is full</span>
              </div>
              <p className="text-slate-600">
                This family has reached the maximum of 20 members.
              </p>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full border-slate-300 rounded-xl hover:bg-slate-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          ) : !user ? (
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                You need to sign in to join this family.
              </p>
              <Button 
                onClick={() => router.push('/auth')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                Sign In to Join
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Join this family to start sharing wishlists and coordinating gifts together.
              </p>
              <Button 
                onClick={joinFamily}
                disabled={joining}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Family
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Invite Code Display */}
          <div className="text-center text-sm text-slate-500 border-t border-slate-200 pt-4">
            Invite Code: <code className="font-mono bg-slate-100 px-2 py-1 rounded-xl">{inviteCode}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InvitePage 