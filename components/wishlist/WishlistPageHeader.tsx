import { Gift } from "lucide-react"

export function WishlistPageHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="icon-brand">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl text-brand">
          My Wishlist
        </h1>
      </div>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        Create and manage your personal wishlist. Share your dreams and make gift-giving easier for everyone.
      </p>
    </div>
  )
} 