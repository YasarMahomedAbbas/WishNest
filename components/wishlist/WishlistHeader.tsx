"use client"

import { LogOut, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { User } from "./types"

interface WishlistHeaderProps {
  user: User
  onLogout: () => Promise<void>
}

export function WishlistHeader({ user, onLogout }: WishlistHeaderProps) {
  const handleLogout = async () => {
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="icon-brand">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl text-brand">
          WishNest
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
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
            <DropdownMenuItem onClick={() => window.location.href = '/families'} className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>Manage Family</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 