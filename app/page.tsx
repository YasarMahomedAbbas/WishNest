"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  ExternalLink,
  Gift,
  DollarSign,
  Heart,
  Sparkles,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, withAuth } from "@/contexts/AuthContext"

interface WishlistItem {
  id: string
  title: string
  description: string
  price: number
  link: string
  addedBy: string
  addedDate: string
  status: "available" | "claimed" | "purchased"
  claimedBy?: string
  category?: string
}

const categories = ["Electronics", "Books", "Games", "Home", "Fashion", "Sports", "Other"]

function FamilyWishlist() {
  const { user, logout } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 300])
  const [sortBy, setSortBy] = useState("newest")
  const [itemsToShow, setItemsToShow] = useState(6)
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    price: "",
    link: "",
    category: "",
  })

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    let items = wishlist.filter((item) => item.addedBy === user?.id)

    // Search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter((item) => item.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((item) => item.category === categoryFilter)
    }

    // Price range filter
    items = items.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
        break
      case "oldest":
        items.sort((a, b) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime())
        break
      case "price-low":
        items.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        items.sort((a, b) => b.price - a.price)
        break
      case "title":
        items.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return items
  }, [wishlist, user?.id, searchQuery, statusFilter, categoryFilter, priceRange, sortBy])

  const displayedItems = filteredAndSortedItems.slice(0, itemsToShow)
  const hasMoreItems = filteredAndSortedItems.length > itemsToShow

  const handleAddItem = () => {
    if (newItem.title && newItem.price && newItem.link && user?.id) {
      const item: WishlistItem = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        price: Number.parseFloat(newItem.price),
        link: newItem.link,
        addedBy: user.id,
        addedDate: new Date().toISOString().split("T")[0],
        status: "available",
        category: newItem.category || "Other",
      }
      setWishlist([...wishlist, item])
      setNewItem({ title: "", description: "", price: "", link: "", category: "" })
      setIsAddingItem(false)
    }
  }

  const handleClaimItem = (itemId: string) => {
    if (!user?.id) return
    setWishlist(
      wishlist.map((item) => (item.id === itemId ? { ...item, status: "claimed", claimedBy: user.id } : item)),
    )
  }

  const handleUnclaimItem = (itemId: string) => {
    setWishlist(
      wishlist.map((item) => (item.id === itemId ? { ...item, status: "available", claimedBy: undefined } : item)),
    )
  }

  const getStatusBadge = (item: WishlistItem) => {
    switch (item.status) {
      case "available":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Available</Badge>
      case "claimed":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
            Claimed by {item.claimedBy === user?.id ? 'You' : 'Someone'}
          </Badge>
        )
      case "purchased":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">✓ Purchased</Badge>
      default:
        return null
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setPriceRange([0, 300])
    setSortBy("newest")
    setItemsToShow(6)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Authentication Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              WishNest
            </h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Create and manage your personal wishlist. Share your dreams and make gift-giving easier for everyone.
          </p>
        </div>

        {/* Add Item Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add to My Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">Add New Wishlist Item</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Add something special you'd love to receive
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="title" className="text-slate-700 font-medium">
                    Item Title
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
                  <Label htmlFor="category" className="text-slate-700 font-medium">
                    Category
                  </Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger className="border-slate-300 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description
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
                <div className="grid gap-3">
                  <Label htmlFor="price" className="text-slate-700 font-medium">
                    Price
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
                  <Label htmlFor="link" className="text-slate-700 font-medium">
                    Link
                  </Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://..."
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    className="border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddingItem(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddItem}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                >
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search your wishlist items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-300 rounded-xl"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 border-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 border-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-low">Price: Low</SelectItem>
                  <SelectItem value="price-high">Price: High</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filters */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-slate-300">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 rounded-2xl">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Price Range</Label>
                      <div className="mt-2">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={300}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-slate-500 mt-1">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={resetFilters} className="w-full rounded-xl">
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {displayedItems.length} of {filteredAndSortedItems.length} items in your wishlist
            </p>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{user?.name}'s Wishlist</h2>
              <p className="text-slate-600">
                {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No items in your wishlist yet</h3>
              <p className="text-slate-500 mb-4">Start adding items you'd love to receive as gifts!</p>
              <Button 
                onClick={() => setIsAddingItem(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-xl transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </CardTitle>
                        {getStatusBadge(item)}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
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
                          <span className="text-3xl font-bold text-emerald-600">${item.price.toFixed(2)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="rounded-xl border-slate-300 hover:bg-slate-50"
                        >
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Item
                          </a>
                        </Button>
                      </div>

                      <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
                        Added{" "}
                        {new Date(item.addedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Show More Button */}
              {hasMoreItems && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setItemsToShow(itemsToShow + 6)}
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-slate-300 hover:bg-slate-50"
                  >
                    Show More Items ({filteredAndSortedItems.length - itemsToShow} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Export with authentication protection
export default withAuth(FamilyWishlist)
