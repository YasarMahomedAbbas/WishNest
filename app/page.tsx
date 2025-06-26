"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth, withAuth } from "@/contexts/AuthContext"
import { PageLayout, LoadingPage } from "@/components/PageLayout"
import { useToast } from "@/hooks/use-toast"
import {
  WishlistHeader,
  WishlistPageHeader,
  WishlistFilters,
  WishlistGrid,
  FamilyTabs
} from "@/components/wishlist"
import type { WishlistItem, Category, Family } from "@/components/wishlist/types"

function FamilyWishlist() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>("") 
  const [selectedUser, setSelectedUser] = useState<string>("all") // New: for filtering by user
  const [familyMembers, setFamilyMembers] = useState<{id: string, name: string}[]>([]) // New: family members
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 300])
  const [sortBy, setSortBy] = useState("newest")
  const [itemsToShow, setItemsToShow] = useState(6)

  // Load user families and initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        
        // Load user families
        const familiesResponse = await fetch('/api/families/me')
        if (familiesResponse.ok) {
          const familiesData = await familiesResponse.json()
          setFamilies(familiesData.data.families || [])
          
          // Auto-select first family if available
          if (familiesData.data.families && familiesData.data.families.length > 0) {
            setSelectedFamily(familiesData.data.families[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
        toast({
          title: "Error",
          description: "Failed to load family data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadInitialData()
    }
  }, [user, toast])

  // Load family data when family is selected
  useEffect(() => {
    const loadFamilyData = async () => {
      if (!selectedFamily) return
      
      try {
        // Load categories and family members for the selected family
        const [categoriesResponse, familyMembersResponse] = await Promise.all([
          fetch(`/api/families/${selectedFamily}?includeCategories=true`),
          fetch(`/api/families/${selectedFamily}?includeMembers=true`)
        ])
        
        if (categoriesResponse.ok) {
          const familyData = await categoriesResponse.json()
          setCategories(familyData.data.family?.categories || [])
        }
        
        if (familyMembersResponse.ok) {
          const familyData = await familyMembersResponse.json()
          const members = familyData.data.family?.members?.map((member: any) => ({
            id: member.user.id,
            name: member.user.name
          })) || []
          setFamilyMembers(members)
        }
      } catch (error) {
        console.error('Failed to load family data:', error)
        toast({
          title: "Error",
          description: "Failed to load family data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadFamilyData()
  }, [selectedFamily, toast])

  // Load wishlist data when family or user filter changes
  useEffect(() => {
    const loadWishlistData = async () => {
      if (!selectedFamily) return
      
      try {
        // Load wishlist items for the selected family
        const wishlistResponse = await fetch(
          `/api/wishlists/${selectedFamily}?page=1&limit=100&includeReservations=true${selectedUser !== 'all' ? `&userId=${selectedUser}` : ''}`
        )
        
        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json()
          setWishlist(wishlistData.data.items || [])
        }
      } catch (error) {
        console.error('Failed to load wishlist data:', error)
        toast({
          title: "Error",
          description: "Failed to load wishlist data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadWishlistData()
  }, [selectedFamily, selectedUser, toast])

  const filteredAndSortedItems = useMemo(() => {
    let items = [...wishlist]

    // Search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter((item) => item.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((item) => item.category.name === categoryFilter)
    }

    // Price range filter
    items = items.filter((item) => {
      const price = item.price || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "price-low":
        items.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        items.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "title":
        items.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return items
  }, [wishlist, user?.id, searchQuery, statusFilter, categoryFilter, priceRange, sortBy])

  const displayedItems = filteredAndSortedItems.slice(0, itemsToShow)
  const hasMoreItems = filteredAndSortedItems.length > itemsToShow

  const handleItemAdded = (newItem: WishlistItem) => {
    setWishlist(prev => [newItem, ...prev])
  }

  const handleItemUpdated = (updatedItem: WishlistItem) => {
    if (!updatedItem) {
      console.error('updatedItem is undefined!')
      return
    }
    setWishlist(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ))
  }

  const handleItemDeleted = (deletedItemId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== deletedItemId))
  }

  // Calculate item counts per user
  const itemCounts = useMemo(() => {
    const counts: { [userId: string]: number } = {}
    wishlist.forEach(item => {
      counts[item.user.id] = (counts[item.user.id] || 0) + 1
    })
    return counts
  }, [wishlist])

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setPriceRange([0, 300])
    setSortBy("newest")
    setItemsToShow(6)
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <PageLayout>
      <WishlistHeader user={user!} onLogout={logout} />
      
      <div className="space-y-8">
        <WishlistPageHeader />

        <FamilyTabs
          familyMembers={familyMembers}
          currentUserId={user?.id || ""}
          selectedUserId={selectedUser}
          onUserChange={setSelectedUser}
          itemCounts={itemCounts}
          totalItemCount={wishlist.length}
          categories={categories}
          onItemAdded={handleItemAdded}
        >
          <WishlistFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            categories={categories}
            onResetFilters={resetFilters}
            displayedCount={displayedItems.length}
            totalCount={filteredAndSortedItems.length}
            familyMembers={familyMembers}
            currentUserId={user?.id || ""}
          />

          <WishlistGrid
            items={filteredAndSortedItems}
            displayedItems={displayedItems}
            user={user!}
            hasMoreItems={hasMoreItems}
            totalCount={filteredAndSortedItems.length}
            onShowMore={() => setItemsToShow(itemsToShow + 6)}
            onAddItem={() => {/* AddItemDialog has its own trigger button */}}
            selectedUserId={selectedUser}
            familyMembers={familyMembers}
            categories={categories}
            onItemAdded={handleItemAdded}
            onItemUpdated={handleItemUpdated}
            onItemDeleted={handleItemDeleted}
          />
        </FamilyTabs>
      </div>
    </PageLayout>
  )
}


// Export with authentication protection
export default withAuth(FamilyWishlist)
