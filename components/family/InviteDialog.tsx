"use client"

import { useState } from 'react'
import { Share2, Copy, RefreshCw } from 'lucide-react'
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
import { type InviteInfo } from './types'

interface InviteDialogProps {
  familyId: string
  onInviteCodeRegenerated: () => void
}

export function InviteDialog({ familyId, onInviteCodeRegenerated }: InviteDialogProps) {
  const { toast } = useToast()
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)

  const getInviteInfo = async () => {
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

  const regenerateInviteCode = async () => {
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
        onInviteCodeRegenerated()
        getInviteInfo() // Refresh invite info
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex-1 interactive-primary"
          onClick={getInviteInfo}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg surface-card">
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
                  className="font-mono field-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteCode(inviteInfo.family.inviteCode)}
                  className="interactive-secondary"
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
                  className="text-sm field-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(inviteInfo.inviteLink)}
                  className="interactive-secondary"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-between pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">
                {inviteInfo.family.memberCount} / 20 members
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="interactive-secondary">
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
                    <AlertDialogAction onClick={regenerateInviteCode}>
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
  )
} 