"use client"

import { useState, useEffect } from 'react'
import { UserPlus, Eye, EyeOff, RefreshCw, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface AddMemberDialogProps {
  familyId: string
  onMemberAdded: () => void
}

export function AddMemberDialog({ familyId, onMemberAdded }: AddMemberDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(true)

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const refreshPassword = () => {
    const newPassword = generatePassword()
    setNewMember({ ...newMember, password: newPassword })
  }

  // Auto-generate password when dialog opens
  useEffect(() => {
    if (isOpen && !newMember.password) {
      const initialPassword = generatePassword()
      setNewMember({ ...newMember, password: initialPassword })
    }
  }, [isOpen])

  const createFamilyMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.password.trim()) {
      toast({
        title: 'Error',
        description: 'Name, email, and password are required',
        variant: 'destructive'
      })
      return
    }

    setIsCreating(true)
    
    try {
      const response = await fetch('/api/families/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          name: newMember.name.trim(),
          email: newMember.email.trim(),
          password: newMember.password.trim()
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `${newMember.name} has been added to the family!`,
          duration: 5000
        })
        
        setNewMember({ name: '', email: '', password: '' })
        setIsOpen(false)
        onMemberAdded()
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to create family member',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create family member',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="interactive-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md surface-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Add Family Member</DialogTitle>
          <DialogDescription className="text-slate-600">
            Create a new account for a family member. They'll be able to log in with the temporary password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="memberName" className="text-slate-700 font-medium">Full Name</Label>
            <Input
              id="memberName"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="e.g., John Smith"
              className="mt-1 field-input"
            />
          </div>
          <div>
            <Label htmlFor="memberEmail" className="text-slate-700 font-medium">Email Address</Label>
            <Input
              id="memberEmail"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="john@example.com"
              className="mt-1 field-input"
            />
          </div>
          <div>
            <Label htmlFor="memberPassword" className="text-slate-700 font-medium">Temporary Password</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Input
                  id="memberPassword"
                  type={showPassword ? "text" : "password"}
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="Password"
                  className="field-input pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refreshPassword}
                className="interactive-secondary"
                title="Generate new password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(newMember.password)}
                className="interactive-secondary"
                title="Copy password"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Share this temporary password with the new member so they can log in. They can change it later in their account settings.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1 interactive-secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={createFamilyMember} 
              disabled={isCreating}
              className="flex-1 interactive-primary"
            >
              {isCreating ? 'Creating...' : 'Add Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 