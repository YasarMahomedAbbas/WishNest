"use client"

import { Crown, MoreVertical, UserMinus, Key, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Family, type FamilyMember } from './types'

interface FamilyMembersListProps {
  family: Family
  currentUserId: string | undefined
  onResetPassword: (userId: string, userName: string) => void
  onConfirmAction: (type: 'promote' | 'demote' | 'remove' | 'delete', userId: string, userName: string) => void
  children?: React.ReactNode // For the AddMemberDialog
}

export function FamilyMembersList({ 
  family, 
  currentUserId, 
  onResetPassword, 
  onConfirmAction,
  children 
}: FamilyMembersListProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
                  <div className="flex-between">
          <div>
            <CardTitle className="text-xl text-slate-900">Family Members</CardTitle>
            <CardDescription className="text-slate-600">
              Everyone who's part of your family group
            </CardDescription>
          </div>
          {family.membershipRole === 'ADMIN' && children}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {family.members?.map((member) => (
                         <div key={member.id} className="flex-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 interactive-primary rounded-full flex-center font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{member.user.name}</div>
                  <div className="text-sm text-slate-600">{member.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="rounded-xl">
                  {member.role}
                </Badge>
                {member.role === 'ADMIN' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                
                {/* Admin Actions Menu */}
                {family.membershipRole === 'ADMIN' && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">
                        Member Actions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Role Management */}
                      {member.role === 'ADMIN' ? (
                        <DropdownMenuItem 
                          onClick={() => onConfirmAction('demote', member.userId, member.user.name)}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Demote to Member
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem 
                            onClick={() => onResetPassword(member.userId, member.user.name)}
                            className="text-purple-600 focus:text-purple-600"
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onConfirmAction('promote', member.userId, member.user.name)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Promote to Admin
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Removal Actions */}
                      <DropdownMenuItem 
                        onClick={() => onConfirmAction('remove', member.userId, member.user.name)}
                        className="text-orange-600 focus:text-orange-600"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove from Family
                      </DropdownMenuItem>
                      
                      {member.role !== 'ADMIN' && (
                        <DropdownMenuItem 
                          onClick={() => onConfirmAction('delete', member.userId, member.user.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 