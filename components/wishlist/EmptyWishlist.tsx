import { Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyWishlistProps {
  onAddItem: () => void
}

export function EmptyWishlist({ onAddItem }: EmptyWishlistProps) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-accent to-secondary rounded-full flex-center">
        <Heart className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-heading text-muted-foreground mb-2">No items in your wishlist yet</h3>
      <p className="text-caption mb-4">Start adding items you'd love to receive as gifts!</p>
      <Button 
        onClick={onAddItem}
        className="btn-primary"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Item
      </Button>
    </div>
  )
} 