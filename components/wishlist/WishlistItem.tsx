import { ExternalLink, ShoppingCart, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { AddItemDialog } from "./AddItemDialog"
import { useFamily } from "@/contexts/FamilyContext"
import { formatPrice } from "@/lib/currency-utils"

import type { WishlistItem, User, Category } from "./types"

interface WishlistItemProps {
  item: WishlistItem
  currentUser: User
  categories: Category[]
  onItemUpdated?: (updatedItem: WishlistItem) => void
  onItemDeleted?: (itemId: string) => void
}

export function WishlistItem({ item, currentUser, categories, onItemUpdated, onItemDeleted }: WishlistItemProps) {
  const { toast } = useToast()
  const { family } = useFamily()
  const [isLoading, setIsLoading] = useState(false)
  
  const isOwnItem = item.userId === currentUser.id
  const isReservedByCurrentUser = item.reservationDetails?.reservedBy === currentUser.id

  const getStatusBadge = (item: WishlistItem) => {
    // Show "Yours" badge for user's own items
    if (isOwnItem) {
      return <Badge variant="outline" className="status-reserved-by-me">Yours</Badge>
    }
    
    switch (item.status) {
      case "available":
        return <Badge variant="outline" className="status-available">Available</Badge>
      case "reserved":
        if (isReservedByCurrentUser) {
          return <Badge variant="outline" className="status-reserved-by-me">Reserved by You</Badge>
        }
        return <Badge variant="outline" className="status-reserved">Reserved</Badge>
      case "purchased":
        if (isReservedByCurrentUser) {
          return <Badge variant="outline" className="status-purchased-by-me">✓ Purchased by You</Badge>
        }
        return <Badge variant="outline" className="status-purchased">✓ Purchased</Badge>
      default:
        return <Badge variant="outline" className="status-available">Available</Badge>
    }
  }

  const handleReserve = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/wishlist-items/${item.id}/reserve`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item reserved successfully!",
        })
        
        // Update the item status locally instead of refreshing the page
        if (onItemUpdated) {
          const updatedItem = {
            ...item,
            status: 'reserved' as const,
            reservationDetails: {
              reservedBy: currentUser.id,
              reservedAt: new Date().toISOString()
            }
          }
          onItemUpdated(updatedItem)
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error?.message || "Failed to reserve item",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reserve item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReservation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/wishlist-items/${item.id}/reserve`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reservation cancelled successfully!",
        })
        
        // Update the item status locally instead of refreshing the page
        if (onItemUpdated) {
          const updatedItem = {
            ...item,
            status: 'available' as const,
            reservationDetails: undefined
          }
          onItemUpdated(updatedItem)
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error?.message || "Failed to cancel reservation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="wishlist-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="wishlist-card-title">
            {item.title}
          </CardTitle>
          {getStatusBadge(item)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {item.category.name}
          </Badge>
          {!isOwnItem && (
            <Badge variant="secondary" className="text-xs">
              {item.user.name}
            </Badge>
          )}
        </div>
        {item.description && (
          <CardDescription className="wishlist-card-description">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <span className="price-text text-3xl">
              {family ? formatPrice(item.price, family.currency) : `$${item.price?.toFixed(2) || '0.00'}`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl"
            >
              <a href={item.productUrl || ''} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </a>
            </Button>
            
            {/* Edit button for own items */}
            {isOwnItem && (
              <AddItemDialog
                categories={categories}
                editItem={item}
                onItemUpdated={onItemUpdated}
                onItemDeleted={onItemDeleted}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                }
              />
            )}
            
            {/* Reservation buttons for other people's items */}
            {!isOwnItem && (
              <>
                {(item.status === 'available' || !item.status) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleReserve}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Reserve
                  </Button>
                )}
                {item.status === 'reserved' && isReservedByCurrentUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReservation}
                    disabled={isLoading}
                    className="btn-danger"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="wishlist-card-footer">
          Added{" "}
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  )
} 