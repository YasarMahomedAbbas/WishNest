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
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newFamily, setNewFamily] = useState({ name: '', description: '' })
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [inviteInfo, setInviteInfo] = useState<any>(null)

  useEffect(() => {
    fetchFamilies()
  }, [])

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families/me?includeMembers=true')
      const data = await response.json()
      
      if (data.success) {
        setFamilies(data.data.families)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load families',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load families',
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
        fetchFamilies()
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
        fetchFamilies()
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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Management</h1>
              <p className="text-sm text-gray-600">Manage your family groups and invite members</p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Family</DialogTitle>
                <DialogDescription>
                  Create a new family group to share wishlists with your loved ones.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Family Name</Label>
                  <Input
                    id="name"
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    placeholder="e.g., Smith Family"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newFamily.description}
                    onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
                    placeholder="A brief description of your family group"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={createFamily} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Family'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Families Grid */}
        {families.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No families yet</h3>
              <p className="text-gray-600 mb-4">Create your first family to start sharing wishlists</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {families.map((family) => (
              <Card key={family.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {family.name}
                        {family.membershipRole === 'ADMIN' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {family.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Badge variant={family.membershipRole === 'ADMIN' ? 'default' : 'secondary'}>
                      {family.membershipRole}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Members: {family.members?.length || 0}</span>
                      <span>Joined: {new Date(family.joinedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/families/${family.id}`)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      
                      {family.membershipRole === 'ADMIN' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => getInviteInfo(family.id)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Share Family Invite</DialogTitle>
                              <DialogDescription>
                                Share the invite code or link with family members to let them join.
                              </DialogDescription>
                            </DialogHeader>
                            {inviteInfo && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Invite Code</Label>
                                  <div className="flex gap-2 mt-1">
                                    <Input
                                      value={inviteInfo.family.inviteCode}
                                      readOnly
                                      className="font-mono"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyInviteCode(inviteInfo.family.inviteCode)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Invite Link</Label>
                                  <div className="flex gap-2 mt-1">
                                    <Input
                                      value={inviteInfo.inviteLink}
                                      readOnly
                                      className="text-sm"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyInviteLink(inviteInfo.inviteLink)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="text-sm text-gray-600">
                                    {inviteInfo.family.memberCount} / 20 members
                                  </span>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(FamiliesPage) 