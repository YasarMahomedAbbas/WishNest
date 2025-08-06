import { Button } from "@/components/ui/button"
import { WishlistItem as WishlistItemComponent } from "./WishlistItem"
import { EmptyWishlist } from "./EmptyWishlist"
import { WishlistItem, User, Category } from "./types"

interface WishlistGridProps {
  items: WishlistItem[]
  displayedItems: WishlistItem[]
  user: User
  hasMoreItems: boolean
  totalCount: number
  onShowMore: () => void
  onAddItem: () => void
  selectedUserId?: string
  familyMembers: {id: string, name: string}[]
  categories: Category[]
  onItemAdded: (item: WishlistItem) => void
  onItemUpdated?: (updatedItem: WishlistItem) => void
  onItemDeleted?: (itemId: string) => void
}

export function WishlistGrid({ 
  items, 
  displayedItems, 
  user, 
  hasMoreItems, 
  totalCount, 
  onShowMore, 
  onAddItem,
  selectedUserId,
  familyMembers,
  categories,
  onItemAdded,
  onItemUpdated,
  onItemDeleted
}: WishlistGridProps) {
  return (
    <div className="card-default">
      {items.length === 0 ? (
        <EmptyWishlist onAddItem={onAddItem} categories={categories} onItemAdded={onItemAdded} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((item) => (
              <WishlistItemComponent key={item.id} item={item} currentUser={user} categories={categories} onItemUpdated={onItemUpdated} onItemDeleted={onItemDeleted} />
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