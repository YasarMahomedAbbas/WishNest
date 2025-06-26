"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Category } from "./types"

interface WishlistFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  priceRange: number[]
  onPriceRangeChange: (range: number[]) => void
  categories: Category[]
  onResetFilters: () => void
  displayedCount: number
  totalCount: number
  // Props for display purposes only (tabs handle filtering now)
  familyMembers: {id: string, name: string}[]
  currentUserId: string
}

export function WishlistFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  categories,
  onResetFilters,
  displayedCount,
  totalCount,
  familyMembers,
  currentUserId
}: WishlistFiltersProps) {
  return (
    <div className="surface-card mb-8 p-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search wishlist items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="field-with-icon"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32 field-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-32 field-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32 field-input">
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
              <Button variant="outline" className="rounded-xl">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-2xl">
              <div className="space-y-4">
                <div>
                  <Label className="text-body font-medium">Price Range</Label>
                  <div className="mt-2">
                    <Slider
                      value={priceRange}
                      onValueChange={onPriceRangeChange}
                      max={300}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex-between text-caption mt-1">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={onResetFilters} className="w-full rounded-xl">
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results Summary */}
      <div className="content-section">
        <p className="text-caption">
          Showing {displayedCount} of {totalCount} wishlist items
        </p>
      </div>
    </div>
  )
} 