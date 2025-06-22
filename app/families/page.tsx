"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Settings,
  Share2,
  UserPlus,
  Crown,
  Copy,
  RefreshCw,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth, withAuth } from '@/contexts/AuthContext'

interface Family {
  id: string
  name: string
  description: string | null
  inviteCode: string
  membershipRole: 'ADMIN' | 'MEMBER'
  membershipStatus: string
  joinedAt: string
  createdAt: string
  updatedAt: string
  members?: FamilyMember[]
}

interface FamilyMember {
  id: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  status: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

function FamiliesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newFamily, setNewFamily] = useState({ name: '', description: '' })
  const [inviteInfo, setInviteInfo] = useState<any>(null)

  useEffect(() => {
    fetchFamily()
  }, [])

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/families/me?includeMembers=true')
      const data = await response.json()
      
      if (data.success) {
        // Only show the first family (single family mode)
        const userFamily = data.data.families.length > 0 ? data.data.families[0] : null
        setFamily(userFamily)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load family',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load family',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createFamily = async () => {
    if (!newFamily.name.trim()) {
      toast({
        title: 'Error',
        description: 'Family name is required',
        variant: 'destructive'
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFamily)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Family created successfully!'
        })
        setNewFamily({ name: '', description: '' })
        fetchFamily()
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to create family',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create family',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getInviteInfo = async (familyId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/invite`)
      const data = await response.json()
      
      if (data.success) {
        setInviteInfo(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get invite information',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get invite information',
        variant: 'destructive'
      })
    }
  }

  const regenerateInviteCode = async (familyId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/regenerate-invite`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Invite code regenerated successfully!'
        })
        fetchFamily()
        if (inviteInfo && inviteInfo.family.id === familyId) {
          getInviteInfo(familyId)
        }
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to regenerate invite code',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate invite code',
        variant: 'destructive'
      })
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Copied!',
      description: 'Invite code copied to clipboard'
    })
  }

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: 'Copied!',
      description: 'Invite link copied to clipboard'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">Loading families...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wishlist
            </Button>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Family</h1>
              <p className="text-sm text-slate-600">Manage your family group and invite members</p>
            </div>
          </div>
          
          {!family && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create My Family
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">Create Your Family</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Create your family group to share wishlists with your loved ones.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">Family Name</Label>
                  <Input
                    id="name"
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    placeholder="e.g., Smith Family"
                    className="mt-1 border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newFamily.description}
                    onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
                    placeholder="A brief description of your family group"
                    className="mt-1 border-slate-300 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={createFamily} 
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                >
                  {isCreating ? 'Creating...' : 'Create My Family'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Family Details or Create Family */}
        {!family ? (
          <Card className="text-center py-12 rounded-2xl shadow-lg border border-slate-200">
            <CardContent>
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No family yet</h3>
              <p className="text-slate-600 mb-4">Create your family to start sharing wishlists with your loved ones</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Family Overview Card */}
            <Card className="rounded-2xl shadow-lg border border-slate-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900 text-2xl">
                      {family.name}
                      {family.membershipRole === 'ADMIN' && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-base mt-1">
                      {family.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={family.membershipRole === 'ADMIN' ? 'default' : 'secondary'} className="rounded-xl">
                    {family.membershipRole}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {family.members?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {new Date(family.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-600">Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {new Date(family.joinedAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-600">You Joined</div>
                  </div>
                </div>
                
                {family.membershipRole === 'ADMIN' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                          onClick={() => getInviteInfo(family.id)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-slate-800">Share Family Invite</DialogTitle>
                          <DialogDescription className="text-slate-600">
                            Share the invite code or link with family members to let them join.
                          </DialogDescription>
                        </DialogHeader>
                        {inviteInfo && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-slate-700 font-medium">Invite Code</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  value={inviteInfo.family.inviteCode}
                                  readOnly
                                  className="font-mono border-slate-300 rounded-xl"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyInviteCode(inviteInfo.family.inviteCode)}
                                  className="border-slate-300 rounded-xl hover:bg-slate-50"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-slate-700 font-medium">Invite Link</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  value={inviteInfo.inviteLink}
                                  readOnly
                                  className="text-sm border-slate-300 rounded-xl"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyInviteLink(inviteInfo.inviteLink)}
                                  className="border-slate-300 rounded-xl hover:bg-slate-50"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                              <span className="text-sm text-slate-600">
                                {inviteInfo.family.memberCount} / 20 members
                              </span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-slate-300 rounded-xl hover:bg-slate-50">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Regenerate Code
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Regenerate Invite Code</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will create a new invite code and invalidate the current one. 
                                      Existing members will not be affected.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => regenerateInviteCode(family.id)}
                                    >
                                      Regenerate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/families/${family.id}`)}
                      className="border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="rounded-2xl shadow-lg border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Family Members</CardTitle>
                <CardDescription className="text-slate-600">
                  Everyone who's part of your family group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {family.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{member.user.name}</div>
                          <div className="text-sm text-slate-600">{member.user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="rounded-xl">
                          {member.role}
                        </Badge>
                        {member.role === 'ADMIN' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(FamiliesPage) 