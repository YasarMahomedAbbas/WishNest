"use client"

import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface ResetPasswordDialogProps {
  user: { id: string, name: string } | null
  familyId: string
  isOpen: boolean
  onClose: () => void
  onPasswordReset: () => void
}

export function ResetPasswordDialog({ 
  user, 
  familyId, 
  isOpen, 
  onClose, 
  onPasswordReset 
}: ResetPasswordDialogProps) {
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmNewPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false })

  const generatePasswordForReset = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each required character type
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26))
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26))
    password += '0123456789'.charAt(Math.floor(Math.random() * 10))
    password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8))
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const resetMemberPassword = async () => {
    if (!user) return
    
    try {
      setIsResetting(true)
      
      const response = await fetch(`/api/families/${familyId}/members/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetPasswordData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: `Password reset successfully for ${user.name}`
        })
        handleClose()
        onPasswordReset()
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to reset password',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive'
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleClose = () => {
    setResetPasswordData({ newPassword: '', confirmNewPassword: '' })
    setShowPasswords({ new: false, confirm: false })
    onClose()
  }

  // Auto-generate password when user is set
  useEffect(() => {
    if (user && isOpen) {
      const generatedPassword = generatePasswordForReset()
      setResetPasswordData({ 
        newPassword: generatedPassword, 
        confirmNewPassword: generatedPassword 
      })
    }
  }, [user, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg surface-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Reset Password</DialogTitle>
          <DialogDescription className="text-slate-600">
            Set a new password for {user?.name}. They will need to use this password to log in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-new-password" className="text-slate-700 font-medium">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="reset-new-password"
                type={showPasswords.new ? "text" : "password"}
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                className="pr-20 field-input"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPassword = generatePasswordForReset()
                    setResetPasswordData({ newPassword, confirmNewPassword: newPassword })
                  }}
                  className="h-7 px-2 text-xs"
                  title="Generate new password"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPasswords.new ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reset-confirm-password" className="text-slate-700 font-medium">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                id="reset-confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={resetPasswordData.confirmNewPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmNewPassword: e.target.value })}
                className="pr-10 field-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-xl">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> Make sure to share this new password with {user?.name} securely. 
              They should change it in their account settings after logging in.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 interactive-secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={resetMemberPassword} 
              disabled={isResetting || !resetPasswordData.newPassword || resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword}
              className="flex-1 interactive-primary"
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 