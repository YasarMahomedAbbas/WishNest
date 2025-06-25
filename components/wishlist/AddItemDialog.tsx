"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

import { Category, WishlistItem } from "./types"

interface NewItemData {
  title: string
  description: string
  price: string
  productUrl: string
  categoryId: string
}

interface AddItemDialogProps {
  categories: Category[]
  onItemAdded?: (item: any) => void
  onItemUpdated?: (item: any) => void
  editItem?: WishlistItem
  trigger?: React.ReactNode
}

export function AddItemDialog({ categories, onItemAdded, onItemUpdated, editItem, trigger }: AddItemDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newItem, setNewItem] = useState<NewItemData>({
    title: "",
    description: "",
    price: "",
    productUrl: "",
    categoryId: "",
  })

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editItem) {
      setNewItem({
        title: editItem.title || "",
        description: editItem.description || "",
        price: editItem.price ? editItem.price.toString() : "",
        productUrl: editItem.productUrl || "",
        categoryId: editItem.categoryId || "",
      })
    } else {
      setNewItem({
        title: "",
        description: "",
        price: "",
        productUrl: "",
        categoryId: "",
      })
    }
  }, [editItem, isOpen])

  const handleSubmit = async () => {
    if (!newItem.title || !newItem.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const url = editItem ? `/api/wishlist-items/${editItem.id}` : '/api/wishlist-items'
      const method = editItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description || undefined,
          price: newItem.price ? parseFloat(newItem.price) : undefined,
          productUrl: newItem.productUrl || undefined,
          categoryId: newItem.categoryId,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        
        if (editItem) {
          if (responseData.data?.item) {
            onItemUpdated?.(responseData.data.item)
            toast({
              title: "Success",
              description: "Item updated successfully!",
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to get updated item data",
              variant: "destructive",
            })
          }
        } else {
          if (responseData.data?.item) {
            onItemAdded?.(responseData.data.item)
            toast({
              title: "Success",
              description: "Item added to your wishlist!",
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to get new item data",
              variant: "destructive",
            })
          }
        }
        
        setNewItem({
          title: "",
          description: "",
          price: "",
          productUrl: "",
          categoryId: "",
        })
        setIsOpen(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || `Failed to ${editItem ? 'update' : 'add'} item.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Failed to ${editItem ? 'update' : 'add'} item:`, error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button
      size="lg"
      className="btn-brand px-8 py-4 text-lg"
    >
      <Plus className="w-6 h-6 mr-2" />
      Add to My Wishlist
    </Button>
  )

  return (
    <div className={editItem ? "inline-block" : "flex justify-center mb-8"}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] rounded-2xl flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {editItem ? "Edit Wishlist Item" : "Add New Wishlist Item"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {editItem ? "Update your wishlist item details" : "Add something special you'd love to receive"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 overflow-y-auto flex-1 min-h-0 pr-4 -mr-4">
            <div className="grid gap-3">
              <Label htmlFor="title" className="text-slate-700 font-medium">
                Name
              </Label>
              <Input
                id="title"
                placeholder="e.g., Wireless Headphones"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="categoryId" className="text-slate-700 font-medium">
                Category
              </Label>
              <Select
                value={newItem.categoryId}
                onValueChange={(value) => setNewItem({ ...newItem, categoryId: value })}
              >
                <SelectTrigger className="border-slate-300 rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="price" className="text-slate-700 font-medium">
                Price <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="pl-10 border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="productUrl" className="text-slate-700 font-medium">
                URL <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="productUrl"
                type="url"
                placeholder="https://..."
                value={newItem.productUrl}
                onChange={(e) => setNewItem({ ...newItem, productUrl: e.target.value })}
                className="border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description <span className="text-slate-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us why you want this..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="border-slate-300 rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-brand"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editItem ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  {editItem ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editItem ? "Update Item" : "Add Item"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 