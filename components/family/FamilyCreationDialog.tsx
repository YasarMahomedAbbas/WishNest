"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface FamilyCreationDialogProps {
  onFamilyCreated: () => void
}

export function FamilyCreationDialog({ onFamilyCreated }: FamilyCreationDialogProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [newFamily, setNewFamily] = useState({ name: '', description: '' })

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
        onFamilyCreated()
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create My Family
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg surface-card">
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
              className="mt-1 field-input"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-slate-700 font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newFamily.description}
              onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
              placeholder="A brief description of your family group"
              className="mt-1 field-input resize-none"
              rows={3}
            />
          </div>
          <Button 
            onClick={createFamily} 
            disabled={isCreating}
            className="w-full interactive-primary"
          >
            {isCreating ? 'Creating...' : 'Create My Family'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 