"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Category = {
  id: string
  name: string
  description: string | null
  familyId: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryManagerProps {
  familyId: string
}

export function CategoryManager({ familyId }: CategoryManagerProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [familyId])

  async function load() {
    try {
      setLoading(true)
      const response = await fetch(`/api/families/${familyId}/categories`)
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories(data.data.categories)
      } else {
        throw new Error(data.error?.message || 'Failed to load categories')
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function create() {
    if (!newName.trim()) {
      toast({ title: 'Validation', description: 'Name is required', variant: 'destructive' })
      return
    }
    try {
      setCreating(true)
      const response = await fetch(`/api/families/${familyId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || undefined }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories((prev) => [...prev, data.data.category].sort((a, b) => a.name.localeCompare(b.name)))
        setNewName('')
        setNewDescription('')
        toast({ title: 'Created', description: 'Category created' })
      } else {
        throw new Error(data.error?.message || 'Failed to create category')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create category', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDescription(cat.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
  }

  async function saveEdit() {
    if (!editingId) return
    if (!editName.trim()) {
      toast({ title: 'Validation', description: 'Name is required', variant: 'destructive' })
      return
    }
    try {
      const response = await fetch(`/api/families/${familyId}/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || undefined }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? data.data.category : c)).sort((a, b) => a.name.localeCompare(b.name)))
        cancelEdit()
        toast({ title: 'Saved', description: 'Category updated' })
      } else {
        throw new Error(data.error?.message || 'Failed to update category')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update category', variant: 'destructive' })
    }
  }

  async function remove(cat: Category) {
    try {
      setDeletingId(cat.id)
      const response = await fetch(`/api/families/${familyId}/categories/${cat.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id))
        toast({ title: 'Deleted', description: 'Category deleted' })
      } else {
        throw new Error(data.error?.message || 'Failed to delete category')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete category', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="surface-card">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div>
          <h3 className="text-heading">Categories</h3>
          <p className="text-caption">Manage your family's wishlist categories</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
          <div>
            <Label htmlFor="newName">Name</Label>
            <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Books" className="field-input" />
          </div>
          <div>
            <Label htmlFor="newDesc">Description</Label>
            <Input id="newDesc" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional" className="field-input" />
          </div>
          <Button onClick={create} disabled={creating} className="btn-primary mt-2 sm:mt-0">Add</Button>
        </div>

        <div className="divide-y border rounded-md">
          {loading ? (
            <div className="p-4 text-sm text-slate-600">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">No categories yet</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                {editingId === cat.id ? (
                  <div className="flex-1 grid gap-3 sm:grid-cols-[1fr_1fr]">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="field-input" />
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="field-input" />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{cat.name}</div>
                    <div className="text-sm text-slate-600 truncate">{cat.description || '—'}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  {editingId === cat.id ? (
                    <>
                      <Button size="sm" className="btn-primary" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="secondary" className="interactive-secondary" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" className="interactive-secondary" onClick={() => startEdit(cat)}>Edit</Button>
                      <Button size="sm" variant="outline" className="btn-danger" disabled={deletingId === cat.id} onClick={() => remove(cat)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryManager

