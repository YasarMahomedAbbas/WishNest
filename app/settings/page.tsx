"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { PageLayout, LoadingPage } from '@/components/PageLayout'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/me')
      const data = await response.json()
      
      if (data.success) {
        const userProfile = data.data.user
        setProfile(userProfile)
        setProfileData({
          name: userProfile.name
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        })
        fetchProfile()
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to update profile',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Password updated successfully'
        })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        })
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to update password',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive'
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (loading) {
    return <LoadingPage message="Loading settings..." />
  }

  return (
    <div className="app-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="icon-brand">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-brand">Account Settings</h1>
              <p className="text-sm text-slate-600">Manage your profile and security settings</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <Card className="rounded-2xl shadow-lg border border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-slate-600">
                Update your personal information and display name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        className="pl-10 bg-slate-50 border-slate-300 rounded-xl"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Display Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your display name"
                        className="pl-10 border-slate-300 rounded-xl"
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile || profileData.name === profile?.name}
                    className="btn-primary text-white px-6"
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card className="rounded-2xl shadow-lg border border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-slate-700 font-medium">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                        className="pl-10 pr-10 border-slate-300 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700 font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter your new password"
                        className="pl-10 pr-10 border-slate-300 rounded-xl"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword" className="text-slate-700 font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmNewPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10 border-slate-300 rounded-xl"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword}
                    className="btn-primary text-white px-6"
                  >
                    {isUpdatingPassword ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Update Password
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage) 