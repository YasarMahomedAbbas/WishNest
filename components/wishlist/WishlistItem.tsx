import { ExternalLink, ShoppingCart, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

import type { WishlistItem, User } from "./types"

interface WishlistItemProps {
  item: WishlistItem
  currentUser: User
  onItemUpdated?: (updatedItem: WishlistItem) => void
}

export function WishlistItem({ item, currentUser, onItemUpdated }: WishlistItemProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const isOwnItem = item.userId === currentUser.id
  const isReservedByCurrentUser = item.reservationDetails?.reservedBy === currentUser.id

  // Debug logging
  console.log('WishlistItem Debug:', {
    itemId: item.id,
    title: item.title,
    status: item.status,
    isOwnItem,
    currentUserId: currentUser.id,
    itemUserId: item.userId,
    reservationDetails: item.reservationDetails
  })

  const getStatusBadge = (item: WishlistItem) => {
    switch (item.status) {
      case "available":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Available</Badge>
      case "reserved":
        if (isReservedByCurrentUser) {
          return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Reserved by You</Badge>
        }
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Reserved</Badge>
      case "purchased":
        if (isReservedByCurrentUser) {
          return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">✓ Purchased by You</Badge>
        }
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">✓ Purchased</Badge>
      default:
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Available</Badge>
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
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
          <CardDescription className="text-slate-600 line-clamp-3 leading-relaxed">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold text-emerald-600">${item.price?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-slate-300 hover:bg-slate-50"
            >
              <a href={item.productUrl || ''} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </a>
            </Button>
            
            {/* Edit button for own items */}
            {isOwnItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement edit functionality
                  toast({
                    title: "Edit Item",
                    description: "Edit functionality coming soon!",
                  })
                }}
                className="rounded-xl border-slate-300 hover:bg-slate-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
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
                    className="rounded-xl bg-purple-600 hover:bg-purple-700"
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
                    className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
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