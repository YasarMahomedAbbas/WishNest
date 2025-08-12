"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, Loader2, Edit, Trash2, AlertCircle } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useFamily } from "@/contexts/FamilyContext"
import { getCurrencySymbol } from "@/lib/currency-utils"

import { Category, WishlistItem } from "./types"

interface NewItemData {
  title: string
  description: string
  price: string
  productUrl: string
  categoryId: string
}

interface ValidationErrors {
  title?: string
  price?: string
  productUrl?: string
  categoryId?: string
}

interface AddItemDialogProps {
  categories: Category[]
  onItemAdded?: (item: any) => void
  onItemUpdated?: (item: any) => void
  onItemDeleted?: (itemId: string) => void
  editItem?: WishlistItem
  trigger?: React.ReactNode
}

export function AddItemDialog({ categories, onItemAdded, onItemUpdated, onItemDeleted, editItem, trigger }: AddItemDialogProps) {
  const { toast } = useToast()
  const { family } = useFamily()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newItem, setNewItem] = useState<NewItemData>({
    title: "",
    description: "",
    price: "",
    productUrl: "",
    categoryId: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) {
      return "Item name is required"
    }
    if (title.trim().length < 2) {
      return "Item name must be at least 2 characters"
    }
    if (title.length > 100) {
      return "Item name must be 100 characters or less"
    }
    return undefined
  }

  const validatePrice = (price: string): string | undefined => {
    if (!price) return undefined // Price is optional
    
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) {
      return "Please enter a valid price"
    }
    if (numPrice < 0) {
      return "Price cannot be negative"
    }
    if (numPrice > 999999.99) {
      return "Price is too large"
    }
    // Check for valid decimal places
    if (price.includes('.') && price.split('.')[1]?.length > 2) {
      return "Price can only have up to 2 decimal places"
    }
    return undefined
  }

  const validateUrl = (url: string): string | undefined => {
    if (!url) return undefined // URL is optional
    
    try {
      new URL(url)
      return undefined
    } catch {
      return "Please enter a valid URL (e.g., https://example.com)"
    }
  }

  const validateCategory = (categoryId: string): string | undefined => {
    if (!categoryId) {
      return "Please select a category"
    }
    return undefined
  }

  // Real-time validation
  const validateField = (field: keyof NewItemData, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'title':
        error = validateTitle(value)
        break
      case 'price':
        error = validatePrice(value)
        break
      case 'productUrl':
        error = validateUrl(value)
        break
      case 'categoryId':
        error = validateCategory(value)
        break
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  // Handle input changes with validation
  const handleInputChange = (field: keyof NewItemData, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  // Check if form has any errors or required fields are empty
  const hasValidationErrors = (): boolean => {
    const currentErrors = {
      title: validateTitle(newItem.title),
      price: validatePrice(newItem.price),
      productUrl: validateUrl(newItem.productUrl),
      categoryId: validateCategory(newItem.categoryId)
    }
    
    return Object.values(currentErrors).some(error => error !== undefined)
  }

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editItem) {
      const itemData = {
        title: editItem.title || "",
        description: editItem.description || "",
        price: editItem.price ? editItem.price.toString() : "",
        productUrl: editItem.productUrl || "",
        categoryId: editItem.categoryId || "",
      }
      setNewItem(itemData)
      
      // Validate all fields when editing
      setErrors({
        title: validateTitle(itemData.title),
        price: validatePrice(itemData.price),
        productUrl: validateUrl(itemData.productUrl),
        categoryId: validateCategory(itemData.categoryId)
      })
    } else {
      setNewItem({
        title: "",
        description: "",
        price: "",
        productUrl: "",
        categoryId: "",
      })
      setErrors({})
    }
  }, [editItem, isOpen])

  const handleSubmit = async () => {
    // Final validation check
    if (hasValidationErrors()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before submitting.",
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
        setErrors({})
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

  const handleDelete = async () => {
    if (!editItem) return

    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/wishlist-items/${editItem.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onItemDeleted?.(editItem.id)
        toast({
          title: "Success",
          description: "Item deleted successfully!",
        })
        setIsOpen(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete item.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultTrigger = (
    <Button
      size="lg"
      className="btn-primary px-8 py-4 text-lg"
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
            <DialogTitle className="text-heading text-2xl">
              {editItem ? "Edit Wishlist Item" : "Add New Wishlist Item"}
            </DialogTitle>
            <DialogDescription className="text-caption">
              {editItem ? "Update your wishlist item details" : "Add something special you'd love to receive"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 overflow-y-auto flex-1 min-h-0 pr-4 -mr-4">
            <div className="grid gap-3">
              <Label htmlFor="title" className="text-body font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Wireless Headphones"
                value={newItem.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`field-input ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.title && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="categoryId" className="text-body font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newItem.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger className={`field-input ${errors.categoryId ? 'border-red-500 focus:border-red-500' : ''}`}>
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
              {errors.categoryId && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.categoryId}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="price" className="text-body font-medium">
                Price <span className="text-caption font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  {family ? getCurrencySymbol(family.currency) : '$'}
                </div>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`field-with-icon ${errors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.price}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="productUrl" className="text-body font-medium">
                URL <span className="text-caption font-normal">(Optional)</span>
              </Label>
              <Input
                id="productUrl"
                type="url"
                placeholder="https://..."
                value={newItem.productUrl}
                onChange={(e) => handleInputChange('productUrl', e.target.value)}
                className={`field-input ${errors.productUrl ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.productUrl && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.productUrl}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-body font-medium">
                Description <span className="text-caption font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us why you want this..."
                value={newItem.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="field-input resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex-between gap-3 flex-shrink-0 content-section">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              {editItem && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{editItem.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || hasValidationErrors()}
              className="btn-primary"
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