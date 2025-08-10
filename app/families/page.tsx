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
  JoinFamilyDialog,
  type Family
} from '@/components/family'
  import CategoryManager from '@/components/family/CategoryManager'

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
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="space-y-4 mb-6 sm:mb-8">
          {/* Back button and title row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Back to Wishlist</span>
                <span className="xs:hidden">Back</span>
              </Button>
              <div className="icon-brand shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl text-brand">My Family</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Manage your family group and invite members</p>
              </div>
            </div>
            
            {/* Action buttons - hidden on mobile, shown on larger screens */}
            <div className="hidden sm:flex gap-2 shrink-0">
              {!family && (
                <>
                  <FamilyCreationDialog onFamilyCreated={fetchFamily} />
                  <JoinFamilyDialog onFamilyJoined={fetchFamily} />
                </>
              )}
            </div>
          </div>
          
          {/* Mobile action buttons */}
          <div className="flex flex-col xs:flex-row gap-2 sm:hidden">
            {!family && (
              <>
                <FamilyCreationDialog onFamilyCreated={fetchFamily} />
                <JoinFamilyDialog onFamilyJoined={fetchFamily} />
              </>
            )}
          </div>
          
          {/* Mobile subtitle */}
          <p className="text-sm text-slate-600 sm:hidden">Manage your family group and invite members</p>
        </div>

        {/* Family Details or Create Family */}
        {!family ? (
          <Card className="text-center py-8 sm:py-12 surface-card">
            <CardContent className="px-4 sm:px-6">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No family yet</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">Create your family to start sharing wishlists with your loved ones</p>
              <div className="flex flex-col xs:flex-row gap-3 justify-center max-w-sm mx-auto">
                <FamilyCreationDialog onFamilyCreated={fetchFamily} />
                <JoinFamilyDialog onFamilyJoined={fetchFamily} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 sm:space-y-8">
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

            {/* Categories */}
            <CategoryManager familyId={family.id} />

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

        {/* Leave Family Section - Only shown when user has a family */}
        {family && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="text-center space-y-3">
              <h3 className="text-sm font-medium text-slate-500">Need to switch families?</h3>
              <div className="space-y-2">
                <JoinFamilyDialog 
                  currentFamilyName={family.name}
                  onFamilyJoined={fetchFamily}
                />
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You can join a different family using an invite code. This will remove you from your current family.
                </p>
              </div>
            </div>
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