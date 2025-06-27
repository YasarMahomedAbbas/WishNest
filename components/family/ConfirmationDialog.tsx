"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmationDialogProps {
  isOpen: boolean
  type: 'promote' | 'demote' | 'remove' | 'delete' | null
  userName: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({ 
  isOpen, 
  type, 
  userName, 
  onConfirm, 
  onCancel 
}: ConfirmationDialogProps) {
  const getDialogContent = () => {
    switch (type) {
      case 'promote':
        return {
          title: 'Promote to Admin',
          description: `Are you sure you want to promote ${userName} to admin? They will have full administrative privileges including the ability to manage family members and settings.`,
          action: 'Promote to Admin',
          className: 'bg-green-600 hover:bg-green-700'
        }
      case 'demote':
        return {
          title: 'Demote Admin',
          description: `Are you sure you want to demote ${userName} from admin to regular member? They will lose all administrative privileges including the ability to manage family members and settings.`,
          action: 'Demote to Member',
          className: 'bg-blue-600 hover:bg-blue-700'
        }
      case 'remove':
        return {
          title: 'Remove Family Member',
          description: `Are you sure you want to remove ${userName} from the family? They will no longer have access to family wishlists, but their account will remain active.`,
          action: 'Remove from Family',
          className: 'bg-orange-600 hover:bg-orange-700'
        }
      case 'delete':
        return {
          title: 'Delete Member Account',
          description: (
            <>
              <p>
                <strong>Warning:</strong> This will permanently delete {userName}'s account and all associated data.
              </p>
              <p>
                This includes their wishlists, reservations, and all other account information. This action cannot be undone.
              </p>
            </>
          ),
          action: 'Delete Account Permanently',
          className: 'bg-red-600 hover:bg-red-700'
        }
      default:
        return {
          title: '',
          description: '',
          action: '',
          className: ''
        }
    }
  }

  const content = getDialogContent()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {typeof content.description === 'string' ? (
              <p>{content.description}</p>
            ) : (
              content.description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={content.className}
          >
            {content.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 