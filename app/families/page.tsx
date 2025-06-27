"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/PageLayout'
import {
  FamilyCreationDialog,
  FamilyOverviewCard,
  FamilyMembersList,
  InviteDialog,
  AddMemberDialog,
  ResetPasswordDialog,
  ConfirmationDialog,
  type Family
} from '@/components/family'

function FamiliesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetPasswordUser, setResetPasswordUser] = useState<{ id: string, name: string } | null>(null)
  
  // Confirmation dialog states
  const [confirmAction, setConfirmAction] = useState<{
    type: 'promote' | 'demote' | 'remove' | 'delete' | null
    user: { id: string, name: string } | null
  }>({ type: null, user: null })

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

  const handleConfirmAction = (type: 'promote' | 'demote' | 'remove' | 'delete', userId: string, userName: string) => {
    setConfirmAction({ type, user: { id: userId, name: userName } })
  }

  const executeConfirmedAction = async () => {
    if (!confirmAction.user || !confirmAction.type || !family) return

    const { id: userId, name: userName } = confirmAction.user

    try {
      let response: Response
      
      switch (confirmAction.type) {
        case 'promote':
          response = await fetch(`/api/families/${family.id}/members/${userId}/promote`, {
            method: 'POST'
          })
          break
        case 'demote':
          response = await fetch(`/api/families/${family.id}/members/${userId}/demote`, {
            method: 'POST'
          })
          break
        case 'remove':
          response = await fetch(`/api/families/${family.id}/members/${userId}`, {
            method: 'DELETE'
          })
          break
        case 'delete':
          response = await fetch(`/api/families/${family.id}/members/${userId}?deleteAccount=true`, {
            method: 'DELETE'
          })
          break
        default:
          return
      }
      
      const data = await response.json()
      
      if (data.success) {
        const actionMessages = {
          promote: `${userName} has been promoted to admin`,
          demote: `${userName} has been demoted to member`,
          remove: `${userName} has been removed from the family`,
          delete: `${userName}'s account has been deleted completely`
        }
        
        toast({
          title: 'Success',
          description: actionMessages[confirmAction.type]
        })
        fetchFamily()
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || `Failed to ${confirmAction.type} family member`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${confirmAction.type} family member`,
        variant: 'destructive'
      })
    } finally {
      setConfirmAction({ type: null, user: null })
    }
  }

  const handleResetPassword = (userId: string, userName: string) => {
    setResetPasswordUser({ id: userId, name: userName })
  }

  const handleCloseResetPassword = () => {
    setResetPasswordUser(null)
  }

  const handlePasswordReset = () => {
    // Refresh family data to reflect any changes
    fetchFamily()
  }

  if (loading) {
    return <LoadingPage message="Loading families..." />
  }

  return (
    <div className="app-page">
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
            <div className="icon-brand">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-brand">My Family</h1>
              <p className="text-sm text-slate-600">Manage your family group and invite members</p>
            </div>
          </div>
          
          {!family && <FamilyCreationDialog onFamilyCreated={fetchFamily} />}
        </div>

        {/* Family Details or Create Family */}
        {!family ? (
          <Card className="text-center py-12 surface-card">
            <CardContent>
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No family yet</h3>
              <p className="text-slate-600 mb-4">Create your family to start sharing wishlists with your loved ones</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Family Overview Card */}
            <FamilyOverviewCard 
              family={family}
              onAdvancedSettings={() => router.push(`/families/${family.id}`)}
            >
              <InviteDialog 
                familyId={family.id}
                onInviteCodeRegenerated={fetchFamily}
              />
            </FamilyOverviewCard>

            {/* Family Members */}
            <FamilyMembersList
              family={family}
              currentUserId={user?.id}
              onResetPassword={handleResetPassword}
              onConfirmAction={handleConfirmAction}
            >
              <AddMemberDialog 
                familyId={family.id}
                onMemberAdded={fetchFamily}
              />
            </FamilyMembersList>
          </div>
        )}

        {/* Reset Password Dialog */}
        <ResetPasswordDialog
          user={resetPasswordUser}
          familyId={family?.id || ''}
          isOpen={!!resetPasswordUser}
          onClose={handleCloseResetPassword}
          onPasswordReset={handlePasswordReset}
        />

        {/* Unified Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={!!confirmAction.type}
          type={confirmAction.type}
          userName={confirmAction.user?.name || null}
          onConfirm={executeConfirmedAction}
          onCancel={() => setConfirmAction({ type: null, user: null })}
        />
      </div>
    </div>
  )
}

export default withAuth(FamiliesPage) 