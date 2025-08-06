import { Heart } from "lucide-react"
import { AddItemDialog } from "./AddItemDialog"
import { Category, WishlistItem } from "./types"

interface EmptyWishlistProps {
  onAddItem: () => void
  categories: Category[]
  onItemAdded: (item: WishlistItem) => void
}

export function EmptyWishlist({ onAddItem, categories, onItemAdded }: EmptyWishlistProps) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-accent to-secondary rounded-full flex-center">
        <Heart className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-heading text-muted-foreground mb-2">No items in your wishlist yet</h3>
      <p className="text-caption mb-4">Start adding items you'd love to receive as gifts!</p>
      <AddItemDialog 
        categories={categories} 
        onItemAdded={onItemAdded}
      />
    </div>
  )
} 