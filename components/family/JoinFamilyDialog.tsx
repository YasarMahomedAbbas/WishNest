"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface JoinFamilyDialogProps {
  currentFamilyName?: string
  onFamilyJoined?: () => void
}

export function JoinFamilyDialog({ currentFamilyName, onFamilyJoined }: JoinFamilyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/families/leave-and-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: data.data.message
        })
        setOpen(false)
        setInviteCode('')
        onFamilyJoined?.()
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
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleJoinFamily()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={currentFamilyName ? "ghost" : "outline"} 
          className={`gap-2 w-full xs:w-auto ${currentFamilyName ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden xs:inline">{currentFamilyName ? 'Switch Family' : 'Join Family'}</span>
          <span className="xs:hidden">{currentFamilyName ? 'Switch' : 'Join'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {currentFamilyName ? 'Switch to Another Family' : 'Join a Family'}
          </DialogTitle>
          <DialogDescription>
            {currentFamilyName 
              ? 'Enter an invite code to switch to a different family. You\'ll be removed from your current family.'
              : 'Enter an invite code to join a family group.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentFamilyName && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You'll be moved from <strong>{currentFamilyName}</strong> to the new family. 
                You'll need a new invite to return to your current family.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="Enter invite code..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="flex-col xs:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full xs:w-auto order-2 xs:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleJoinFamily}
            disabled={loading || !inviteCode.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full xs:w-auto order-1 xs:order-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {currentFamilyName ? 'Switching...' : 'Joining...'}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {currentFamilyName ? 'Switch Family' : 'Join Family'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}