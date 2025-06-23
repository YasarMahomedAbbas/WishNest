import { Button } from "@/components/ui/button"
import { WishlistItem as WishlistItemComponent } from "./WishlistItem"
import { EmptyWishlist } from "./EmptyWishlist"
import { WishlistItem, User } from "./types"

interface WishlistGridProps {
  items: WishlistItem[]
  displayedItems: WishlistItem[]
  user: User
  hasMoreItems: boolean
  totalCount: number
  onShowMore: () => void
  onAddItem: () => void
}

export function WishlistGrid({ 
  items, 
  displayedItems, 
  user, 
  hasMoreItems, 
  totalCount, 
  onShowMore, 
  onAddItem 
}: WishlistGridProps) {
  return (
    <div className="card-default">
      <div className="flex items-center gap-4 mb-8">
        <div className="icon-brand w-16 h-16">
          <span className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{user?.name}'s Wishlist</h2>
          <p className="text-slate-600">
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyWishlist onAddItem={onAddItem} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((item) => (
              <WishlistItemComponent key={item.id} item={item} />
            ))}
          </div>

          {/* Show More Button */}
          {hasMoreItems && (
            <div className="text-center mt-8">
              <Button
                onClick={onShowMore}
                variant="outline"
                size="lg"
                className="rounded-xl border-slate-300 hover:bg-slate-50"
              >
                Show More Items ({totalCount - displayedItems.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 