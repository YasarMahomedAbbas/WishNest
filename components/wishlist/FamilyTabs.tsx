"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, User, Crown, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddItemDialog } from "./AddItemDialog"
import type { Category, WishlistItem } from "./types"

interface FamilyMember {
  id: string
  name: string
  role?: 'admin' | 'member'
  avatar?: string
}

interface FamilyTabsProps {
  familyMembers: FamilyMember[]
  currentUserId: string
  selectedUserId: string
  onUserChange: (userId: string) => void
  children: React.ReactNode
  itemCounts?: { [userId: string]: number }
  totalItemCount?: number
  categories?: Category[]
  onItemAdded?: (item: WishlistItem) => void
}

export function FamilyTabs({ 
  familyMembers, 
  currentUserId, 
  selectedUserId, 
  onUserChange,
  children,
  itemCounts = {},
  totalItemCount = 0,
  categories = [],
  onItemAdded
}: FamilyTabsProps) {
  // Find current user to get their role
  const currentUser = familyMembers.find(member => member.id === currentUserId)
  
  // Create tab list with "Family" first, then "My Items", then other family members
  const allTabs = [
    { 
      id: "all", 
      name: "Family Wishlist", 
      isOwn: false, 
      icon: <Users className="w-4 h-4" />,
      description: "View everyone's items",
      avatar: undefined,
      role: undefined
    },
    { 
      id: currentUserId, 
      name: "My Items", 
      isOwn: true, 
      icon: <Star className="w-4 h-4" />,
      description: "Your personal wishlist",
      avatar: undefined,
      role: currentUser?.role
    },
    ...familyMembers
      .filter(member => member.id !== currentUserId)
      .map(member => ({ 
        id: member.id, 
        name: member.name, 
        isOwn: false,
        icon: null,
        description: `${member.name}'s wishlist`,
        avatar: member.avatar,
        role: member.role
      }))
  ]

  const getRoleIcon = (role?: string) => {
    if (role === 'admin') {
      return <Crown className="w-3 h-3 text-yellow-500" />
    }
    return null
  }

  const getTabStyles = (tab: any, isActive: boolean) => {
    const baseStyles = "group relative inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg min-w-0 flex-shrink-0"
    
    if (isActive) {
      return cn(baseStyles, "interactive-primary shadow-lg shadow-red-500/25 !text-white")
    } else {
      return cn(baseStyles, "interactive-secondary")
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedUserId} onValueChange={onUserChange} className="w-full">
        {/* Enhanced tab navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-secondary rounded-2xl blur-sm"></div>
          <TabsList className="surface-elevated relative inline-flex h-auto items-center justify-start w-full overflow-x-auto text-muted-foreground">
            {allTabs.map((tab) => {
              const isActive = selectedUserId === tab.id
              
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={getTabStyles(tab, isActive)}
                  title={tab.description}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Icon or Avatar */}
                    {tab.avatar ? (
                      <Avatar className="w-5 h-5 border border-white/20">
                        <AvatarImage src={tab.avatar} alt={tab.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-accent to-secondary text-foreground">
                          {tab.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : tab.icon ? (
                      <div className="flex-shrink-0">
                        {tab.icon}
                      </div>
                    ) : (
                      <User className="w-4 h-4 flex-shrink-0" />
                    )}
                    
                    {/* Name - responsive visibility */}
                    <span className="truncate hidden sm:inline">
                      {tab.name}
                    </span>
                    <span className="truncate sm:hidden text-xs">
                      {tab.id === 'all' ? 'All' : tab.id === currentUserId ? 'Me' : tab.name.split(' ')[0]}
                    </span>
                    
                    {/* Role indicator */}
                    {getRoleIcon(tab.role)}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-60"></div>
                    )}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
          
          {/* Mobile scroll hint */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-accent/50 to-transparent pointer-events-none rounded-r-2xl sm:hidden"></div>
        </div>
        
        {/* Enhanced content area */}
        <div className="mt-8">
          {/* Show current selection info */}
          <div className="mb-6">
            {selectedUserId === 'all' ? (
              <div className="flex-between">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="icon-container bg-blue-50">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-heading text-foreground">Family Wishlist</h3>
                    <p className="text-caption">
                      {totalItemCount === 1 ? '1 item' : `${totalItemCount} items`} from all family members
                    </p>
                  </div>
                </div>
                {/* Add Item Button for family view */}
                {categories && onItemAdded && (
                  <AddItemDialog 
                    categories={categories} 
                    onItemAdded={onItemAdded}
                  />
                )}
              </div>
            ) : selectedUserId === currentUserId ? (
              <div className="flex-between">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="icon-container bg-red-50">
                    <Star className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-heading text-foreground">My Wishlist</h3>
                    <p className="text-caption">
                      {itemCounts[currentUserId] === 1 ? '1 item' : `${itemCounts[currentUserId] || 0} items`} in your personal wishlist
                    </p>
                  </div>
                </div>
                {/* Add Item Button for personal view */}
                {categories && onItemAdded && (
                  <AddItemDialog 
                    categories={categories} 
                    onItemAdded={onItemAdded}
                  />
                )}
              </div>
            ) : (
              (() => {
                const selectedMember = familyMembers.find(m => m.id === selectedUserId)
                const memberItemCount = itemCounts[selectedUserId] || 0
                return (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedMember?.avatar} alt={selectedMember?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-foreground">
                        {selectedMember?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{selectedMember?.name}'s Wishlist</h3>
                        {getRoleIcon(selectedMember?.role)}
                      </div>
                      <p className="text-sm text-slate-500">
                        {memberItemCount === 1 ? '1 item' : `${memberItemCount} items`} in their wishlist
                      </p>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
          
          {children}
        </div>
      </Tabs>
    </div>
  )
} 